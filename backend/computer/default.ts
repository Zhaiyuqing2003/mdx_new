import { Computer, ComputeFunction } from "./computer";
import { canvasTextMeasurer, getBoundingBox, reduceCompute } from "./helper";


export class DefaultComputer {
    private constructor() {}
    public static new() : Computer {
        return Computer
            .new(function (node, context) {
                const { padding, boundingBox } = node;

                boundingBox.width = boundingBox.innerWidth + padding.left + padding.right;
                boundingBox.height = boundingBox.innerHeight + padding.top + padding.bottom;
                boundingBox.padding = padding;

                delete node.padding;

                node.fn.forEach((fn : ComputeFunction) => fn.call(this, node, context, this));
                return node;
            })
            .assist("textMeasurer", canvasTextMeasurer)
            .assist("getBoundingBox", getBoundingBox)
            .assist("reduceCompute", reduceCompute)
            .register("text", function (node, context) {
                const { width, height } = this.use("textMeasurer")(node.text, node);

                node.boundingBox = {
                    x : context.x,
                    y : context.y,
                    innerWidth : width,
                    innerHeight : height,
                }

                return node;
            })
            .register("box", function (node, context) {
                this.use("reduceCompute")(
                    node.children,
                    { x : 0, y : 0 },
                    (node, context) => {
                        context.x += 
                    }
                )
            })
    }
}