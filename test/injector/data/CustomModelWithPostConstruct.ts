import {PostConstruct} from "../../../src/metadata/decorator/PostConstruct";

export class CustomModelWithPostConstruct {

    /**
     * Async test callback function
     */
    static onPostConstruct:() => void;

    @PostConstruct()
    private initialize():void {
        if (CustomModelWithPostConstruct.onPostConstruct) {
            CustomModelWithPostConstruct.onPostConstruct();
        }
    }

}
