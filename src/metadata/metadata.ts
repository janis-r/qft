import {Type} from "../type";
import {TypeMetadataInternal} from "./data/TypeMetadataInternal";
import {TypeMetadata} from "./data/TypeMetadata";
import {MetadataCollection} from "./model/MetadataCollection";

const metadataCollection = new MetadataCollection();

/**
 * Internal metadata provider that should be used only within metadata package
 */
export const metadataInternal = {
    /**
     * Retrieve some type metadata.
     * This should not be used from outside of metadata package!
     * @param type
     * @returns {TypeMetadataInternal}
     */
    getTypeDescriptor: (type: Type): TypeMetadataInternal =>  metadataCollection.getOrCreateTypeMetadata(type)
};

/**
 * Public data provider for registered type metadata
 */
export const metadata = {
    /**
     * Check if particular type has registered metadata
     * @param type
     * @returns {boolean}
     */
    hasMetadata: (type: Type): boolean => metadataCollection.typeMetadataIsRegistered(type),

    /**
     * Retrieve some type metadataInternal
     * @param type
     * @returns {TypeMetadataInternal}
     */
    getTypeDescriptor: (type: Type): TypeMetadata =>  metadataCollection.getTypeMetadataExportFormat(type),

    /**
     * Get inherited metadata for some instance (including its own prototype)
     * @param instance Any class instance that might be inheriting from any of metadata clients
     * @returns {TypeMetadata[]} A collection of all metadata entries that can be matched with instance
     */
    getInheritedMetadata: (instance: any): TypeMetadata[] => metadataCollection.getInheritedMetadata(instance),
};
