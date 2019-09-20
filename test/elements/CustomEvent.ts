import {Event} from "../../src/eventDispatcher/event/Event";

export class CustomEvent extends Event {

    constructor(type:string, data?:any) {
        super(type, data);
    }

}
