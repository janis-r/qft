import {Event} from "../../eventDispatcher/event/Event";
import {InjectionMapping} from "../data/InjectionMapping";
import {ClassType} from "../../type";
import {InjectionToken} from "../data/InjectionToken";

export class MappingEvent extends Event {

    /**
     * This event is dispatched if an existing mapping is overridden without first unMapping it.
     *
     * The reason for dispatching an event (and tracing a warning) is that in most cases,
     * overriding existing mappings is a sign of bugs in the application. Deliberate mapping
     * changes should be done by first removing the existing mapping.
     * @type {string}
     */
    static readonly MAPPING_OVERRIDE = Symbol('mappingOverride');

    /**
     * This event is dispatched when a new mapping is created.
     * @type {string}
     */
    static readonly MAPPING_CREATED = Symbol('mappingCreated');

    /**
     * This event is dispatched when a mapping is destroyed.
     * @type {string}
     */
    static readonly MAPPING_DESTROYED = Symbol('mappingDestroyed');

    constructor(type: Symbol, readonly mappedType: ClassType | InjectionToken, readonly mapping: InjectionMapping<any>) {
        super(type);
    }

}
