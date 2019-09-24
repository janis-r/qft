import {EventDispatcherExtension} from "../extension/eventDispatcher/EventDispatcherExtension";
import {CommandMapExtension} from "../extension/commandMap/CommandMapExtension";

/**
 * Default listing of Context extensions for standard web application.
 */
export const WebApplicationBundle = [
    EventDispatcherExtension,
    CommandMapExtension
];
