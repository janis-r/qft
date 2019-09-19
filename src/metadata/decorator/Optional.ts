import {metadataInternal} from "../metadata";
import {ClassType, Type} from "../../type";

/**
 * Mark injected variable in class constructor or class property as Optional hence avoid lacking injected property
 * error.
 */
export function Optional(): Function {
    return (target: ClassType, key: string, index: number | Object): ClassType => {
        if (key && !index) {
            // We have a class property mapping in here
            metadataInternal.getTypeDescriptor(<Type>target.constructor).setOptionalPropertyInjection(key);
        } else if (!key && typeof index === "number") {
            //This one is a constructor param entry
            metadataInternal.getTypeDescriptor(target).setOptionalConstructorArgument(index);
        } else {
            console.warn(`@Optional meta tag is applied to non constructor argument or class property named "${key}" and will make no effect`);
        }

        return target;
    };
}
