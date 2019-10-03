import {InjectionConfig} from "./InjectionConfig";
import {CommandMappingDescriptor} from "./CommandMappingDescriptor";
import {ClassType, Type} from "../../type";

/**
 * System module configuration.
 */
export interface ModuleDescriptor {
    /**
     * List of modules particular module is dependant on which have to be loaded for this module to function properly.
     */
    requires?: Type[];
    /**
     * List of types that should be added as singletons to Injector as this modules is mapped or list of explicit
     * injector instructions for very same purpose.
     */
    mappings?: (ClassType | InjectionConfig)[];
    /**
     * List of event names that should be mapped to commands as module is added to system scope.
     */
    commands?: CommandMappingDescriptor[];
}

export const isModuleDescriptor = (value: unknown): value is ModuleDescriptor => {
    if (typeof value !== "object") {
        return false;
    }
    const keys = Object.keys(value);
    if (keys.length > 3) {
        return false;
    }
    if (keys.some(key => ['requires', 'mappings', 'commands'].indexOf(key) === -1)) {
        return false;
    }
    return true;
};
