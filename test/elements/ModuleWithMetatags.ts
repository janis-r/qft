import {SimpleModel} from "./SimpleModel";
import {Interface} from "./Interface";
import {Inject, Injector, Module, Optional, PostConstruct, PreDestroy} from "../../src";
import {SimpleModel2} from "./SimpleModel2";
import {RequiredModule} from "./RequiredModule";
import {InjectedClass} from "./InjectedClass";
import {SimpleCommand} from "./SimpleCommand";

@Module({
    requires: [
        RequiredModule
    ],
    mappings: [
        InjectedClass,
        {
            map: SimpleModel,
            useValue: new SimpleModel()

        },
        {
            map: SimpleModel2,
            useExisting: SimpleModel
        }
    ],
    commands: [
        {
            event: SimpleCommand.EVENT,
            command: SimpleCommand,
            once: true
        }
    ]
})
export class ModuleWithMetatags implements Interface {

    @Inject()
    @Optional()
    customClass: InjectedClass;

    @Inject()
    private injector: Injector;

    @Optional()
    get intentionallyIncorrectOptionalMetaTagUse(): null {
        return null;
    }

    constructor(injector: Injector, @Optional() customClass: InjectedClass) {

    }

    @PostConstruct()
    postConstruct(): void {

    }

    @PostConstruct()
    anotherPostConstruct(): void {

    }

    @PreDestroy()
    preDestroy(): void {

    }

    @PreDestroy()
    anotherPreDestroy(): void {

    }
}
