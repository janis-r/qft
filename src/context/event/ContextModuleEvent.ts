import {Event} from "../../eventDispatcher/event/Event";
import {ModuleConfig} from "../../metadata/data/ModuleConfig";
import {Context} from "../Context";
import {Type} from "../../type";

/**
 * Context module action event
 */
export class ContextModuleEvent extends Event {

    /**
     * Dispatched as new module is registered with Context
     */
    static readonly REGISTER_MODULE = Symbol("registerModule");

    /**
     * Create new instance
     * @param {Symbol} type
     * @param {Context} context
     * @param {Type} moduleType
     * @param {ModuleConfig} moduleDescriptor
     */
    constructor(type: Symbol,
                readonly context: Context,
                readonly moduleType: Type | ModuleConfig,
                readonly moduleDescriptor: ModuleConfig) {
        super(type);
    }
}
