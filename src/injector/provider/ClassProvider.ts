import {InjectionValueProvider} from "../data/InjectionValueProvider";
import {Type} from "../../type";
import {Injector} from "../Injector";

/**
 * Class provider that will return new instance of required type upon any request.
 */
export class ClassProvider<T = any> implements InjectionValueProvider<T> {
    
    constructor(private injector: Injector,
                public readonly type: Type<T>) {

    }

    getProviderValue(): T {
        //Return new instance of type without caring how this instance will be destroyed afterwards
        return this.injector.instantiateInstance(this.type);
    }

}
