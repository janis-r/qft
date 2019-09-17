import {InjectionDescriptor} from "./InjectionDescriptor";
import {CommandMappingDescriptor} from "./CommandMappingDescriptor";
import {Type} from "../../type";
/**
 * System module metadataInternal description format.
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
    mappings?: (InjectionDescriptor['map'] | InjectionDescriptor)[];
    /**
     * List of event names that should be mapped to commands as module is added to system scope.
     */
    commandMap?: CommandMappingDescriptor[];
}
