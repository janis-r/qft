import {Type} from "../../type";
import {ModuleDescriptor} from "./ModuleDescriptor";
import {ConstructorArg} from "./ConstructorArg";
import {PropertyInjection} from "./PropertyInjection";
import {TypeMetadataInternal} from "./TypeMetadataInternal";

/**
 * Describes some type metadata.
 */
export class TypeMetadata {
    /**
     * List of type constructor arguments data types
     */
    readonly constructorArguments: ReadonlySet<ConstructorArg>;
    /**
     * List of injected properties configuration this type expects.
     */
    readonly propertyInjections: Set<PropertyInjection>;
    /**
     * List of method names that should be invoked as new instance of type is created and all injection points have
     * got values.
     */
    readonly postConstructMethods = new Set<string>();
    /**
     * List of method names that should be invoked as Injected properties are applied to new created class.
     */
    readonly preDestroyMethods = new Set<string>();
    /**
     * Module descriptor object that marks type as a module and defines properties of a module entry.
     */
    readonly moduleDescriptor: ModuleDescriptor;

    /**
     * Create new instance
     * @param typeMeta Type of class prototype this instance holds metadata for
     */
    constructor({constructorArguments, optionalConstructorArguments, propertyInjections, optionalPropertyInjections}: TypeMetadataInternal) {

        // Parse raw constructor arguments data into more usable format
        if (constructorArguments) {
            this.constructorArguments = new Set(
                constructorArguments.map((type, index) => ({
                    index,
                    type,
                    isOptional: optionalConstructorArguments.has(index)
                }))
            );
        }

        // Parse raw property injections data into more usable format
        if (propertyInjections.size > 0) {
            this.propertyInjections = new Set([...propertyInjections].map(
                ([name, type]) => ({
                    name,
                    type,
                    isOptional: optionalPropertyInjections.has(name)
                })));
        }

        // //Decouple what can be decoupled from raw data
        // this.postConstructMethods = typeMeta.postConstructMethods.concat();
        // this.preDestroyMethods = typeMeta.preDestroyMethods.concat();
        // this.moduleDescriptor = typeMeta.moduleDescriptor;
    }

}
