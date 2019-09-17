import {CustomModel} from "./CustomModel";
import {Module} from "../../src/metadata/decorator/Module";
import {CustomInjectedClass} from "./CustomInjectedClass";

@Module({
    mappings: [
        CustomInjectedClass,
        {
            map: CustomModel,
            asSingleton: false
        }
    ]
})
export class ModuleWithClassMapping {

}
