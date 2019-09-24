import {ClassType} from "../../type";
import {ModuleDescriptor} from "./ModuleDescriptor";
import {referenceToString} from "../../util/StringUtil";
import {InjectionToken} from "../..";

/**
 * Data object which holds raw information collected for particular Type from class metadataInternal decorators.
 * This is internal class of metadataInternal package and should never be used outside of it.
 */
export class TypeMetadataInternal {

    private _constructorArguments: ClassType[];
    private _optionalConstructorArguments = new Set<number>();
    private _propertyInjections = new Map<string, ClassType | InjectionToken>();
    private _optionalPropertyInjections = new Set<string>();
    private _postConstructMethods = new Set<string>();
    private _preDestroyMethods = new Set<string>();
    private _moduleDescriptor: ModuleDescriptor;

    /**
     * Create new instance
     * @param type Type of class prototype this instance holds metadataInternal for
     */
    constructor(public readonly type: ClassType) {

    }

    /**
     * List of type constructor arguments data types
     */
    get constructorArguments(): ReadonlyArray<ClassType> {
        return this._constructorArguments;
    }

    /**
     * Indices of injectable constructor arguments that are optional and should be omitted, in case if there is no
     * mapping found in Injector, with no error.
     */
    get optionalConstructorArguments(): ReadonlySet<number> {
        return this._optionalConstructorArguments;
    }

    /**
     * List of type property name and data type pairs that should be filled with values from Injector as instance
     * of this type is created.
     */
    get propertyInjections(): ReadonlyMap<string, ClassType | InjectionToken> {
        return this._propertyInjections;
    }

    /**
     * List of optional property injections.
     */
    get optionalPropertyInjections(): ReadonlySet<string> {
        return this._optionalPropertyInjections;
    }

    /**
     * List of method names that should be invoked as new instance of type is created and all injection points have
     * got values
     */
    get postConstructMethods(): ReadonlySet<string> {
        return this._postConstructMethods;
    }

    /**
     * List of method names that should be invoked as Injected properties are applied to new created class.
     */
    get preDestroyMethods(): ReadonlySet<string> {
        return this._preDestroyMethods;
    }

    /**
     * Module descriptor object that marks type as a module and defines properties of a module entry.
     */
    get moduleDescriptor(): ModuleDescriptor {
        return this._moduleDescriptor;
    }

    setConstructorArguments(value: ClassType[]): void {
        if (this._constructorArguments) {
            throw new Error("Double set of type constructor arguments is attempted and that is clear error!");
        }
        this._constructorArguments = value;
    }

    setOptionalConstructorArgument(index: number): void {
        if (this._optionalConstructorArguments.has(index)) {
            throw new Error("Double set of optional constructor argument!");
        }
        this._optionalConstructorArguments.add(index);
    }

    addPropertyInjection(name: string, type: ClassType | InjectionToken): void {
        if (this._propertyInjections.has(name)) {
            throw new Error(`Double set of property ${name} injection to ${referenceToString(type)}`);
        }
        this._propertyInjections.set(name, type);
    }

    setOptionalPropertyInjection(name: string): void {
        if (this._optionalPropertyInjections.has(name)) {
            throw new Error("Double set of optional proprety injection!");
        }
        this._optionalPropertyInjections.add(name);
    }

    addPostConstructMethod(name: string): void {
        if (this._postConstructMethods.has(name)) {
            throw new Error(`Double register of post construct method ${name} to ${referenceToString(this.type)}`);
        }
        this._postConstructMethods.add(name);
    }

    addPreDestroyMethod(name: string): void {
        if (this._preDestroyMethods.has(name)) {
            throw new Error(`Double register of pre destroy method ${name} to ${referenceToString(this.type)}`);
        }
        this._preDestroyMethods.add(name);
    }

    setModuleDescriptor(descriptor: ModuleDescriptor): void {
        if (this._moduleDescriptor) {
            throw new Error("Double set of module descriptor and that is clear error!");
        }
        this._moduleDescriptor = descriptor;
    }
}
