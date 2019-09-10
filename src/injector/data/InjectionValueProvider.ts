/**
 * Generic shape of injected value provider
 */

export interface InjectionValueProvider<T = any> {
    /**
     * Implement providing of mapped value
     */
    getProviderValue(): T;

    /**
     * Implement clearCommandMap of provided instance that will be invoked as provider instance if to be destroyed.
     */
    destroy?(): void;

}
