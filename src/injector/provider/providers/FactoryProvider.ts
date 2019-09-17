import {Injector} from "../../Injector";
import {ProviderValueFactory} from "../../data/ProviderValueFactory";
import {InjectedSingletonValueProvider} from "../InjectedSingletonValueProvider";

/**
 * Value factory provider.
 */
export class FactoryProvider<T = any> extends InjectedSingletonValueProvider<T> {

    private lastValue: T;

    constructor(private injector: Injector, private factory: ProviderValueFactory<T>) {
        super();
    }

    getValue(): T {
        if (!this.lastValue || !this.isSingleton) {
            this.lastValue = this.factory(this.injector);
        }
        return this.lastValue;
    }

}
