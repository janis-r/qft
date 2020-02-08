import {Context} from "./Context";
import {EventDispatcherExtension} from "./extension/eventDispatcher/EventDispatcherExtension";
import {CommandMapExtension} from "./extension/commandMap/CommandMapExtension";

/**
 * Preconfigured application context.
 */
export class AppContext extends Context {

    constructor() {
        super();
        this.install(EventDispatcherExtension, CommandMapExtension);
    }

}
