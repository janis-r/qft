import {InjectionValueProvider} from "../data/InjectionValueProvider";
import {Injector} from "../Injector";
import {ProviderValueFactory} from "../data/ProviderValueFactory";

/**
 * Value factory provider.
 */
export class FactoryProvider<T = any> implements InjectionValueProvider<T> {

    private value: T;

    constructor(private injector: Injector,
                private factory: ProviderValueFactory<T>) {
    }

    getProviderValue(): T {
        if (!this.value) {
            this.value = this.factory(this.injector);
        }
        return this.value;
    }

    destroy(): void {
        this.value = null;
    }
}
