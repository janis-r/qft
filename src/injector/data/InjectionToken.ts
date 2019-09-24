/**
 * Token that can be used to match value which has no persistent type definition to dependency injector.
 */
export class InjectionToken<T = any> {

    constructor(readonly name: string) {
    }

    toString(): string {
        return `InjectionToken [${this.name}]`;
    }
}
