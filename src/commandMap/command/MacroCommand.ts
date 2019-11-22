import {Command} from "./Command";
import {Injector} from "../../injector/Injector";
import {Inject} from "../../metadata/decorator/Inject";
import {EventGuard} from "../../eventDispatcher/api/EventGuard";
import {Event} from "../../eventDispatcher/event/Event";
import {isSubCommand, SubCommand} from "./SubCommand";

/**
 * Macro command provides the functionality of sequential execution of a sub-command batch.
 */
export abstract class MacroCommand<T = void> extends Command {

    @Inject()
    private readonly __injector: Injector;

    @Inject()
    private readonly __event: Event;

    protected readonly commands: ReadonlyArray<SubCommand<T>>;

    private halted = false;

    protected constructor(...commands: Array<SubCommand['type'] | SubCommand>) {
        super();
        this.commands = commands.map(entry => !isSubCommand(entry) ? {type: entry} : entry);
    }

    /**
     * Execute macro command.
     */
    async execute(): Promise<void> {
        const {commands} = this;
        if (!commands || !commands.length) {
            return;
        }

        for (const command of commands) {
            const result = this.executeSubCommand(command);
            if (isPromise(result)) {
                await result;
            }
            if (this.halted) {
                // Stop sub command execution if breakExecution is set to true
                break;
            }
        }
    }

    protected executeSubCommand({type, guards}: SubCommand<T>): T | Promise<T> {
        const {__injector: injector} = this;
        // Execution is blocked by a guard
        if (this.executionAllowedByGuards(guards) === false) {
            return;
        }

        const command = injector.instantiateInstance(type);
        const valueOrPromiseOfValue = command.execute();

        // If we're dealing with async Command - wait command to execute before dismantling Command instance
        if (valueOrPromiseOfValue && isPromise(valueOrPromiseOfValue)) {
            return new Promise<T>(async resolve => {
                const response = await valueOrPromiseOfValue;
                injector.destroyInstance(command);
                resolve(response);
            });
        }
        injector.destroyInstance(command);

        return valueOrPromiseOfValue;
    }

    /**
     * Stop macro command execution chain.
     */
    protected readonly haltExecution = () => this.halted = true;

    /**
     * Check if sub command execution was halted due to haltExecution() call or all sub commands were executed properly.
     */
    protected get executionIsHalted(): boolean {
        return this.halted;
    }

    /**
     * Find if command execution is allowed by guards.
     * @returns {boolean} True if guards aren't set or none of them has reason to stop execution.
     */
    private executionAllowedByGuards(guards?: EventGuard[]): boolean {
        const {__event: event} = this;
        if (!guards) {
            return true;
        }
        return guards.some(guard => guard(event) === false) === false;
    }

}

const isPromise = (entry: unknown): entry is Promise<any> => Promise.resolve(entry) === entry;
