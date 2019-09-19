import {EventDispatcher} from "../../../../eventDispatcher/EventDispatcher";
import {Event} from "../../../../eventDispatcher/event/Event";
import {CommandMap} from "../../../../commandMap/CommandMap";
import {Inject} from "../../../../metadata/decorator/Inject";

/**
 * Custom implementation of EventDispatcher that will trigger command map each time EventDispatcher receives
 * event dispatch
 */
export class EventDispatcherForCommandMap extends EventDispatcher {

    @Inject()
    private readonly commandMap: CommandMap;

    dispatchEventImpl(event: Event): boolean {
        this.commandMap.trigger(event);
        return super.dispatchEventImpl(event);
    }

}
