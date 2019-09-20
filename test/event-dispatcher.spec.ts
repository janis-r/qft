import "reflect-metadata";
import {EventDispatcher} from "../src/eventDispatcher/EventDispatcher";
import {EventListener} from "../src/eventDispatcher/api/EventListener";
import {EventGuard} from "../src/eventDispatcher/api/EventGuard";
import {Event} from "../src/eventDispatcher/event/Event";
import {CustomEvent} from "./elements/CustomEvent";

describe("Event dispatcher", () => {

    let eventDispatcher: EventDispatcher;

    beforeEach(() => eventDispatcher = new EventDispatcher());
    afterEach(() => eventDispatcher.removeAllEventListeners());

    const verifyListenerExistence = (eventName: string, callback: EventListener, scope) => {
        expect(eventDispatcher.hasEventListener(eventName)).toBe(true);
        expect(eventDispatcher.hasEventListener(eventName, callback)).toBe(true);
        expect(eventDispatcher.hasEventListener(eventName, callback, scope)).toBe(true);
    };

    it("Instantiation", () => {
        expect(eventDispatcher).not.toBeNull();
        expect(eventDispatcher.listenerCount).toBe(0);
    });

    it("Add listener", () => {
        const eventName = "test";
        const scope = this;
        const callback: EventListener = () => expect(scope).toBe(this);

        expect(eventDispatcher.addEventListener(eventName, callback, scope)).not.toBeNull();
        expect(eventDispatcher.addEventListener(eventName, callback, scope)).toBeNull();
        expect(() => eventDispatcher.addEventListener(eventName, null, scope)).toThrow(Error);

        verifyListenerExistence(eventName, callback, scope);
        eventDispatcher.dispatchEvent(eventName);
        verifyListenerExistence(eventName, callback, scope);
    });

    it("Add listener once", () => {
        const eventName = "test";
        const scope = this;

        let completeCount = 0;
        const callback: EventListener = () => {
            completeCount++;
            expect(completeCount).toBeLessThan(2);
        };

        eventDispatcher.addEventListener(eventName, callback, scope).once();
        eventDispatcher.dispatchEvent(eventName);
        expect(eventDispatcher.hasEventListener(eventName, callback, scope)).toBe(false);
        eventDispatcher.dispatchEvent(eventName);
    });

    it("Add listener with guards", () => {
        const eventName = "test";
        const callback: EventListener = (event: CustomEvent) => expect(event.data.pass).toBe(true);
        const guard: EventGuard = (event: CustomEvent) => event.data.pass;
        eventDispatcher.addEventListener(eventName, callback).withGuards(guard);
        eventDispatcher.dispatchEvent(eventName, {pass: true});
        eventDispatcher.dispatchEvent(eventName, {pass: false});
    });

    it("Remove listener", () => {
        const eventName = "test";
        const scope = this;
        const callback: EventListener = () => {
            throw new Error("Callback should not be called if listener has been removed");
        };

        eventDispatcher.addEventListener(eventName, callback, scope).once();
        expect(eventDispatcher.removeEventListener(eventName, callback, scope)).toBe(true);
        eventDispatcher.dispatchEvent(eventName);
        expect(eventDispatcher.removeEventListener(eventName, callback, scope)).toBe(false);
        expect(() => eventDispatcher.removeEventListener(eventName, null, scope)).toThrow(Error);
    });

    it("Remove listeners", () => {
        const eventName = "test";
        const scope = this;
        const callback: EventListener = () => {
            throw new Error("Callback should not be called if listener has been removed");
        };

        eventDispatcher.addEventListener(eventName, callback, scope).once();

        expect(eventDispatcher.removeEventListeners(eventName)).toBe(true);
        expect(eventDispatcher.removeEventListeners(eventName)).toBe(false);
        expect(eventDispatcher.hasEventListener(eventName)).toBe(false);
    });

    it("Remove all listeners", () => {
        const eventName = "firstEvent";
        const eventName2 = "secondEvent";
        const scope = this;
        const callback: EventListener = () => {
            throw new Error("Callback should not be called because all listeners have been removed");
        };

        eventDispatcher.addEventListener(eventName, callback, scope);
        eventDispatcher.addEventListener(eventName2, callback);
        expect(eventDispatcher.removeAllEventListeners(scope)).toBe(true);
        expect(eventDispatcher.listenerCount).toBe(1);
        eventDispatcher.addEventListener(eventName, callback, scope);
        expect(eventDispatcher.removeAllEventListeners()).toBe(true);
        expect(eventDispatcher.listenerCount).toBe(0);
        eventDispatcher.dispatchEvent(eventName);
        eventDispatcher.dispatchEvent(eventName2);
    });

    it("Event toString validation", () => {
        const eventName = "Test Event";
        expect(new Event(eventName).toString()).toBe(`[Event type=${eventName}, data=undefined]`);
    });

    it("Event dispatch with data", () => {
        const eventName = "test";
        const data = {pass: true};
        const callback: EventListener = (receivedEvent) => {
            if (receivedEvent.type !== eventName || receivedEvent.data !== data) {
                throw new Error("Data received on event callback does not match dispatched data");
            }
        };
        eventDispatcher.addEventListener(eventName, callback);
        eventDispatcher.dispatchEvent(eventName, data);
    });

    it("Custom event dispatch", () => {
        const data = {pass: true};
        const event = new CustomEvent("test", data);
        const callback: EventListener = (receivedEvent) => {
            if (receivedEvent !== event || receivedEvent.type !== event.type || receivedEvent.data !== data) {
                throw new Error("Data received on event callback does not match dispatched data");
            }
        };
        eventDispatcher.addEventListener(event.type, callback);
        eventDispatcher.dispatchEvent(event);
    });

    it("Check invalid dispatch", () => {
        [undefined, null, ""].forEach(
            value => expect(() => eventDispatcher.dispatchEvent(value)).toThrow(Error)
        );
    });

    it("Check invalid event listeners", () => {
        [undefined, null, ""].forEach(value => {
            expect(() => eventDispatcher.addEventListener(value, () => null)).toThrow(Error);
            expect(() => eventDispatcher.removeEventListener(value, () => null)).toThrow(Error);
        });
    });

    it("Check if Event preventDefault works", () => {
        const event = new Event("foo");
        expect(eventDispatcher.dispatchEvent(event)).toBe(true);
        eventDispatcher.addEventListener("foo", () => ({}));
        expect(eventDispatcher.dispatchEvent(event)).toBe(true);
        eventDispatcher.addEventListener("foo", event => event.preventDefault());
        expect(eventDispatcher.dispatchEvent(event)).toBe(false);
        expect(event.defaultPrevented).toBe(true);

    });

});
