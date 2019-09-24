import "reflect-metadata";
import {CommandMapExtension, Context, ContextModuleEvent, EventDispatcher, WebApplicationBundle} from "../src";
import {ModuleWithMetatags} from "./elements/ModuleWithMetatags";
import {SimpleCommand} from "./elements/SimpleCommand";
import {RequiredModule} from "./elements/RequiredModule";
import {InjectedClass} from "./elements/InjectedClass";
import {SimpleModel} from "./elements/SimpleModel";
import {SimpleModel2} from "./elements/SimpleModel2";

describe("Application context", () => {

    let context: Context;

    beforeEach(() => context = new Context());
    afterEach(() => {
        if (context.initialized && !context.destroyed) {
            expect(() => context.destroy()).not.toThrow(Error);
        }
    });

    it("Extensions can be installed and uninstalled", () => {
        context.install(...WebApplicationBundle);
        WebApplicationBundle.forEach(extension => expect(context.hasExtension(extension)).toBe(true));

        context.uninstall(...WebApplicationBundle);
        WebApplicationBundle.forEach(extension => expect(context.hasExtension(extension)).toBe(false));
    });

    it("Configured module will be reported on context init", () => {
        context.install(...WebApplicationBundle);
        context.configure(ModuleWithMetatags);

        let moduleIsReported = false;
        context.addEventListener(ContextModuleEvent.REGISTER_MODULE, () => moduleIsReported = true).withGuards(
            ({moduleType}: ContextModuleEvent) => moduleType === ModuleWithMetatags
        );
        context.initialize();

        expect(moduleIsReported).toBe(true);
    });

    it("Initialized context will throw error on attempt to update", () => {
        context.initialize();
        expect(context.initialized).toBe(true);
        [
            () => context.install(),
            () => context.uninstall(),
            () => context.configure(),
            () => context.initialize()
        ].forEach(method => expect(() => method()).toThrow(Error));
    });

    it("Context can be destroyed", () => {
        expect(() => context.destroy()).toThrow(Error);
        context.initialize();
        expect(() => context.destroy()).not.toThrow(Error);
        expect(context.destroyed).toBe(true);

        [
            () => context.install(),
            () => context.uninstall(),
            () => context.configure()
        ].forEach(method =>
            expect(() => method()).toThrow(Error)
        );
    });

    it("Command map extension works", () => {
        context.install(CommandMapExtension);
        context.configure(ModuleWithMetatags);
        context.initialize();
        const callback = jest.fn();
        SimpleCommand.done = callback;
        context.injector.get(EventDispatcher).dispatchEvent(SimpleCommand.EVENT);
        expect(callback).toBeCalled();
        SimpleCommand.done = null;
    });

    it("Module descriptor can be used as configuration entity", () => {
        const module = {
            requires: [RequiredModule],
            mappings: [
                InjectedClass,
                {map: SimpleModel, useValue: new SimpleModel()},
                {map: SimpleModel2, useExisting: SimpleModel}
            ],
            commands: [
                {event: SimpleCommand.EVENT, command: SimpleCommand, once: true}
            ]
        };

        context.install(...WebApplicationBundle);
        context.configure(module);

        let moduleIsReported = false;
        context.addEventListener(ContextModuleEvent.REGISTER_MODULE, () => moduleIsReported = true).withGuards(
            ({moduleType}: ContextModuleEvent) => moduleType === module
        );
        context.initialize();

        expect(moduleIsReported).toBe(true);
    });

});
