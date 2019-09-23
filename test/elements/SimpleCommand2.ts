import {Command} from "../../src";

export class SimpleCommand2 extends Command {


    static done:() => void;

    execute():void {
        if (SimpleCommand2.done) {
            SimpleCommand2.done();
        }
    }

}
