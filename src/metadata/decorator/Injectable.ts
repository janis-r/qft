import {metadataInternal} from "../metadata";
import {ClassType, Type} from "../../type";

/**
 * Mark class as injectable which will make all of its constructor arguments filled with values from Injector
 */
export function Injectable(): Function {
    return (target: Type): Type => {
        const constructorArgs: ClassType[] = Reflect.getMetadata("design:paramtypes", target);
        if (constructorArgs && constructorArgs.length > 0) {
            metadataInternal.getTypeDescriptor(target).setConstructorArguments(constructorArgs);
        }
        return target;
    };
}
