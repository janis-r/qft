import {Type} from "../../type";
import {metadataInternal} from "../metadata";
import {ModuleConfig} from "../data/ModuleConfig";
import {Injectable} from "./Injectable";

/**
 * Mark some class as system module by defining a module descriptor.
 * This metadataInternal tag will invoke Injectable so any module will be Injectable and there is no need to redefine it as
 * such. Actually that will lead to error, if @Module and @Injectable will be both set.
 * @param descriptor Module descriptor
 */
export function Module(descriptor: ModuleConfig): Function {
    return (target: Type): Type => {
        //Invoke Injectable just as we have a Module entry
        Injectable()(target);
        metadataInternal.getTypeDescriptor(target).setModuleDescriptor(descriptor);
        return target;
    };
}
