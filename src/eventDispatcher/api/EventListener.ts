import {Event} from "../event/Event";
/**
 * Describes a method that is used as an event listener call, optionally receiving the event data
 * as the parameter.
 */
export type EventListener<E extends Event = Event> = {
    /**
     * @param event Optional parameter for receiving Event data passed by the event dispatch.
     */
    (event?: E): void;
}
