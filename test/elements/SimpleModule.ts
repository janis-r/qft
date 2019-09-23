import {Module} from "../../src";
import {RequiredModule} from "./RequiredModule";

@Module({
    requires: [
        RequiredModule
    ]
})
export class SimpleModule {

}
