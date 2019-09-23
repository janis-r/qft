import {Event} from "../../src";

export class SimpleEvent extends Event {

    constructor(type: string, data?: any) {
        super(type, data);
    }

}
