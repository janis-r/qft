import "reflect-metadata";
import {Context, InjectionToken, Injector, WebApplicationBundle} from "../src";
import {AbstractClass} from "./elements/AbstractClass";
import {AbstractClassImpl} from "./elements/AbstractClassImpl";
import {SimpleModel2} from "./elements/SimpleModel2";
import {SimpleModel} from "./elements/SimpleModel";
import {SuperClassWithInjections} from "./elements/SuperClassWithInjections";
import {ClassWithInjectAndPreDestroy} from "./elements/ClassWithInjectAndPreDestroy";
import {ClassWithInjectAndPreDestroySubClass} from "./elements/ClassWithInjectAndPreDestroySubClass";
import {ClassWithPostConstruct} from "./elements/ClassWithPostConstruct";
import {ClassWithInjectedToken} from "./elements/ClassWithInjectedToken";
import {token} from "./elements/injection-token";
import {ClassWithOptionalInjection} from "./elements/ClassWithOptionalInjection";
import {RequiredClass} from "./elements/RequiredClass";

describe("Dependency injector configuration", () => {

    let injector: Injector;
    beforeEach(() => injector = new Injector());

    it("Injector.get(Injector) should returns itself", () => {
        expect(injector.get(Injector)).toBe(injector);
    });

    it("Accessing an unavailable type cause an error", () => {
        expect(() => injector.get(SimpleModel)).toThrow(Error);
    });

    it("Class type can be mapped", () => {
        injector.map(SimpleModel);
        const model = injector.get(SimpleModel);
        expect(model).not.toBeNull();
    });

    it("Class type mapping will return new instance on each request", () => {
        injector.map(SimpleModel);
        const model1 = injector.get(SimpleModel);
        expect(model1).not.toBeNull();
        const model2 = injector.get(SimpleModel);
        expect(model2).not.toBeNull();
        expect(model2).not.toBe(model1);
    });

    it("Class mapping will respect asSingleton setting", () => {
        injector.map(SimpleModel);
        expect(injector.get(SimpleModel)).not.toBe(injector.get(SimpleModel));
        injector.map(SimpleModel).asSingleton();
        expect(injector.get(SimpleModel)).toBe(injector.get(SimpleModel));
    });

    it("Abstract class can be mapped to singleton implementation", () => {
        injector.map(AbstractClass).toSingleton(AbstractClassImpl);
        expect(injector.get(AbstractClass)).toBeInstanceOf(AbstractClassImpl);
    });

    it("Class can be mapped to value", () => {
        const model = new SimpleModel();
        injector.map(SimpleModel).toValue(model);
        expect(injector.get(SimpleModel)).toBe(model);
    });

    it("Class can be mapped to existing mapping", () => {
        injector.map(AbstractClassImpl).asSingleton();
        injector.map(AbstractClass).toExisting(AbstractClassImpl);
        expect(injector.get(AbstractClassImpl)).not.toBeNull();
        expect(injector.get(AbstractClass)).toBe(injector.get(AbstractClassImpl));
    });

    it("Class can be mapped to factory", () => {
        injector.map(AbstractClass).toFactory(() => new AbstractClassImpl());
        expect(injector.get(AbstractClass)).toBeInstanceOf(AbstractClassImpl);
    });

    it("Factory mapping will respect asSingleton setting", () => {
        injector.map(AbstractClass).toFactory(() => new AbstractClassImpl());
        expect(injector.get(AbstractClass)).not.toBe(injector.get(AbstractClass));
        injector.map(AbstractClass).toFactory(() => new AbstractClassImpl()).asSingleton();
        expect(injector.get(AbstractClass)).toBe(injector.get(AbstractClass));
    });

    it("Value can be mapped to InjectionToken", () => {
        const token = new InjectionToken<{ foo: number, bar: string, lee: number | string }>('dummy token');
        const value = {foo: 1, bar: 'string', lee: 'number'};
        injector.map(token).toValue(value);
        expect(injector.get(token)).toBe(value);
    });

    it("Value can be mapped to InjectionToken 2", () => {
        const injectedValue = {bar: 1, foo: '1', lee: 'number'};
        injector.map(token).toValue(injectedValue);
        injector.map(ClassWithInjectedToken);

        expect(injector.get(ClassWithInjectedToken).property).not.toBeNull();
        expect(injector.get(ClassWithInjectedToken).property).toBe(injectedValue);
    });

    it("Can create sub injector", () => {
        const subInjector = injector.createSubInjector();
        subInjector.map(SimpleModel2).asSingleton();
        expect(subInjector.parent).toBe(injector);
        expect(subInjector.get(Injector)).toBe(subInjector);
    });

    it("Missing sub injector mappings are served from parent injector", () => {
        injector.map(SimpleModel).asSingleton();
        const subInjector = injector.createSubInjector();
        expect(subInjector.get(SimpleModel)).toBe(injector.get(SimpleModel));
    });

    it("Sub injector can de-define mappings from parent injector", () => {
        injector.map(SimpleModel).asSingleton();

        const subInjector = injector.createSubInjector();
        expect(subInjector.get(SimpleModel).value).toBe(SimpleModel.defaultValue);

        const newValue = 0xFFFFFF;
        subInjector.map(SimpleModel).toValue(new SimpleModel(newValue));
        expect(subInjector.get(SimpleModel).value).toBe(newValue);

        subInjector.unMap(SimpleModel);
        expect(subInjector.get(SimpleModel).value).toBe(SimpleModel.defaultValue);
    });

    it("Injector reports mapping state correctly", () => {
        injector.map(SimpleModel).asSingleton();
        expect(injector.hasMapping(SimpleModel)).toBe(true);
        expect(injector.hasDirectMapping(SimpleModel)).toBe(true);

        const subInjector = injector.createSubInjector();
        expect(subInjector.hasMapping(SimpleModel)).toBe(true);
        expect(subInjector.hasDirectMapping(SimpleModel)).toBe(false);
    });

    it("Injector mapping can be unmapped", () => {
        injector.map(SimpleModel).asSingleton();

        expect(injector.hasMapping(SimpleModel)).toBe(true);
        injector.unMap(SimpleModel);
        expect(injector.hasMapping(SimpleModel)).toBe(false);
        expect(() => injector.get(SimpleModel)).toThrow(Error);
    });

    it("Sealed mappings cannot be changed", () => {
        const mapping = injector.map(SimpleModel);
        mapping.seal();
        expect(() => mapping.asSingleton()).toThrow(Error);
    });

    it("Mapping can be unsealed", () => {
        const mapping = injector.map(SimpleModel);

        expect(() => mapping.unseal(null)).toThrow(Error);
        const sealKey = mapping.seal();

        expect(() => mapping.unseal("wrong key")).toThrow(Error);
        expect(() => mapping.unseal(sealKey)).not.toThrow(Error);
    });

    it("Unsealed injector mapping can be altered", () => {
        const mapping = injector.map(SimpleModel2);
        mapping.asSingleton();
        expect(() => mapping.toValue(new SimpleModel())).not.toThrow(Error);
    });

    it("Mapping can be destroyed", () => {
        const mapping = injector.map(SimpleModel);
        expect(() => mapping.destroy()).not.toThrow(Error);
        expect(() => mapping.destroy()).toThrow(Error);
        expect(() => mapping.asSingleton()).toThrow(Error);
        expect(() => mapping.getInjectedValue()).toThrow(Error);
    });

    it("Destroy of injected instance will make all PreDestroy methods invoked", () => {
        injector.map(ClassWithInjectAndPreDestroy).asSingleton();
        const instance = injector.get(ClassWithInjectAndPreDestroy);

        const callback = jest.fn();
        ClassWithInjectAndPreDestroy.onDestroy = callback;
        injector.destroyInstance(instance);
        expect(callback).toBeCalled();
    });

    it("Destroy of injector will  render injector useless", () => {
        injector.map(ClassWithInjectAndPreDestroy).asSingleton();
        injector.destroy();

        [
            () => injector.createSubInjector(),
            () => injector.map(null),
            () => injector.unMap(null),
            () => injector.hasDirectMapping(null),
            () => injector.hasMapping(null),
            () => injector.getMapping(null),
            () => injector.get(null),
            () => injector.instantiateInstance(null),
            () => injector.injectInto(null),
            () => injector.destroyInstance(null)
        ].forEach(method => expect(method).toThrow(Error));
    });

    it("Double destroy injector will throw an error", () => {
        injector.destroy();
        expect(() => injector.destroy()).toThrow(Error);
        injector = null;
    });

});

