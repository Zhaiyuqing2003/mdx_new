const root = function (node, context) {
  const { padding, boundingBox } = node;

  boundingBox.width = boundingBox.innerWidth + padding.left + padding.right;
  boundingBox.height = boundingBox.innerHeight + padding.top + padding.bottom;
  boundingBox.padding = padding;

  delete node.padding;

  node.fn.forEach((fn) => fn.call(this, node, context, this));
  return node;
};

const text = function (node, context) {
  const { width, height } = this.textMeasurer(node.text, node);

  node.boundingBox = {
    x: context.x,
    y: context.y,
    innerWidth: width,
    innerHeight: height,
  };

  return node;
};
const box = function (node, context) {
  const func = node.direction === "row"
    ? (child, context) => context.x += child.boundingBox.width
    : (child, context) => context.y += child.boundingBox.height;

  this.use("reduceCompute")(node.children, { x: 0, y: 0 }, func);
  const { width, height } = this.getBoundingBox(node.children);
  node.boundingBox = {
    x: context.x,
    y: context.y,
    innerWidth: width,
    innerHeight: height,
  };

  return node;
};
const rect = function (node, context) {
  node.boundingBox = {
    x: context.x,
    y: context.y,
    innerWidth: node.width,
    innerHeight: node.height,
  };

  return node;
};
const circle = function (node, context) {
  node.boundingBox = {
    x: context.x,
    y: context.y,
    innerWidth: node.radius * 2,
    innerHeight: node.radius * 2,
  };

  return node;
};

export { root, text, box, rect, circle };
