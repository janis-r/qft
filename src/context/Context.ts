import {EventDispatcher} from "../eventDispatcher/EventDispatcher";
import {Injector} from "../injector/Injector";
import {ClassType, Type} from "../type";
import {ContextExtension} from "./data/ContextExtension";
import {ContextLifecycleEvent} from "./event/ContextLifecycleEvent";
import {isModuleConfig, ModuleConfig} from "../metadata/data/ModuleConfig";
import {metadata} from "../metadata/metadata";
import {ContextModuleEvent} from "./event/ContextModuleEvent";
import {referenceToString} from "../util/StringUtil";
import {InjectionConfig} from "../metadata/data/InjectionConfig";

/**
 * Application context representation class - a hosting environment for application or its sub context
 * TODO: Add handling of child and parent contexts in this class
 */
export class Context extends EventDispatcher {

    private _initialized: boolean = false;
    private _destroyed: boolean = false;

    private extensions = new Set<Type<ContextExtension>>();
    private extensionInstances = new Set<ContextExtension>();

    private modules: (Type | ModuleConfig)[] = [];
    private moduleMetadata = new Map<Type | ModuleConfig, ModuleConfig>();

    /**
     * @private
     */
    constructor() {
        super();
    }

    //--------------------------
    //  Public properties
    //--------------------------

    /**
     * Injector instance used within current Context
     * @type {Injector}
     */
    readonly injector = new Injector();

    /**
     * Whether Context is initialized.
     * Extension mappings and modules should be added only whilst Context is not initialized.
     * @returns {boolean}
     */
    get initialized(): boolean {
        return this._initialized;
    }

    /**
     * Whether context is destroyed and thus unusable
     * @return {boolean}
     */
    get destroyed(): boolean {
        return this._destroyed;
    }

    /**
     * Install Context extensions
     * @param extension A single entry or list of Type<ContextExtension> entries
     * @returns {Context} Current context operation is performed on
     */
    install(...extension: Type<ContextExtension>[]): this {
        if (this._initialized) {
            throw new Error("Installation of extensions is not permitted as context is already initialized");
        }

        this.throwErrorIfDestroyed();
        extension.forEach(entry => this.extensions.add(entry));

        return this;
    }

    /**
     * Uninstall Context extensions
     * @param extension A single entry or list of Type<ContextExtension> entries
     * @returns {Context} Current context operation is performed on
     */
    uninstall(...extension: Type<ContextExtension>[]): this {
        if (this._initialized) {
            throw new Error("Extensions can not be uninstall after a context initialization");
        }
        this.throwErrorIfDestroyed();

        extension.forEach(entry => this.extensions.delete(entry));

        return this;
    }

    /**
     * Check if an extension is installed
     * @param extension A context extension
     * @returns {boolean}
     */
    hasExtension(extension: Type<ContextExtension>): boolean {
        return this.extensions.has(extension);
    }

    /**
     * Configure application with application modules.
     * @param module A single entry or list of modules demarcated by @Module decorator.
     * @returns {Context} Current context operation is performed on
     */
    configure(...module: (Type | ModuleConfig)[]): this {
        if (this._initialized) {
            throw new Error("Configuration of modules is not permitted as context is already initialized");
        }
        this.throwErrorIfDestroyed();

        this.modules.push(...module);
        return this;
    }

    /**
     * Initialize context - install extensions, map modules and move through init lifecycle phases
     * @throws Error on repeated call
     */
    initialize(): this {
        if (this._initialized) {
            throw new Error("Context is already installed");
        }
        this.throwErrorIfDestroyed();

        // Create extension instances before we proceed
        this.initializeExtensions();
        // Inform on pre-initialize, so extensions have a event pointer to do basic setup
        this.dispatchEvent(new ContextLifecycleEvent(ContextLifecycleEvent.PRE_INITIALIZE, this));
        // And then dispatch event that marks that all initialization should be finalized by now
        this.dispatchEvent(new ContextLifecycleEvent(ContextLifecycleEvent.INITIALIZE, this));

        // Collect list of all module metadata registered with Context
        this.prepareModules();
        // Spawn Injector mappings according to module metadata before modules are created
        this.prepareInjector();
        // Instantiate modules
        this.initializeModules();

        this._initialized = true;

        // And dispatch event that we have finished initialization
        this.dispatchEvent(new ContextLifecycleEvent(ContextLifecycleEvent.POST_INITIALIZE, this));

        return this;
    }


    /**
     * Check if some module is mapped with Context via direct mapping via configure() call or as required module of any
     * directly mapped modules.
     * This method will return any valid data only after Context is initialized
     * @param module Module to check mapping of
     */
    hasModule(module: Type): boolean {
        return this.moduleMetadata.has(module);
    }

    /**
     * Destroy context, its Injector, modules and extensions
     * @throws Error if context is not initialized or already destroyed
     */
    destroy(): void {
        if (!this._initialized) {
            throw new Error("Context is not initialized yet");
        }
        this.throwErrorIfDestroyed();

        // Inform on pre-initialize, so extensions have a event pointer to do basic destroy
        this.dispatchEvent(new ContextLifecycleEvent(ContextLifecycleEvent.PRE_DESTROY, this));
        // Implement actual tear down as this is encountered

        this.dispatchEvent(new ContextLifecycleEvent(ContextLifecycleEvent.DESTROY, this));

        // this will invoke preDestroy on all singleton instances spawned via Injector
        this.injector.destroy();

        this.extensionInstances.clear();
        this.moduleMetadata = null;

        this._destroyed = true;

        // finalize stuff
        this.dispatchEvent(new ContextLifecycleEvent(ContextLifecycleEvent.POST_DESTROY, this));
        this.removeAllEventListeners();
    }

