import {InjectionToken} from "../../src";

export type TokenDataType = {
    foo: string,
    bar: number,
    lee: string | number
}
export const token = new InjectionToken<TokenDataType>('Injection token for test');
