import {Inject, Injector, PreDestroy} from "../../src";

export class ClassWithInjectAndPreDestroy {

    static onDestroy: () => void;

    @Inject()
    injector: Injector;

    @PreDestroy()
    private destroy(): void {
        if (ClassWithInjectAndPreDestroy.onDestroy) {
            ClassWithInjectAndPreDestroy.onDestroy();
        }
    }

}
