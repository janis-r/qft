import {Module, ModuleConfig} from "../../src";
import {SimpleModel} from "./SimpleModel";
import {InjectedClass} from "./InjectedClass";

export const ModuleWithClassMapping: ModuleConfig = {
    mappings: [
        InjectedClass,
        {
            map: SimpleModel,
            asSingleton: false
        }
    ]
};
