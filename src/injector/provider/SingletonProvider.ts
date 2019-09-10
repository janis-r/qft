import {InjectionValueProvider} from "../data/InjectionValueProvider";
import {Type} from "../../type";
import {Injector} from "../Injector";

/**
 * Provide singleton value.
 */
export class SingletonProvider<T = any> implements InjectionValueProvider<T> {

    private instance: T;

    constructor(private injector: Injector,
                private type: Type<T>) {
    }

    getProviderValue(): T {
        if (!this.instance) {
            this.instance = this.injector.instantiateInstance(this.type, true);
        }
        return this.instance;
    }

    destroy(): void {
        if (this.instance) {
            this.injector.destroyInstance(this.instance);
            this.instance = null;
        }
    }

}
