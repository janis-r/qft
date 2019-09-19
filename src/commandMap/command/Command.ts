/**
 * Command class class/interface which has to be implemented, directly or not, by any
 * class which is used for event to command mapping.
 */
export abstract class Command<T = void> {
    /**
     * Invoked as command is executed
     */
    abstract execute(): T | Promise<T>;
}
