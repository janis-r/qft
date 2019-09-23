import {Command} from "../../src";

export class AsyncCommand extends Command {

    async execute(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}
