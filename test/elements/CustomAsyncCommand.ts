import {Command} from "../../src/commandMap/command/Command";

/**
 * Custom Asynchronous Command class for testing purposes
 * @author Kristaps Peļņa
 */
export class CustomAsyncCommand extends Command {

    async execute():Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}
