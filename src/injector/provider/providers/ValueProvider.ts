import {InjectedValueProvider} from "../InjectedValueProvider";

/**
 * Hardcoded value provider.
 */
export class ValueProvider<T = any> implements InjectedValueProvider<T> {

    constructor(private value: T) {

    }

    getValue(): T {
        return this.value;
    }

}
