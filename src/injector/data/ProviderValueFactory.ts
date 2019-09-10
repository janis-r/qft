import {Injector} from "../Injector";

export type ProviderValueFactory<T = any> = (injector?: Injector) => T;
