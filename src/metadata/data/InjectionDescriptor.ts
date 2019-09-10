import {ClassType, Type} from "../../type";
import {ProviderValueFactory} from "@injector/data/ProviderValueFactory";

/**
 * Injection descriptor object shape.
 */
export interface InjectionDescriptor<T extends Type | any = any> {
    /**
     * Injection mapping key which will be used to extract mapping.
     * (any is added due to the fact that abstract classes do not resolve as Type)
     */
    readonly map: ClassType<T>;
    /**
     * Type, instance of which, must be created as injection with signature defined in map
     * property will be requested.
     */
    readonly useType?: ClassType<T>;
    /**
     * Value to return as it is provided in here as injection with signature defined in map
     * property will be requested.
     */
    readonly useValue?: T;
    /**
     * Use existing mapping defined by this property as injection with signature defined in map
     * property will be requested.
     */
    readonly useExisting?: ClassType<T>;
    /**
     * Use factory in order to initiate singleton instance as it's requested.
     */
    readonly useFactory?: ProviderValueFactory<T>;
    /**
     * Provide same instance of mapped instance (true) or create new instance upon any request (false)
     * Default value for this property will be assumed to be true and if this property is omitted singleton instance
     * will be in use.
     * @default true
     */
    readonly asSingleton?: boolean;
    /**
     * Auto instantiate mapping as application context is created, if this property is set to true.
     * @default false
     */
    readonly instantiate?: boolean;
}
