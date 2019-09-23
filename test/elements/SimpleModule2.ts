import {Module} from "../../src";
import {RequiredClass} from "./RequiredClass";

@Module({
    requires: [
        RequiredClass
    ]
})
export class SimpleModule2 {

}
