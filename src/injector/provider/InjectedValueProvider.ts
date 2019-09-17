/**
 * Generic shape of injected value provider
 */
export abstract class InjectedValueProvider<T = any> {
    /**
     * Implement providing of mapped value
     */
    abstract getValue(): T;

    /**
     * Implement clearCommandMap of provided instance that will be invoked as provider instance if to be destroyed.
     */
    destroy?(): void;
}
