import {Command} from "./Command";
import {Type} from "../../type";
import {Injector} from "../../injector/Injector";
import {Inject} from "../../metadata/decorator/Inject";
import {EventGuard} from "../../eventDispatcher/api/EventGuard";
import {Event} from "../../eventDispatcher/event/Event";

/**
 * Macro command provides the functionality of sequential execution of a sub-command batch.
 */
export abstract class MacroCommand extends Command {

    @Inject()
    protected readonly injector: Injector;

    @Inject()
    protected readonly event: Event;

    private readonly commands: SubCommand[] = [];

    constructor (commands: (SubCommand['type'] | SubCommand)[]) {
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
            await this.executeSubCommand(command);
        }
    }

    protected executeSubCommand<T = void>({type, guards} : SubCommand): T | Promise<T> {
        const {injector} = this;
        // Execution is blocked by a guard
        if (this.executionAllowedByGuards(guards) === false) {
            return;
        }

        const command = injector.instantiateInstance(type);
        const possiblePromise = command.execute();

        // If we're dealing with async Command - wait command to execute before dismantling Command instance
        if (possiblePromise && isPromise(possiblePromise)) {
            return new Promise<any>(async resolve => {
                const response = await possiblePromise;
                injector.destroyInstance(command);
                resolve(response);
            });
        }
        injector.destroyInstance(command);
    }

    /**
     * Find if command execution is allowed by guards.
     * @returns {boolean} True if guards aren't set or none of them has reason to stop execution.
     */
    private executionAllowedByGuards(guards?: EventGuard[]): boolean {
        if (!guards) {
            return true;
        }
        return guards.some(guard => guard(this.event) === false) === false;
    }

}

type SubCommand = {
    type: Type<Command>,
    guards?: EventGuard[]
};

const isSubCommand = (entry: unknown): entry is SubCommand => {
    const keys = Object.keys(entry);
    return keys.length > 0 && keys.length <= 2 && keys.indexOf("type") !== -1;
};

const isPromise = (entry: unknown): entry is Promise<any> => Promise.resolve(entry) === entry;
