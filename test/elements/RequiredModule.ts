import {Module} from "../../src";

@Module({})
export class RequiredModule {

    static constructionCallback:() => void;

    constructor() {
        if (RequiredModule.constructionCallback) {
            RequiredModule.constructionCallback();
        }
    }

}
