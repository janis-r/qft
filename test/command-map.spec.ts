import "reflect-metadata";
import {CommandMap, Event, Injector} from "../src";
import {CommandMappingImpl} from "../src/commandMap/data/impl/CommandMappingImpl";
import {SimpleCommand} from "./elements/SimpleCommand";
import {SimpleCommand2} from "./elements/SimpleCommand2";
import {MacroCommandClass} from "./elements/MacroCommandClass";

describe("Command map", () => {

    const injector = new Injector();
    let commandMap: CommandMap;

    beforeEach(() => commandMap = injector.instantiateInstance(CommandMap));
    afterEach(() => {
        // Clear custom command static callbacks
        SimpleCommand.done = null;
        SimpleCommand2.done = null;
    });

    it("Can initialize", () => {
        expect(commandMap).not.toBe(null);
        expect(commandMap.mappingCount).toBe(0);
    });

    it("Trigger event with event instance or name", () => {
        const eventName = "test";
        const event = new Event(eventName);
        expect(() => commandMap.trigger(eventName)).not.toThrow();
        expect(() => commandMap.trigger(event)).not.toThrow();
        expect(() => commandMap.trigger(null)).toThrow();
    });
    //
    it("Map command", () => {
        const eventName = "test";

        const callback = jest.fn();
        SimpleCommand.done = callback;

        const {eventClass} = commandMap.map(eventName, SimpleCommand) as CommandMappingImpl;
        expect(eventClass).toBe(Event);
        expect(commandMap.mappingCount).toBe(1);

        commandMap.trigger(eventName);
        expect(callback).toBeCalled();
    });

    it("Map command once", () => {
        const eventName = "test";
        let executeCount = 0;

        SimpleCommand.done = () => executeCount++;

        commandMap.map(eventName, SimpleCommand).once();
        commandMap.trigger(eventName);
        expect(executeCount).toBe(1);
        expect(commandMap.mappingCount).toBe(0);
        commandMap.trigger(eventName);
        expect(executeCount).toBe(1);
    });

    it("Map command twice", () => {
        const eventName = "test";
        expect(commandMap.map(eventName, SimpleCommand)).not.toBe(null);
        expect(commandMap.map(eventName, SimpleCommand)).toBe(null);
    });

    it("Map command to two events", () => {
        const eventName = "test";
        const eventName2 = "test2";

        let executeCount = 0;
        SimpleCommand.done = () => executeCount++;
        commandMap.map(eventName, SimpleCommand);
        commandMap.map(eventName2, SimpleCommand);
        commandMap.trigger(eventName2);
        commandMap.trigger(eventName);
        expect(executeCount).toBe(2);
    });

    it("Map command with successful guard", () => {
        const eventName = "test";
        const callback = jest.fn();
        SimpleCommand.done = callback;
        commandMap.map(eventName, SimpleCommand).withGuards(() => true);
        commandMap.trigger(eventName);
        expect(callback).toBeCalled();
    });

    it("Map command with unsuccessful guard", () => {
        const eventName = "test";
        const callback = jest.fn();
        SimpleCommand.done = callback;
        commandMap.map(eventName, SimpleCommand).withGuards(() => false);
        commandMap.trigger(eventName);
        expect(callback).not.toBeCalled();
    });

    it("unMap command", () => {
        const eventName = "test";
        const callback = jest.fn();
        SimpleCommand.done = callback;
        commandMap.map(eventName, SimpleCommand);
        commandMap.unMap(eventName, SimpleCommand);
        expect(commandMap.mappingCount).toBe(0);
        commandMap.trigger(eventName);
        expect(callback).not.toBeCalled();
    });

    it("unMap command twice", () => {
        const eventName = "test";
        const eventName2 = "test2";

        commandMap.map(eventName, SimpleCommand);
        commandMap.map(eventName2, SimpleCommand);

        expect(commandMap.unMap(eventName, SimpleCommand)).toBe(true);
        expect(commandMap.unMap(eventName, SimpleCommand)).toBe(false);
    });

    it("unMap command from two different events", () => {
        const eventName = "test";
        const eventName2 = "test2";

        commandMap.map(eventName, SimpleCommand);
        commandMap.map(eventName2, SimpleCommand);

        expect(commandMap.unMap(eventName, SimpleCommand)).toBe(true);
        expect(commandMap.unMap(eventName2, SimpleCommand)).toBe(true);
    });

    it("unMap command from wrong event", () => {
        const eventName = "test";
        const eventName2 = "test2";

        commandMap.map(eventName2, SimpleCommand2);
        commandMap.map(eventName, SimpleCommand);

        expect(commandMap.unMap(eventName2, SimpleCommand)).toBe(false);
    });

    it("unMap all commands from event", () => {
        const eventName = "test";
        const callback = jest.fn();
        SimpleCommand.done = callback;
        commandMap.map(eventName, SimpleCommand);
        commandMap.map(eventName, SimpleCommand2);
        commandMap.unMap(eventName);
        expect(commandMap.mappingCount).toBe(0);
        commandMap.trigger(eventName);
        expect(callback).not.toBeCalled();
    });

    it("unMap everything", () => {
        const eventName = "firstEvent";
        const eventName2 = "secondEvent";
        const callback = jest.fn();
        SimpleCommand.done = callback;
        commandMap.map(eventName, SimpleCommand);
        commandMap.map(eventName2, SimpleCommand);
        commandMap.map(eventName, SimpleCommand2);
        commandMap.map(eventName2, SimpleCommand2);
        commandMap.unMap();
        expect(commandMap.mappingCount).toBe(0);
        commandMap.trigger(eventName);
        expect(callback).not.toBeCalled();
    });

    it("Check invalid value mapping", () => {
        const eventName = "test";
        const invalidValues = [undefined, null, ""];
        invalidValues.forEach(value => {
            expect(() => commandMap.map(value, SimpleCommand)).toThrow(Error);
            expect(() => commandMap.map(eventName, null)).toThrow(Error);
        });
    });

    it("Check invalid trigger", () => {
        const invalidValues = [undefined, null, ""];
        invalidValues.forEach(value => expect(() => commandMap.trigger(value)).toThrow(Error));
    });

    it("Macro command execute", async () => {
        const eventName = "test";
        const callback = jest.fn();
        MacroCommandClass.done = callback;
        commandMap.map(eventName, MacroCommandClass);
        commandMap.trigger(eventName);
        await new Promise(resolve => setTimeout(resolve, 1000));
        expect(callback).toBeCalled();
    });

    it ("Command guard work", () => {
        const type = "test";
        const callback = jest.fn();
        SimpleCommand.done = callback;
        commandMap.map(type, SimpleCommand, false, ({data}) => data);
        commandMap.trigger(new Event(type, false));
        expect(callback).not.toBeCalled();
        commandMap.trigger(new Event(type, true));
        expect(callback).toBeCalled();
    });
});
