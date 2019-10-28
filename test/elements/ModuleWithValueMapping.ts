import {ModuleConfig} from "../../src";
import {ValueMapping} from "./ValueMapping";

export const ModuleWithValueMapping: ModuleConfig = {
    mappings: [
        {
            map: ValueMapping,
            useValue: {
                z: 1
            }
        }
    ]
};


