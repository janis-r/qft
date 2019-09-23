import {Inject} from "../../src";
import {token, TokenDataType} from "./injection-token";

export class ClassWithInjectedToken {

    @Inject(token)
    property: TokenDataType;

}
