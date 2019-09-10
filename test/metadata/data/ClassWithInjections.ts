import {Inject} from "../../../src/metadata/decorator/Inject";
import {CustomModel} from "../../injector/data/CustomModel";
import {PostConstruct} from "../../../src/metadata/decorator/PostConstruct";
import {Optional} from "../../../src/metadata/decorator/Optional";
import {CustomModel2} from "../../injector/data/CustomModel2";
import {SuperClassWithInjections} from "./SuperClassWithInjections";

export class ClassWithInjections extends SuperClassWithInjections {

    static onPostConstruct: () => void;

    @Inject()
    customModel: CustomModel;

    @Inject()
    @Optional()
    customModel2: CustomModel2;

    @PostConstruct()
    private postConstruct(): void {
        if (ClassWithInjections.onPostConstruct) {
            ClassWithInjections.onPostConstruct();
        }
    }

}
