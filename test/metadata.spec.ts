import "reflect-metadata";
import {Context, Injector} from "../src";
import {metadata} from "../src/metadata/metadata";
import {InjectionConfig} from "../src/metadata/data/InjectionConfig";
import {ModuleWithMetatags} from "./elements/ModuleWithMetatags";
import {InjectedClass} from "./elements/InjectedClass";
import {Interface} from "./elements/Interface";
import {SimpleModel} from "./elements/SimpleModel";
import {SimpleModel2} from "./elements/SimpleModel2";
import {RequiredModule} from "./elements/RequiredModule";
import {SimpleModule} from "./elements/SimpleModule";
import {RequiredClass} from "./elements/RequiredClass";
import {SimpleModule2} from "./elements/SimpleModule2";
import {ModuleWithClassMapping} from "./elements/ModuleWithClassMapping";

describe("Metadata module", () => {

    beforeEach(() => RequiredModule.constructionCallback = null);

    it("Can provide constructor arguments", () => {
        const {constructorArguments} = metadata.getTypeDescriptor(ModuleWithMetatags);
        expect(constructorArguments.length).toBe(2);
        const [firstInjection, secondInjection] = constructorArguments;
        expect(firstInjection.type).toBe(Injector);
        expect(secondInjection.type).toBe(InjectedClass);
        expect(firstInjection.isOptional).toBe(false);
        expect(secondInjection.isOptional).toBe(true);
    });

    it("Getting Type Descriptor of a class without descriptors will cause an error", () => {
        expect(() => metadata.getTypeDescriptor(Interface)).toThrow(Error);
    });

    it("Get module descriptor", () => {
        const {moduleDescriptor: {mappings, requires}} = metadata.getTypeDescriptor(ModuleWithMetatags);
        expect(mappings.length).toBe(3);

        expect(mappings[0]).toBe(InjectedClass);
        expect((mappings[1] as InjectionConfig).map).toBe(SimpleModel);
        expect((mappings[2] as InjectionConfig).map).toBe(SimpleModel2);
        expect((mappings[2] as InjectionConfig).useExisting).toBe(SimpleModel);

        expect(requires.length).toBe(1);
        expect(requires[0]).toBe(RequiredModule);
    });

    it("Get postConstruct methods", () => {
        const {postConstructMethods} = metadata.getTypeDescriptor(ModuleWithMetatags);
        expect(postConstructMethods.length).toBe(2);
        ["postConstruct", "anotherPostConstruct"].forEach(
            (value, index) => expect(postConstructMethods[index]).toBe(value)
        );
    });

    it("Get preDestroy methods", () => {
        const {preDestroyMethods} = metadata.getTypeDescriptor(ModuleWithMetatags);
        expect(preDestroyMethods.length).toBe(2);
        ["preDestroy", "anotherPreDestroy"].forEach(
            (value, index) => expect(preDestroyMethods[index]).toBe(value)
        );
    });

    it("Get property injections", () => {
        const {propertyInjections} = metadata.getTypeDescriptor(ModuleWithMetatags);
        expect(propertyInjections.length).toBe(2);
        [InjectedClass, Injector].forEach(
            (value, index) => expect(propertyInjections[index].type).toBe(value)
        );
    });

    it("@Module metadata Requires", () => {
        const context = new Context();
        context.configure(SimpleModule);
        context.initialize();
        expect(context.hasModule(RequiredModule)).toBe(true);
    });

    it("@Module metadata Requires a non module", () => {
        RequiredClass.constructionCallback = () => {
            throw new Error("RequiredClass should not be initialized because @Module 'requires' tag should only create new modules not classes");
        };
        const context = new Context();
        context.configure(SimpleModule2);
        context.initialize();
        expect(context.injector.hasDirectMapping(RequiredClass)).toBe(false);
    });

    it("@Module Class mapping in metadata is parsed right", () => {
        const context = new Context();
        context.configure(ModuleWithClassMapping);
        context.initialize();
        expect(context.injector.get(SimpleModel)).not.toBe(context.injector.get(SimpleModel));
    });
});
