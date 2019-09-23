import {metadataInternal} from "../metadata";
import {ClassType} from "../../type";
import {InjectionToken} from "../../injector/data/InjectionToken";

/**
 * Mark class property as client for value from Injector.
 */
export function Inject<T = any>(injectionToken?: InjectionToken<T>): Function {
    return (target: ClassType, variable: string): ClassType => {

        const variableType: ClassType<T> | InjectionToken<T> = injectionToken || Reflect.getMetadata("design:type", target, variable);

        // The variable must be assigned to any default value.
        // If this is not done, the property can not be modified by the Injector and becomes readonly.
        target[variable] = undefined;

        metadataInternal.getTypeDescriptor(<ClassType>target.constructor).addPropertyInjection(variable, variableType);
        return target;
    };
}
