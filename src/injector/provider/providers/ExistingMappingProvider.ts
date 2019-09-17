import {InjectedValueProvider} from "../InjectedValueProvider";
import {Injector} from "../../Injector";
import {ClassType} from "../../../type";

/**
 * Provide value of existing mapping of required type
 */
export class ExistingMappingProvider<T = any> implements InjectedValueProvider<T> {

    constructor(private injector: Injector,
                private type: ClassType<T>) {

    }

    getValue(): T {
        return this.injector.get(this.type);
    }

}
