import {Inject} from "../../src/metadata/decorator/Inject";
import {Injector} from "../../src/injector/Injector";
import {PreDestroy} from "../../src/metadata/decorator/PreDestroy";

export class CustomModelWithInject {

    /**
     * Async test callback function
     */
    static onDestroy: () => void;

    @Inject()
    injector: Injector;

    @PreDestroy()
    private destroy(): void {
        if (CustomModelWithInject.onDestroy) {
            CustomModelWithInject.onDestroy();
        }
    }

}
