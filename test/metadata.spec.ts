import "reflect-metadata";
import {Injector} from "../src/injector/Injector";
import {metadata} from "../src/metadata/metadata";
import {InjectionDescriptor} from "../src/metadata/data/InjectionDescriptor";
import {Context} from "../src/context/Context";
import {CustomModuleWithMetatags} from "./elements/CustomModuleWithMetatags";
import {CustomInjectedClass} from "./elements/CustomInjectedClass";
import {CustomInterface} from "./elements/CustomInterface";
import {CustomModel} from "./elements/CustomModel";
import {CustomModel2} from "./elements/CustomModel2";
import {RequiredModule} from "./elements/RequiredModule";
import {CustomModule} from "./elements/CustomModule";
import {RequiredClass} from "./elements/RequiredClass";
import {CustomModule2} from "./elements/CustomModule2";
import {ModuleWithClassMapping} from "./elements/ModuleWithClassMapping";

describe("Metadata module", () => {

    beforeEach(() => RequiredModule.constructionCallback = null);

    it("Can provide constructor arguments", () => {
        const {constructorArguments} = metadata.getTypeDescriptor(CustomModuleWithMetatags);
        expect(constructorArguments.length).toBe(2);
        const [firstInjection, secondInjection] = constructorArguments;
        expect(firstInjection.type).toBe(Injector);
        expect(secondInjection.type).toBe(CustomInjectedClass);
        expect(firstInjection.isOptional).toBe(false);
        expect(secondInjection.isOptional).toBe(true);
    });

    it("Getting Type Descriptor of a class without descriptors will cause an error", () => {
        expect(() => metadata.getTypeDescriptor(CustomInterface)).toThrow(Error);
    });

    it("Get module descriptor", () => {
        const {moduleDescriptor: {mappings, requires}} = metadata.getTypeDescriptor(CustomModuleWithMetatags);
        expect(mappings.length).toBe(3);

        expect(mappings[0]).toBe(CustomInjectedClass);
        expect((mappings[1] as InjectionDescriptor).map).toBe(CustomModel);
        expect((mappings[2] as InjectionDescriptor).map).toBe(CustomModel2);
        expect((mappings[2] as InjectionDescriptor).useExisting).toBe(CustomModel);

        expect(requires.length).toBe(1);
        expect(requires[0]).toBe(RequiredModule);
    });

    it("Get postConstruct methods", () => {
        const {postConstructMethods} = metadata.getTypeDescriptor(CustomModuleWithMetatags);
        expect(postConstructMethods.length).toBe(2);
        ["postConstruct", "anotherPostConstruct"].forEach(
            (value, index) => expect(postConstructMethods[index]).toBe(value)
        );
    });

    it("Get preDestroy methods", () => {
        const {preDestroyMethods} = metadata.getTypeDescriptor(CustomModuleWithMetatags);
        expect(preDestroyMethods.length).toBe(2);
        ["preDestroy", "anotherPreDestroy"].forEach(
            (value, index) => expect(preDestroyMethods[index]).toBe(value)
        );
    });

    it("Get property injections", () => {
        const {propertyInjections} = metadata.getTypeDescriptor(CustomModuleWithMetatags);
        expect(propertyInjections.length).toBe(2);
        [CustomInjectedClass, Injector].forEach(
            (value, index) => expect(propertyInjections[index].type).toBe(value)
        );
    });

    it("@Module metadata Requires", () => {
        const context = new Context();
        context.configure(CustomModule);
        context.initialize();
        expect(context.hasModule(RequiredModule)).toBe(true);
    });

    it("@Module metadata Requires a non module", () => {
        RequiredClass.constructionCallback = () => {
            throw new Error("RequiredClass should not be initialized because @Module 'requires' tag should only create new modules not classes");
        };
        const context = new Context();
        context.configure(CustomModule2);
        context.initialize();
    });

    it("@Module Class mapping in metadata is parsed right", () => {
        const context = new Context();
        context.configure(ModuleWithClassMapping);
        context.initialize();
        expect(context.injector.get(CustomModel)).not.toBe(context.injector.get(CustomModel));
    });
});
