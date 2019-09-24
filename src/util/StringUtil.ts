/**
 * Convert Type reference to simple string representation representing constructor shape
 * @param type Type reference to convert into string representation
 */
export function referenceToString(type: unknown): string {
    if (typeof type === "object" && "toString" in type && typeof type.toString === "function") {
        return type.toString();
    }

    const str = String(type);
    if (str.match(/^function/)) {
        return str.match(/^function (\w+\([^)]*\))/)[1];
    }

    if (str.match(/^class/)) {
        return str.match(/^class (\w+)/)[1];
    }
    return str;
}
