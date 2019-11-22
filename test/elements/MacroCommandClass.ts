import {MacroCommand} from "../../src";
import {SimpleCommand} from "./SimpleCommand";
import {SimpleCommand2} from "./SimpleCommand2";
import {AsyncCommand} from "./AsyncCommand";

export class MacroCommandClass extends MacroCommand {
    
    static done: () => void;

    constructor() {
        super(
            AsyncCommand,
            SimpleCommand,
            {type: SimpleCommand2, guards: [() => true]},
            {type: SimpleCommand2, guards: [() => false]}
        );
    }

    async execute(): Promise<void> {
        await super.execute();
        if (MacroCommandClass.done) {
            MacroCommandClass.done();
        }
    }
}
