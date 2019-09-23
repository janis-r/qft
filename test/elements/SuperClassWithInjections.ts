import {Inject} from "../../src";
import {SimpleModel2} from "./SimpleModel2";

export class SuperClassWithInjections {

    @Inject()
    customModel2: SimpleModel2;

}
