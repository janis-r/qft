import {ClassType, Type} from "../../type";
import {Injector} from "../Injector";
import {InjectedValueProvider} from "../provider/InjectedValueProvider";
import {ClassProvider} from "../provider/providers/ClassProvider";
import {ValueProvider} from "../provider/providers/ValueProvider";
import {ExistingMappingProvider} from "../provider/providers/ExistingMappingProvider";
import {typeReferenceToString} from "../../util/StringUtil";
import {ProviderValueFactory} from "./ProviderValueFactory";
import {FactoryProvider} from "../provider/providers/FactoryProvider";
import {InjectedSingletonValueProvider} from "../provider/InjectedSingletonValueProvider";

/**
 * Injector data mapping instance.
 */
export class InjectionMapping<T = any> {

    private _sealed: boolean = false;
    private _destroyed: boolean = false;

    private provider: InjectedValueProvider;
    private sealKey: Object;
    private defaultProviderSet: boolean;

    /**
     * Create new instance of injector mapping
     * @param type Constructable or abstract class type by which value will be mapped
     * @param injector Injector instance
     * @param masterSealKey Master seal key
     */
    constructor(readonly type: ClassType<T>, readonly injector: Injector, private readonly masterSealKey: Object) {
        this.defaultProviderSet = true;
        // Set class provider as a default value provider, so if no more configuration is set, this will stay as default behavior
        this.setProvider(new ClassProvider(injector, type as Type));
    }

    /**
     * Whether injection is sealed
     */
    get sealed(): boolean {
        return this._sealed;
    }

    /**
     * Whether injection is destroyed
     */
    get destroyed(): boolean {
        return this._destroyed;
    }

    /**
     * Makes the mapping return a lazily constructed singleton instance of the mapped type, for
     * each consecutive request.
     * @returns {InjectionMapping} The InjectionMapping the method is invoked on
     */
    asSingleton(): this {
        if (this._sealed || this._destroyed) {
            throw new Error(`Can't change a sealed or destroyed mapping.`);
        }
        if (!this.provider || !(this.provider instanceof InjectedSingletonValueProvider)) {
            throw new Error(`Injection provider is not set or it's not Singleton value provider`);
        }
        this.provider.asSingleton();
        return this;
    }

    /**
     * Makes the mapping return a lazily constructed singleton instance of the mapped type for
     * each consecutive request.
     * @param type Type that should be used as source of singleton instance
     * @returns {InjectionMapping} The InjectionMapping the method is invoked on
     */
    toSingleton(type: Type<T>): this {
        if (this._sealed || this._destroyed) {
            throw new Error(`Can't change a sealed or destroyed mapping.`);
        }
        const provider = new ClassProvider(this.injector, type);
        provider.asSingleton();
        this.setProvider(provider);
        return this;
    }

    /**
     * Makes the mapping return a newly created instance of the given <code>type</code> for
     * each consecutive request.
     * @param type Type that should be used as new injected value is spawned
     * @returns {InjectionMapping} The InjectionMapping the method is invoked on
     */
    toType(type: Type<T>): this {
        if (this._sealed || this._destroyed) {
            throw new Error(`Can't change a sealed or destroyed mapping.`);
        }
        this.setProvider(new ClassProvider(this.injector, type));
        return this;
    }

    /**
     * Makes the mapping return the given value for each consecutive request.
     * @param value Hard coded value to be returned for each request
     */
    toValue(value: T): this {
        if (this._sealed || this._destroyed) {
            throw new Error(`Can't change a sealed or destroyed mapping.`);
        }
        this.setProvider(new ValueProvider(value));
        return this;
    }

    /**
     * Makes the mapping return existing mapping from current injector or any of its parents upon each request
     * @param type Existing mapping type to use as for a return value.
     */
    toExisting(type: ClassType<T>): this {
        if (this._sealed || this._destroyed) {
            throw new Error(`Can't change a sealed or destroyed mapping.`);
        }

        this.provider = new ExistingMappingProvider(this.injector, type);
        return this;
    }

    /**
     *
     * @param factory
     */
    toFactory(factory: ProviderValueFactory<T>) {
        if (this._sealed || this._destroyed) {
            throw new Error(`Can't change a sealed or destroyed mapping.`);
        }

        this.provider = new FactoryProvider(this.injector, factory);
        return this;
    }

    /**
     * Seal mapping and don't  allow any changes to it whist Injector that hosts this mapping is destroyed or mapping
     * is unsealed.
     * @returns {Object} Seal key to be used for unseal operation.
     */
    seal(): Object {
        if (this._sealed) {
            throw new Error(`Can't seal sealed mapping.`);
        }
        this._sealed = true;
        this.sealKey = {};
        return this.sealKey;
    }

    /**
     * Unseal mapping.
     * @param key Seal key which was returned as a return value for seal() operation.
     * @returns {InjectionMapping} The InjectionMapping the method is invoked on
     */
    unseal(key: Object): this {
        if (!this._sealed) {
            throw new Error(`Can't unseal a non-sealed mapping.`);
        }
        if (key !== this.sealKey && key !== this.masterSealKey) {
            throw new Error(`Can't unseal mapping without the correct key.`);
        }

        this._sealed = false;
        this.sealKey = null;
        return this;
    }

    /**
     * Retrieve provided value of current injector mapping.
     * @returns {any}
     */
    getInjectedValue(): any {
        if (this._destroyed) {
            throw new Error(`InjectionMapping for type: ${this.type} is already destroyed!`);
        }
        return this.provider.getValue();
    }

    /**
     * Destroy injection provider and invoke clearCommandMap of values provided if current value type supports that.
     */
    destroy(): void {
        if (this._destroyed) {
            throw new Error(`InjectionMapping for type: ${this.type} is already destroyed!`);
        }

        if ("destroy" in this.provider) {
            this.provider.destroy();
        }
        this.provider = null;
        this._destroyed = true;
    }

    private setProvider(provider: InjectedValueProvider): void {
        if (this._destroyed) {
            throw new Error(`Can't change a destroyed mapping`);
        }

        if (this._sealed) {
            throw new Error(`Can't change a sealed mapping`);
        }

        if (!this.defaultProviderSet && this.provider) {
            // console.log("provider", this.provider);
            console.warn(
                `Injector already has mapping for ${typeReferenceToString(this.type)} and its being overridden. ` +
                `This could be or could not be error, buy it's suggested to use injector.unMap() ` +
                `before new mapping is set.`
            );
        }

        // Check if current provider is default one
        this.defaultProviderSet = (provider instanceof ClassProvider && (provider as ClassProvider).type === this.type);

        if (this.provider && "destroy" in this.provider) {
            this.provider.destroy();
        }

        this.provider = provider;
    }
}
