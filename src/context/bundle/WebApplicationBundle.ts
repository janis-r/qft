import {EventDispatcherExtension} from "../extension/eventDispatcher/EventDispatcherExtension";
import {CommandMapExtension} from "../extension/commandMap/CommandMapExtension";
import {Type} from "../../type";
import {ContextExtension} from "../data/ContextExtension";

/**
 * Default listing of Context extensions for standard web application.
 */
export const WebApplicationBundle: Type<ContextExtension>[] = [
    EventDispatcherExtension,
    CommandMapExtension
];
