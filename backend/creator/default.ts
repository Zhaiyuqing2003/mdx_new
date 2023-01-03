import { Creator } from "./creator";
import { Color, Padding } from "./helper";

export class DefaultCreator {
    private constructor() {}
    public static new() : Creator {
        // dirty consume
        return Creator.new((param) => ({
            padding : Padding.zero,
            backgroundColor : Color.black,
            fn : [],
            data : {},
            ...param
        })).register("box", (param) => ({
            direction : "row",
            children : [],
            ...param,
            type : "box",
        }))
    }
}