    private throwErrorIfDestroyed(): void {
        if (this._destroyed) {
            throw new Error("Context is already destroyed");
        }
    }

    private initializeExtensions(): void {
        for (const extensionType of this.extensions) {
            const extension = new extensionType();
            extension.extend(this);
            this.extensionInstances.add(extension);
        }
    }

    private prepareModules(): void {
        this.modules.forEach((module, i) => {
            this.registerModule(module);
        });
    }

    private registerModule(module: Type | ModuleConfig, isTopLevelModule: boolean = true): void {
        const {moduleMetadata} = this;

        if (moduleMetadata.has(module)) {
            if (isTopLevelModule) {
                console.warn(`Context warn: %s is mapped several times to Context.\nNot a big problem as second mapping will be ignored but this indicates that there could be some error.`, referenceToString(module));
            }
            return;
        }

        let moduleDescriptor: ModuleConfig;
        if (!module) {
            console.warn(`Context warn: module cannot be resolved. Module: %o, isTopLevelModule: %b`, module, isTopLevelModule);
            return;
        }

        if (isModuleConfig(module)) {
            moduleDescriptor = module;
        } else {
            moduleDescriptor = this.getModuleDescriptorByType(module);
            if (!moduleDescriptor) {
                console.warn(`Context warn: %o has no module metadata available thus it cannot be a module in Context understanding. Modules: %o`, module, this.modules);
                return;
            }
        }

        // Loop through module dependencies and register those modules just before module which requires them
        // just as module might want to override some mappings from required module and that require its mappings to be
        // executed after imported module
        if (moduleDescriptor.requires && moduleDescriptor.requires.length > 0) {
            moduleDescriptor.requires.forEach((requiredModule, index) => {
                if (requiredModule === undefined) {
                    console.warn(
                        `Context warn: Module dependency cannot be resolved.\nModule: %o,\nIndex: %d`,
                        moduleDescriptor,
                        index
                    );
                } else {
                    this.registerModule(requiredModule, false);
                }
            });
        }

        moduleMetadata.set(module, moduleDescriptor);
        // Dispatch event so Context extensions can react to new module added to Context scope
        this.dispatchEvent(new ContextModuleEvent(
            ContextModuleEvent.REGISTER_MODULE,
            this,
            module,
            moduleDescriptor
        ));
    }

    private getModuleDescriptorByType(module: Type): ModuleConfig | null {
        const {moduleMetadata} = this;
        if (!metadata.hasMetadata(module)) {
            return null;
        }
        const {moduleDescriptor} = metadata.getTypeDescriptor(module);
        if (!isModuleConfig(moduleDescriptor)) {
            console.warn(`Context warn: %o module metadata in wrong format! %o`, module, moduleDescriptor);
        }
        return moduleDescriptor || null;
    }

    private prepareInjector(): void {
        const {moduleMetadata, injector} = this;
        const injectionsToInstantiate = new Set<Type>();

        [...moduleMetadata.values()]
            .filter(({mappings}) => !!mappings && mappings.length > 0)
            .map(({mappings}) => mappings)
            .forEach(moduleMapping => moduleMapping.forEach(
                injectorMapping => this.prepareInjectorMapping(injectorMapping).forEach(
                    injectionToInstantiate => injectionsToInstantiate.add(injectionToInstantiate)
                ))
            );

        // Instantiate mappings that have been marked so
        injectionsToInstantiate.forEach(instanceToInstantiate => injector.get(instanceToInstantiate));
    }

    private prepareInjectorMapping(mapping: ClassType | InjectionConfig): Type[] {
        const {injector} = this;
        // We have got a singular entry and such are to be mapped as singletons
        if (!("map" in mapping)) {
            const mappedType = mapping as ClassType;
            if (injector.hasDirectMapping(mappedType)) {
                injector.unMap(mappedType);
            }
            injector.map(mapping as ClassType).asSingleton();
            return [];
        }

        const injectionsToInstantiate = new Set<Type>();
        const injection = mapping as InjectionConfig;
        if (typeof injection.map !== "function") {
            throw new Error("Injection mapping doesn't seem to be a valid object type");
        }

        const injectionMapping = injector.map(injection.map);
        if (injection.useExisting) {
            injectionMapping.toExisting(injection.useExisting);
        } else if (injection.useValue) {
            injectionMapping.toValue(injection.useValue);
        } else if (injection.useFactory) {
            injectionMapping.toFactory(injection.useFactory);
        } else if (injection.useType) {
            injectionMapping.toType(injection.useType as Type);
        }

        // Make it a singleton unless we're explicitly told not to
        const mapAsSingleton = !('asSingleton' in injection) || injection.asSingleton;
        if (mapAsSingleton && injectionMapping.isSingletonProvider) {
            injectionMapping.asSingleton();
        }

        injectionsToInstantiate.add(injection.map as Type);

        return [...injectionsToInstantiate];
    }

    private initializeModules(): void {
        const {moduleMetadata, injector} = this;
        moduleMetadata.forEach((metadata, module) => {
            if (isModuleConfig(module)) {
                if (module.setup) {
                    module.setup(injector);
                }
                // If module is mapped without module class but with only descriptor, there is nothing to initialize
                return;
            }

            // Let us be using sealed modules for a start just as there is no reasonable scenario in which modules
            // should be added and removed dynamically
            injector.map(module).asSingleton().seal();

            // Instantiate!
            injector.get(module);
        });
    }

}
