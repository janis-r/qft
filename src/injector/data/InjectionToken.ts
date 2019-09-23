/**
 * Token that can be used to match value which has no persistent type definition to dependency injector.
 * (Took this idea from Angular)
 */
export class InjectionToken<T = any> extends Function {

    constructor(readonly description?: string) {
        super();
    }

    toString(): string {
        return `InjectionToken [${this.description}]`;
    }
}
