import {Command} from "../../commandMap/command/Command";
import {Type} from "../../type";
import {Event} from "../../eventDispatcher/event/Event";

/**
 * Command mapping descriptor to be used within system module meta data.
 */
export interface CommandMappingDescriptor {
    /**
     * Event name upon which command mapped in command property should be invoked.
     */
    readonly event: Event['type'],
    /**
     * Command type, or list of command types, that should be invoked as event name listed in event property is
     * fired in system context.
     */
    readonly command: Type<Command> | Type<Command>[];
    /**
     * Describes if command should be executed only once.
     * @default false
     */
    readonly once?: boolean;

}
