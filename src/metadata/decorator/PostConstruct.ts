import {metadataInternal} from "../metadata";
import {ClassType} from "../../type";

/**
 * Mark method to be invoked as instance, client of injector, is created and all custom injections have
 * their values set.
 * For instances mapped to Injector as Singletons methods marked with @PostConstruct will be invoked with slight delay in
 * order to put instance in Injector before it is fully initialized.
 */
export function PostConstruct(): Function {
    return (target: ClassType, method: string): ClassType => {
        metadataInternal.getTypeDescriptor(<ClassType>target.constructor).addPostConstructMethod(method);
        return target;
    };
}
