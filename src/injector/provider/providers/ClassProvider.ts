import {Injector} from "../../Injector";
import {Type} from "../../../type";
import {InjectedSingletonValueProvider} from "../InjectedSingletonValueProvider";

/**
 * Class provider that will spawn instance of required type upon request.
 */
export class ClassProvider<T = any> extends InjectedSingletonValueProvider<T> {

    private lastValue: T;

    constructor(private injector: Injector, public readonly type: Type<T>) {
        super();
    }

    getValue(): T {
        if (!this.lastValue || !this.isSingleton) {
            this.lastValue = this.injector.instantiateInstance(this.type, true);
        }
        return this.lastValue;
    }

}
