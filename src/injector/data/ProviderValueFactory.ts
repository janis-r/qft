import {Injector} from "../Injector";

/**
 * Mapping factory provide type
 */
export type ProviderValueFactory<T = any> = (injector?: Injector) => T;