describe("Apply injections", () => {
    let injector: Injector;
    beforeEach(() => injector = new Injector());

    it("Can instantiate instance", () => {
        const model = injector.instantiateInstance(SimpleModel);
        expect(model).not.toBeNull();
        expect(model).toBeInstanceOf(SimpleModel);
    });

    it("Unresolvable injectable properties will lead to error", () => {
        expect(() => injector.injectInto(new SuperClassWithInjections())).toThrow(Error);
        injector.map(SimpleModel2);
        expect(() => injector.injectInto(new SuperClassWithInjections())).not.toThrow(Error);
    });

    it("Missing @Optional injections will not throw error", () => {
        expect(() => injector.instantiateInstance(ClassWithOptionalInjection)).not.toThrow(Error);
    });

    it("Property injections work", () => {
        const model = injector.instantiateInstance(ClassWithInjectAndPreDestroy);
        expect(model.injector).toBe(injector);

        const extendedModel = injector.instantiateInstance(ClassWithInjectAndPreDestroySubClass);
        expect(extendedModel.injector).toBe(injector);
    });

    it("Instance must be available in Injector as @PostConstruct is invoked", done => {
        injector.map(ClassWithPostConstruct).asSingleton();

        let instance: ClassWithPostConstruct;

        ClassWithPostConstruct.onPostConstruct = () => {
            expect(injector.get(ClassWithPostConstruct)).toBe(instance);
            done();
        };
        instance = injector.get(ClassWithPostConstruct);
    });

    it("Pre destroy handlers are invoked on instance destroy", () => new Promise<void>(resolve => {
        const model = injector.instantiateInstance(ClassWithInjectAndPreDestroy);
        ClassWithInjectAndPreDestroy.onDestroy = resolve;
        injector.destroyInstance(model);
    }));

    it("asSingleton directive in ModuleConfig shall be respected 1", () => {
        let constructions = 0;
        RequiredClass.constructionCallback = () => constructions++;
        const {injector} = new Context().install(...WebApplicationBundle).configure({
            mappings: [
                {map: RequiredClass, asSingleton: true, instantiate: true}
            ]
        }).initialize();
        injector.get(RequiredClass);
        injector.get(RequiredClass);
        injector.get(RequiredClass);
        expect(constructions).toBe(1);

    });

    it("asSingleton directive in ModuleConfig shall be respected 2", () => {
        let constructions = 0;
        RequiredClass.constructionCallback = () => constructions++;
        const {injector} = new Context().install(...WebApplicationBundle).configure({
            mappings: [
                {map: RequiredClass, asSingleton: true}
            ]
        }).initialize();
        injector.get(RequiredClass);
        injector.get(RequiredClass);
        injector.get(RequiredClass);
        expect(constructions).toBe(1);

    });
    it("asSingleton directive will fallback to default true value when set in ModuleConfig", () => {
        let constructions = 0;
        RequiredClass.constructionCallback = () => constructions++;
        const {injector} = new Context().install(...WebApplicationBundle).configure({
            mappings: [
                RequiredClass
            ]
        }).initialize();
        injector.get(RequiredClass);
        injector.get(RequiredClass);
        injector.get(RequiredClass);
        expect(constructions).toBe(1);
    });
});
