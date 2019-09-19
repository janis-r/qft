import {metadataInternal} from "../metadata";
import {ClassType, Type} from "../../type";

/**
 * Mark class property as client for value from Injector.
 */
export function Inject(): Function {
    return (target: ClassType, variable: string): ClassType => {
        const variableType: ClassType = Reflect.getMetadata("design:type", target, variable);

        // The variable must be assigned to any default value.
        // If this is not done, the property can not be modified by the Injector and becomes readonly.
        target[variable] = undefined;

        metadataInternal.getTypeDescriptor(<Type>target.constructor).addPropertyInjection(variable, variableType);
        return target;
    };
}
