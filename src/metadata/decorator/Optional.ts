import {metadataInternal} from "../metadata";
import {ClassType, Type} from "../../type";

/**
 * Mark injected variable in class constructor or class property as Optional hence avoid lacking injected property
 * error.
 */
export function Optional(): Function {
    return (target: ClassType, variable: string, index: number | Object): ClassType => {
        if (variable && !index) {
            // We have a class property mapping in here
            metadataInternal.getTypeDescriptor(<Type>target.constructor).setOptionalPropertyInjection(variable);
        } else if (!variable && typeof index === "number") {
            //This one is a constructor param entry
            metadataInternal.getTypeDescriptor(target).setOptionalConstructorArgument(index);
        } else {
            console.warn(`@Optional meta tag is applied to non constructor argument or class property named "%s" and will make no effect`, variable);
        }

        return target;
    };
}
