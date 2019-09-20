import "reflect-metadata";
import {AbstractClass} from "./elements/AbstractClass";
import {AbstractClassImpl} from "./elements/AbstractClassImpl";
import {CustomModel2} from "./elements/CustomModel2";
import {CustomModel} from "./elements/CustomModel";
import {SuperClassWithInjections} from "./elements/SuperClassWithInjections";
import {CustomModelWithInject} from "./elements/CustomModelWithInject";
import {CustomExtendedModel} from "./elements/CustomExtendedModel";
import {CustomModelWithPostConstruct} from "./elements/CustomModelWithPostConstruct";
import {Injector} from "../src/injector/Injector";
import {Injectable} from "../src/metadata/decorator/Injectable";
import {metadata} from "../src/metadata/metadata";

describe("Dependency injector configuration", () => {

    let injector: Injector;
    beforeEach(() => injector = new Injector());

    it("injector.get(Injector) should return itself", () => {
        expect(injector.get(Injector)).toBe(injector);
    });

    it("Accessing an unavailable type should cause an error", () => {
        expect(() => injector.get(CustomModel)).toThrow(Error);
    });

    it("Class type can be mapped", () => {
        injector.map(CustomModel);
        const model = injector.get(CustomModel);
        expect(model).not.toBeNull();
    });

    it("Class type mapping will return new instance on each request", () => {
        injector.map(CustomModel);
        const model1 = injector.get(CustomModel);
        expect(model1).not.toBeNull();
        const model2 = injector.get(CustomModel);
        expect(model2).not.toBeNull();
        expect(model2).not.toBe(model1);
    });

    it("Class can be mapped as singleton", () => {
        injector.map(CustomModel).asSingleton();
        const model = injector.get(CustomModel);
        expect(model).not.toBeNull();
        expect(injector.get(CustomModel)).toBe(model);
    });

    it("Abstract class can be mapped to singleton implementation", () => {
        injector.map(AbstractClass).toSingleton(AbstractClassImpl);
        expect(injector.get(AbstractClass)).toBeInstanceOf(AbstractClassImpl);
    });

    it("Class can be mapped to value", () => {
        const model = new CustomModel();
        injector.map(CustomModel).toValue(model);
        expect(injector.get(CustomModel)).toBe(model);
    });

    it("Class can be mapped to existing mapping", () => {
        injector.map(AbstractClassImpl).asSingleton();
        injector.map(AbstractClass).toExisting(AbstractClassImpl);
        expect(injector.get(AbstractClassImpl)).not.toBeNull();
        expect(injector.get(AbstractClass)).toBe(injector.get(AbstractClassImpl));
    });

    it("Class can be mapped to factory", () => {
        injector.map(CustomModel);
        injector.map(AbstractClass).toFactory(() => new AbstractClassImpl());
        expect(injector.get(AbstractClass)).toBeInstanceOf(AbstractClassImpl);
    });

    it("Can create sub injector", () => {
        const subInjector = injector.createSubInjector();
        subInjector.map(CustomModel2).asSingleton();
        expect(subInjector.parent).toBe(injector);
        expect(subInjector.get(Injector)).toBe(subInjector);
    });

    it("Missing sub injector mappings are served from parent injector", () => {
        injector.map(CustomModel).asSingleton();
        const subInjector = injector.createSubInjector();
        expect(subInjector.get(CustomModel)).toBe(injector.get(CustomModel));
    });

    it("Sub injector can de-define mappings from parent injector", () => {
        injector.map(CustomModel).asSingleton();

        const subInjector = injector.createSubInjector();
        expect(subInjector.get(CustomModel).value).toBe(CustomModel.defaultValue);

        const newValue = 0xFFFFFF;
        subInjector.map(CustomModel).toValue(new CustomModel(newValue));
        expect(subInjector.get(CustomModel).value).toBe(newValue);

        subInjector.unMap(CustomModel);
        expect(subInjector.get(CustomModel).value).toBe(CustomModel.defaultValue);
    });

    it("Injector reports mapping state correctly", () => {
        injector.map(CustomModel).asSingleton();
        expect(injector.hasMapping(CustomModel)).toBe(true);
        expect(injector.hasDirectMapping(CustomModel)).toBe(true);

        const subInjector = injector.createSubInjector();
        expect(subInjector.hasMapping(CustomModel)).toBe(true);
        expect(subInjector.hasDirectMapping(CustomModel)).toBe(false);
    });

    it("Injector mapping can be unmapped", () => {
        injector.map(CustomModel).asSingleton();

        expect(injector.hasMapping(CustomModel)).toBe(true);
        injector.unMap(CustomModel);
        expect(injector.hasMapping(CustomModel)).toBe(false);
        expect(() => injector.get(CustomModel)).toThrow(Error);
    });

    it("Sealed mappings cannot be changed", () => {
        const mapping = injector.map(CustomModel);
        mapping.seal();
        expect(() => mapping.asSingleton()).toThrow(Error);
    });

    it("Mapping can be unsealed", () => {
        const mapping = injector.map(CustomModel);

        expect(() => mapping.unseal(null)).toThrow(Error);
        const sealKey = mapping.seal();

        expect(() => mapping.unseal("wrong key")).toThrow(Error);
        expect(() => mapping.unseal(sealKey)).not.toThrow(Error);
    });

    it("Unsealed injector mapping can be altered", () => {
        const mapping = injector.map(CustomModel2).asSingleton();
        expect(() => mapping.toValue(new CustomModel())).not.toThrow(Error);
    });

    it("Mapping can be destroyed", () => {
        const mapping = injector.map(CustomModel);
        expect(() => mapping.destroy()).not.toThrow(Error);
        expect(() => mapping.destroy()).toThrow(Error);
        expect(() => mapping.asSingleton()).toThrow(Error);
        expect(() => mapping.getInjectedValue()).toThrow(Error);
    });

    it("Destroy of injected instance will make all PreDestroy methods invoked", () => {

        injector.map(CustomModelWithInject).asSingleton();
        const instance = injector.get(CustomModelWithInject);

        const callback = jest.fn();
        CustomModelWithInject.onDestroy = callback;
        injector.destroyInstance(instance);
        expect(callback).toBeCalled();
    });

    it("Destroy of injector will  render injector useless", () => {
        injector.map(CustomModelWithInject).asSingleton();
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
        const model = injector.instantiateInstance(CustomModel);
        expect(model).not.toBeNull();
        expect(model).toBeInstanceOf(CustomModel);
    });

    it("Unresolvable injectable properties will lead to error", () => {
        expect(() => injector.injectInto(new SuperClassWithInjections())).toThrow(Error);
        injector.map(CustomModel2);
        expect(() => injector.injectInto(new SuperClassWithInjections())).not.toThrow(Error);
    });

    it("Property injections work", () => {
        const model = injector.instantiateInstance(CustomModelWithInject);
        expect(model.injector).toBe(injector);

        const extendedModel = injector.instantiateInstance(CustomExtendedModel);
        expect(extendedModel.injector).toBe(injector);
    });

    it("Instance must be available in Injector as @PostConstruct is invoked", done => {
        injector.map(CustomModelWithPostConstruct).asSingleton();

        let instance: CustomModelWithPostConstruct;

        CustomModelWithPostConstruct.onPostConstruct = () => {
            expect(injector.get(CustomModelWithPostConstruct)).toBe(instance);
            done();
        };
        instance = injector.get(CustomModelWithPostConstruct);
    });

    it("Pre destroy handlers are invoked on instance destroy", () => new Promise<void>(resolve => {
        const model = injector.instantiateInstance(CustomModelWithInject);
        CustomModelWithInject.onDestroy = resolve;
        injector.destroyInstance(model);
    }));

});
