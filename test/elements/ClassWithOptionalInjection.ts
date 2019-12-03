import {Inject, Optional} from "../../src";
import {SimpleModel2} from "./SimpleModel2";

export class ClassWithOptionalInjection {

    @Inject()
    @Optional()
    customModel2: SimpleModel2;

}
