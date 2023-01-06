import { Raise } from "../../error/Raise";

const assign = <T extends object, S extends object>(source : T, target : S) : T & S => {
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            target[key as string] = source[key];
        }
    }
    return target as T & S;
}

const getter = <T extends Record<string, () => any>>(source : T) : { [P in keyof T] : ReturnType<T[P]> } => {
    const result : any = {};
    for (const key in source) {
        Object.defineProperty(result, key, {
            get : source[key]
        });
    }
    return result;
}

export type PaddingObject = {
    left : number;
    top : number;
    right : number;
    bottom : number;
}

export type PaddingCreator = {
    (side : number) : PaddingObject;
    (horizontal : number, vertical : number) : PaddingObject;
    (left : number, vertical : number, right : number) : PaddingObject;
    (left : number, top : number, right : number, bottom : number) : PaddingObject;
    zero : PaddingObject;
}

export const Padding : PaddingCreator = assign(getter({
    zero: () => ({ left: 0, top: 0, right: 0, bottom: 0 })
}), (left : number, top ?: number, right ?: number, bottom ?: number) => {
    left ??= Raise.Error.paddingParameterInvalid();
    top ??= right = bottom = left;
    right ??= left;
    bottom ??= top;
    return { left, top, right, bottom };
})

export const Color = assign(getter({
    black : () => ({ r : 0, g : 0, b : 0, a : 1 }),
    transparent : () => ({ r : 0, g : 0, b : 0, a : 0 }),
}), (r : number, g : number, b : number, a = 1.0) => ({
    r, g, b, a
}))

export const Font = assign({
    Math : "KaTex_Math",
    Main : "KaTex_Main",
}, () => {})