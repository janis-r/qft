import {Inject} from "../../src/metadata/decorator/Inject";
import {CustomModel2} from "./CustomModel2";

export class SuperClassWithInjections {

    @Inject()
    customModel2: CustomModel2;

}
