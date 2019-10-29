import {ModuleConfig} from "../../src";
import {ValueMapping} from "./ValueMapping";

export const ModuleWithValueMapping: ModuleConfig = {
    mappings: [
        {
            map: ValueMapping,
            useValue: { // TODO: Make this produce TS error without explicitly defining it as InjectionConfig<ValueMapping>
                z: 1
            }
        }
    ]
};


