import { root } from "./default";
import { Pipeline } from "../pipeline";
import { Padding, Color, Font } from "./helper";
import { text, box, rect, circle } from "./default";

export const Creator = () => Pipeline.new()
    .root(root).auxillary({
        Padding, Color, Font
    }).register({
        text, box, rect, circle
    })
