import { ComputeFunction, Computer } from "./computer";

// @incomplete
type TextInfoNode = {
    fontFamily : string;
    fontSize : string;
    fontStyle : string;
    fontWeight : string;
}
export const canvasTextMeasurer = (ctx : CanvasRenderingContext2D) => (
    text : string,
    { fontStyle, fontWeight, fontSize, fontFamily } : TextInfoNode
) => {
    ctx.save()

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
    const metrics = ctx.measureText(text);

    ctx.restore();

    return {
        width : metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
        height : metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    }
}
export const getBoundingBox = (nodes : any[]) => {
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;

    for (const { boundingBox } of nodes) {
        left = Math.min(left, boundingBox.x);
        top = Math.min(top, boundingBox.y);
        right = Math.max(right, boundingBox.x + boundingBox.width);
        bottom = Math.max(bottom, boundingBox.y + boundingBox.height);
    }

    return {
        width : right - left,
        height : bottom - top,
    }
}
export const reduceCompute = function (
    nodes : any[], initialContext : any, changeContext : (node : any, context : any) => void
) {
    for (const node of nodes) {
        // this = Computer
        this.compute(node, initialContext);
        changeContext(node, initialContext);
    }
}
