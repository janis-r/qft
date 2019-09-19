import "reflect-metadata";
import {CommandMap} from "../src/commandMap/CommandMap";
import {Injector} from "../src/injector/Injector";
import {Event} from "../src/eventDispatcher/event/Event";
import {CustomCommand} from "./elements/CustomCommand";
import {CommandMappingImpl} from "../src/commandMap/data/impl/CommandMappingImpl";
import {CustomCommand2} from "./elements/CustomCommand2";
import {CustomMacroCommand} from "./elements/CustomMacroCommand";

describe("Command map", () => {

    const injector = new Injector();
    let commandMap: CommandMap;

    beforeEach(() => commandMap = injector.instantiateInstance(CommandMap));
    afterEach(() => {
        // Clear custom command static callbacks
        CustomCommand.done = null;
        CustomCommand2.done = null;
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
        CustomCommand.done = callback;

        const {eventClass} = commandMap.map(eventName, CustomCommand) as CommandMappingImpl;
        expect(eventClass).toBe(Event);
        expect(commandMap.mappingCount).toBe(1);

        commandMap.trigger(eventName);
        expect(callback).toBeCalled();
    });

    it("Map command once", () => {
        const eventName = "test";
        let executeCount = 0;

        CustomCommand.done = () => executeCount++;

        commandMap.map(eventName, CustomCommand).once();
        commandMap.trigger(eventName);
        expect(executeCount).toBe(1);
        expect(commandMap.mappingCount).toBe(0);
        commandMap.trigger(eventName);
        expect(executeCount).toBe(1);
    });

    it("Map command twice", () => {
        const eventName = "test";
        expect(commandMap.map(eventName, CustomCommand)).not.toBe(null);
        expect(commandMap.map(eventName, CustomCommand)).toBe(null);
    });

    it("Map command to two events", () => {
        const eventName = "test";
        const eventName2 = "test2";

        let executeCount = 0;
        CustomCommand.done = () => executeCount++;
        commandMap.map(eventName, CustomCommand);
        commandMap.map(eventName2, CustomCommand);
        commandMap.trigger(eventName2);
        commandMap.trigger(eventName);
        expect(executeCount).toBe(2);
    });

    it("Map command with successful guard", () => {
        const eventName = "test";
        const callback = jest.fn();
        CustomCommand.done = callback;
        commandMap.map(eventName, CustomCommand).withGuards(() => true);
        commandMap.trigger(eventName);
        expect(callback).toBeCalled();
    });

    it("Map command with unsuccessful guard", () => {
        const eventName = "test";
        const callback = jest.fn();
        CustomCommand.done = callback;
        commandMap.map(eventName, CustomCommand).withGuards(() => false);
        commandMap.trigger(eventName);
        expect(callback).not.toBeCalled();
    });

    it("unMap command", () => {
        const eventName = "test";
        const callback = jest.fn();
        CustomCommand.done = callback;
        commandMap.map(eventName, CustomCommand);
        commandMap.unMap(eventName, CustomCommand);
        expect(commandMap.mappingCount).toBe(0);
        commandMap.trigger(eventName);
        expect(callback).not.toBeCalled();
    });

    it("unMap command twice", () => {
        const eventName = "test";
        const eventName2 = "test2";

        commandMap.map(eventName, CustomCommand);
        commandMap.map(eventName2, CustomCommand);

        expect(commandMap.unMap(eventName, CustomCommand)).toBe(true);
        expect(commandMap.unMap(eventName, CustomCommand)).toBe(false);
    });

    it("unMap command from two different events", () => {
        const eventName = "test";
        const eventName2 = "test2";

        commandMap.map(eventName, CustomCommand);
        commandMap.map(eventName2, CustomCommand);

        expect(commandMap.unMap(eventName, CustomCommand)).toBe(true);
        expect(commandMap.unMap(eventName2, CustomCommand)).toBe(true);
    });

    it("unMap command from wrong event", () => {
        const eventName = "test";
        const eventName2 = "test2";

        commandMap.map(eventName2, CustomCommand2);
        commandMap.map(eventName, CustomCommand);

        expect(commandMap.unMap(eventName2, CustomCommand)).toBe(false);
    });

    it("unMap all commands from event", () => {
        const eventName = "test";
        const callback = jest.fn();
        CustomCommand.done = callback;
        commandMap.map(eventName, CustomCommand);
        commandMap.map(eventName, CustomCommand2);
        commandMap.unMap(eventName);
        expect(commandMap.mappingCount).toBe(0);
        commandMap.trigger(eventName);
        expect(callback).not.toBeCalled();
    });

    it("unMap everything", () => {
        const eventName = "firstEvent";
        const eventName2 = "secondEvent";
        const callback = jest.fn();
        CustomCommand.done = callback;
        commandMap.map(eventName, CustomCommand);
        commandMap.map(eventName2, CustomCommand);
        commandMap.map(eventName, CustomCommand2);
        commandMap.map(eventName2, CustomCommand2);
        commandMap.unMap();
        expect(commandMap.mappingCount).toBe(0);
        commandMap.trigger(eventName);
        expect(callback).not.toBeCalled();
    });

    it("Check invalid value mapping", () => {
        const eventName = "test";
        const invalidValues = [undefined, null, ""];
        invalidValues.forEach(value => {
            expect(() => commandMap.map(value, CustomCommand)).toThrow(Error);
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
        CustomMacroCommand.done = callback;
        commandMap.map(eventName, CustomMacroCommand);
        commandMap.trigger(eventName);
        await new Promise(resolve => setTimeout(resolve, 1000));
        expect(callback).toBeCalled();
    });
});
