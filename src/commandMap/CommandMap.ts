import {Command} from "./command/Command";
import {Event} from "../eventDispatcher/event/Event";
import {CommandMappingImpl} from "./data/impl/CommandMappingImpl";
import {Type} from "../type";
import {CommandMapping} from "./data/CommandMapping";
import {Inject} from "../metadata/decorator/Inject";
import {Injector} from "../injector/Injector";
import {referenceToString} from "../util/StringUtil";

/**
 * Event command map describes event name to command class mappings and is useful as small pieces of control code
 * should be executed upon some event notification.
 */
export class CommandMap {

    @Inject()
    protected readonly injector: Injector;

    // Private storage to all command mappings
    private commandMappings: CommandMappingImpl[] = [];

    //--------------------
    //  Public methods
    //--------------------

    /**
     * Map event notification to a command class.
     * @param eventType String event name which will tiger execution of a command.
     * @param command   Command class which should implement <code>Command</code> interface or, at least,
     * should have execute method defined with same signature.
     * @returns {CommandMapping} data object which describes mapping and can be used to set command execution
     * only once; or null in case if mapping of requested event type is already mapped to class instance.
     */
    // map<C extends Command, T extends CommandEventType<C>, E = keyof T>(eventType: E, command: Type<C>): CommandMapping;
    map(eventType: Event['type'], command: Type<Command>): CommandMapping {
        if (!eventType) {
            throw new Error("CommandMap: A command can not be mapped to an undefined event");
        }
        if (!command) {
            throw new Error("CommandMap: Only valid Commands can be mapped to events");
        }

        const mappings = this.getEventToCommandMappings(eventType);
        if (mappings.some(entry => entry.command === command)) {
            const message = `CommandMap: Event to command mapping already exists. UnMap it before calling map again.`;
            const info = `event:${eventType} command: ${referenceToString(command)}`;
            console.warn(message + " " + info);
            return null;
        }

        const mapping = new CommandMappingImpl(eventType, command);
        this.commandMappings.push(mapping);

        return mapping;
    }

    /**
     * Remove all command mappings from all event types.
     * @returns {boolean} which indicates if the unMapping has been successful.
     */
    unMap(): boolean;

    /**
     * Remove all command mappings for the specified event type.
     * @param eventType     Event type which is mapped to commands.
     * @returns {boolean} which indicates if the unMapping has been successful.
     */
    unMap(eventType: string): boolean;

    /**
     * Remove event type to command mapping.
     * @param eventType     Event type which is mapped to a command.
     * @param command   Command class which should be unmapped.
     * @returns {boolean} which indicates if the unMapping has been successful.
     */
    unMap(eventType: Event['type'], command: Type<Command>): boolean;

    /**
     * Remove event name to command mapping.
     * @param eventType     Event name which is mapped to a command.
     * @param command   Event command class which should be unmapped.
     * @returns {boolean} which indicates if the unMapping has been successful.
     * @private
     */
    unMap(eventType?: string, command?: Type<Command>): boolean {
        if (this.commandMappings.length === 0) {
            return false;
        }

        // If eventType is not specified, remove all mappings
        if (!eventType) {
            this.commandMappings = [];
            return true;
        }

        const mappings = this.getEventToCommandMappings(eventType, command);
        if (mappings.length === 0) {
            return false; //no mappings found
        }

        while (mappings.length > 0) {
            const mapping = mappings.shift();
            this.commandMappings.splice(this.commandMappings.indexOf(mapping), 1);
        }

        return true;
    }

    /**
     * Trigger all commands which are mapped to this event.
     * @param event Event object that defines event type and data
     */
    trigger(event: Event): void;

    /**
     * Trigger all commands which are mapped to event name.
     * @param eventType String event name commands mapped to which must be invoked.
     * @param eventData Arbitrary data to be passed along with command invocation.
     */
    trigger(eventType: string, eventData?: any): void;

    /**
     * Trigger all commands which are mapped to event name.
     * @param eventTypeOrEvent Event type or Event
     * @param eventData Arbitrary data to be passed along with command invocation.
     * @private
     */
    trigger(eventTypeOrEvent: Event | string, eventData?: any): void {
        if (!eventTypeOrEvent) {
            throw new Error("CommandMap: Event type or value can not be null");
        }
        const event = eventTypeOrEvent instanceof Event ? eventTypeOrEvent : new Event(eventTypeOrEvent, eventData);

        const commands = this.getEventToCommandMappings(event.type);
        for (const command of commands) {
            if (command.executionAllowedByGuards(event)) {
                this.executeCommand(command, event);
            }
        }
    }

    /**
     * Get list of all commands assigned to particular event name.
     * @param eventType   String event name which is a target.
     * @param command Command to which event is mapped or nothing in case if that is not required look up param.
     * @returns {CommandMappingImpl[]} List of commands mappings attached to requested event type.
     */
    private getEventToCommandMappings(eventType: Event['type'], command?: Type<Command>): CommandMappingImpl[] {
        return this.commandMappings
            .filter(mapping => mapping.eventType === eventType)
            .filter(mapping => !command || mapping.command === command);
    }

    /**
     * Create command instance and execute it.
     */
    private executeCommand(commandMapping: CommandMappingImpl, event: Event): void {
        const {injector} = this;
        const command = this.createCommandInstance(commandMapping, event);

        const executePromise = command.execute();
        if (executePromise && executePromise instanceof Promise) {
            // Await till command is executed before destroying Command instance for async Commands
            executePromise.then(() => injector.destroyInstance(command));
        } else {
            injector.destroyInstance(command)
        }

        if (commandMapping.executeOnce) {
            this.unMap(commandMapping.eventType, commandMapping.command);
        }
    }

    /**
     * Implementation of a routine how individual command instance is created.
     * (This functionality may be overridden by sub classes)
     */
    protected createCommandInstance(commandMapping: CommandMappingImpl, event: Event): Command {
        // Create a subInjector and provide a mapping of the Event by its class
        const subInjector = this.injector.createSubInjector();
        subInjector.map(<Type>event.constructor).toValue(event);
        return subInjector.instantiateInstance(commandMapping.command);
    }

    /**
     * Number of active mappings on this Command Map instance.
     * @returns {number}
     */
    get mappingCount(): number {
        return this.commandMappings.length;
    }
}
