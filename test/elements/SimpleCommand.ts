import {Command} from "../../src";

export class SimpleCommand extends Command {
    static readonly EVENT = 'test';

    static done: () => void;

    execute(): void {
        if (SimpleCommand.done) {
            SimpleCommand.done();
        }
    }

}
