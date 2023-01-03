import { Raise } from "../../error/Raise";

const assign = <T extends object, S extends object>(source : T, target : S) : T & S => {
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            target[key as string] = source[key];
        }
    }
    return target as T & S;
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

export const Padding : PaddingCreator = assign({
    get zero() {
        return { left: 0, top: 0, right: 0, bottom: 0 }
    }
}, (
    first : number,
    second? : number,
    third? : number,
    fourth? : number
) => {
    if (first === undefined) {
        Raise.Error.paddingParameterInvalid();
    }
    if (second === undefined) {
        return {
            left: first,
            top: first,
            right: first,
            bottom: first,
        };
    }
    if (third === undefined) {
        return {
            left: first,
            top: second,
            right: first,
            bottom: second,
        };
    }
    if (fourth === undefined) {
        return {
            left: first,
            top: second,
            right: third,
            bottom: second,
        };
    }
    return {
        left: first,
        top: second,
        right: third,
        bottom: fourth,
    };
})

export const Color = assign({
    get black() {
        return { r : 0, g : 0, b : 0, a : 1 }
    },
    get transparent() {
        return { r : 0, g : 0, b : 0, a : 0 }
    }
}, (r : number, g : number, b : number, a = 1.0) => ({
    r, g, b, a
}))