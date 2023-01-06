import { Fn, Pipeline } from "../pipeline";
import { root, text, box, rect, circle } from "./default";
import { canvasTextMeasurer as textMeasurer, getBoundingBox, reduceCompute } from "./helper";

export const Computer = () => Pipeline.new()
  .root(root).auxillary({
    textMeasurer,
    getBoundingBox,
    reduceCompute,
  }).register({
    text, box, rect, circle
  })