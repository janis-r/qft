/**
 * Generic shape of injected value provider that can be served as a singleton
 */
import {InjectedValueProvider} from "./InjectedValueProvider";

export abstract class InjectedSingletonValueProvider<T = any> extends InjectedValueProvider<T> {

    private _isSingleton = false;

    /**
     * Defines if single value will be provided for each consecutive request or new value will be spawned each time.
     */
    get isSingleton(): boolean {
        return this._isSingleton;
    }

    /**
     * Set value provider to act as a singleton.
     */
    asSingleton(): void {
        if (this._isSingleton) {
            throw new Error(`asSingleton is one time set property`);
        }
        this._isSingleton = true;
    }
}
