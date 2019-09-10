import {InjectionValueProvider} from "../data/InjectionValueProvider";

/**
 * Hardcoded value provider.
 */
export class ValueProvider<T = any> implements InjectionValueProvider<T> {

    constructor(private value: T) {

    }

    getProviderValue(): T {
        return this.value;
    }

    destroy(): void {
        this.value = null;
    }
}
