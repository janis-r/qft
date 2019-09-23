import "reflect-metadata";
import {Context, ContextModuleEvent, EventDispatcher, WebApplicationBundle} from "../src";
import {ModuleWithMetatags} from "./elements/ModuleWithMetatags";
import {SimpleCommand} from "./elements/SimpleCommand";

describe("Event dispatcher", () => {

    let context: Context;

    beforeEach(() => context = new Context());
    afterEach(() => {
        if (!context) {
            return;
        }

        if (context.initialized && !context.destroyed) {
            // Destroying a context should not cause any errors
            expect(() => context.destroy()).not.toThrow(Error);
        }
    });

    it("Initialize", () => {
        context.initialize();
        expect(context.initialized).toBe(true);
        [
            () => context.install(),
            () => context.uninstall(),
            () => context.configure(),
            () => context.initialize()
        ].forEach(method => expect(() => method()).toThrow(Error));
    });

    it("Install", () => {
        context.install(...WebApplicationBundle);
        for (const extension of WebApplicationBundle) {
            expect(context.hasExtension(extension)).toBe(true);
        }
    });

    it("Uninstall", () => {
        context.install(...WebApplicationBundle);
        context.uninstall(...WebApplicationBundle);

        for (const extension of WebApplicationBundle) {
            expect(context.hasExtension(extension)).toBe(false);
        }
    });

    it("Configure", done => {
        context.install(...WebApplicationBundle);
        context.configure(ModuleWithMetatags);
        const checkRegisteredModule = (event: ContextModuleEvent) => {
            if (event.moduleType === ModuleWithMetatags) {
                done();
            }
        };
        context.addEventListener(ContextModuleEvent.REGISTER_MODULE, checkRegisteredModule, this);
        context.initialize();
    });

    it("CommandMapExtension", done => {
        context.install(...WebApplicationBundle);
        context.configure(ModuleWithMetatags);
        context.initialize();
        SimpleCommand.done = done;
        const dispatcher = context.injector.get(EventDispatcher);
        dispatcher.dispatchEvent("Test");
    });

    it("Destroy", () => {
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

        context = null;
    });

});
