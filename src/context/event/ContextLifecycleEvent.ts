import {Context} from "../Context";
import {Event} from "../../eventDispatcher/event/Event";

/**
 * Context lifecycle event represents different stages in Context life
 */
export class ContextLifecycleEvent extends Event {
    /**
     * Dispatched as context is just about to be initialized
     */
    static readonly PRE_INITIALIZE = Symbol("preInitialize");
    /**
     * Dispatched as pre initialize is done and actual initialization of Context injector and modules will take place
     */
    static readonly INITIALIZE = Symbol("initialize");
    /**
     * Dispatched as Context initialization is complete
     */
    static readonly POST_INITIALIZE = Symbol("postInitialize");
    /**
     * Dispatched as Context destroy is just about to begin.
     */
    static readonly PRE_DESTROY = Symbol("preDestroy");
    /**
     * Dispatched as actual destroy of Context is performed.
     */
    static readonly DESTROY = Symbol("clearCommandMap");
    /**
     * Dispatched as destroy of Context is complete
     */
    static readonly POST_DESTROY = Symbol("postDestroy");

    /**
     * Create new instance
     * @param type Event type
     * @param context Context instance that originated event
     */
    constructor(type: Symbol, public readonly context: Context) {
        super(type);
    }

}
