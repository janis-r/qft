export class RequiredClass {

    static constructionCallback: () => void;

    constructor() {
        if (RequiredClass.constructionCallback) {
            RequiredClass.constructionCallback();
        }
    }

}
