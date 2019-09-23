import {PostConstruct} from "../../src";

export class ClassWithPostConstruct {

    static onPostConstruct: () => void;

    @PostConstruct()
    private initialize(): void {
        if (ClassWithPostConstruct.onPostConstruct) {
            ClassWithPostConstruct.onPostConstruct();
        }
    }

}
