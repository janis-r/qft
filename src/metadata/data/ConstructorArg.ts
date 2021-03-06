import {ClassType} from "../../type";

/**
 * Injectable instance constructor argument entry
 */
export interface ConstructorArg {
    /**
     * Index of constructor argument
     */
    readonly index: number;
    /**
     * Type to be extracted from Injector as this argument is applied
     */
    readonly type: ClassType;
    /**
     * Defines if argument is optional and no error should be produced if requested type is not found in Injector
     */
    readonly isOptional: boolean;
}
