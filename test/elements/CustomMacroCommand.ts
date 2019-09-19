import {MacroCommand} from "../../src/commandMap/command/MacroCommand";
import {CustomCommand} from "./CustomCommand";
import {CustomCommand2} from "./CustomCommand2";
import {CustomAsyncCommand} from "./CustomAsyncCommand";

export class CustomMacroCommand extends MacroCommand {

    /**
     * Async test callback function
     */
    static done: () => void;

    constructor() {
        super([
            CustomAsyncCommand,
            CustomCommand,
            {type: CustomCommand2, guards: [() => true]},
            {type: CustomCommand2, guards: [() => false]}
        ]);
    }

    async execute(): Promise<void> {
        await super.execute();
        if (CustomMacroCommand.done) {
            CustomMacroCommand.done();
        }
    }
}
