import {ClassType} from "../../type";
import {InjectionToken} from "../..";

/**
 * Describes property of a type that expects to receive value from Injector.
 */
export interface PropertyInjection {
    /**
     * Name of class property that expects to value from Injector
     */
    readonly name: string;
    /**
     * Type to be extracted from Injector as this argument is applied
     */
    readonly type: ClassType | InjectionToken;
    /**
     * Defines if argument is optional and no error should be produced if requested type is not found in Injector
     */
    readonly isOptional: boolean;
}
