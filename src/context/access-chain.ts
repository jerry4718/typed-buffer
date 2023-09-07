import { ObjectPrototype, slice } from '../utils/prototype-util.ts';
import { AccessOption, ScopeAccessor } from "./types.ts";

export function scopeChain(parent: ScopeAccessor | null = null): ScopeAccessor {
    return Object.create(parent) as ScopeAccessor;
}

export function optionChain(...options: (Partial<AccessOption> | undefined)[]): AccessOption;
export function optionChain() {
    const options = slice.call(arguments) as AccessOption[];
    let prev: AccessOption | null = null;
    for (const option of options.reverse()) {
        if (!option) continue;
        if (Object.keys(option).length === 0) continue;
        if (Object.getPrototypeOf(option) === ObjectPrototype) {
            Object.setPrototypeOf(option, prev);
            prev = option;
            continue;
        }
        if (prev === null) {
            prev = option;
            continue;
        }
        throw Error('cant append this option to chain');
    }
    return prev || Object.create(prev);
}
