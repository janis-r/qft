import {Event} from "../../eventDispatcher/event/Event";
import {ModuleDescriptor} from "../../metadata/data/ModuleDescriptor";
import {Context} from "../Context";
import {Type} from "../../type";

/**
 * Context module action event
 */
export class ContextModuleEvent extends Event {

    /**
     * Dispatched as new module is registered with Context
     */
    static readonly REGISTER_MODULE = "registerModule";

    /**
     * Create new instance
     * @param {string} type
     * @param {Context} context
     * @param {Type} moduleType
     * @param {ModuleDescriptor} moduleDescriptor
     */
    constructor(type: string,
                readonly context: Context,
                readonly moduleType: Type,
                readonly moduleDescriptor: ModuleDescriptor) {
        super(type);
    }
}
