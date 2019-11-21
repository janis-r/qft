import {Type} from "../../type";
import {Command} from "./Command";
import {EventGuard} from "../..";

/**
 * Definition of sub command executed as a part of MacroCommand
 */
export type SubCommand<T = any> = {
    type: Type<Command<T>>,
    guards?: EventGuard[]
};

export const isSubCommand = (entry: unknown): entry is SubCommand => {
    const keys = Object.keys(entry);
    return keys.length > 0 && keys.length <= 2 && keys.includes("type");
};
