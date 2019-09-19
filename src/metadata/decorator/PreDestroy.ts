import {metadataInternal} from "../metadata";
import {ClassType, Type} from "../../type";

/**
 * Mark method to be invoked as instance, client of injector, is to be destroyed and some mappings should be destroyed
 * manually just before its gone for good.
 */
export function PreDestroy(): Function {
    return (target: ClassType, method: string): ClassType => {
        metadataInternal.getTypeDescriptor(<ClassType>target.constructor).addPreDestroyMethod(method);
        return target;
    };
}
