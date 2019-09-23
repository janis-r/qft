import {Module} from "../../src";
import {SimpleModel} from "./SimpleModel";
import {InjectedClass} from "./InjectedClass";

@Module({
    mappings: [
        InjectedClass,
        {
            map: SimpleModel,
            asSingleton: false
        }
    ]
})
export class ModuleWithClassMapping {

}
