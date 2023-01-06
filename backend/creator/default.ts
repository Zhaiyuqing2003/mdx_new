const root = (node, _, Creator) => ({
    padding : Creator.Padding.zero,
    backgroundColor : Creator.Color.black,
    fn : [],
    data : {},
    ...node
})

const text = (node, _, Creator) => ({
    color : Creator.Color.black,
    fontFamily : Creator.Font.Main,
    fontSize : 12,
    fontWeight : 400,
    fontStyle : "normal",
    text : "",
    ...node,
})

const box = (node) => ({
    direction : "row",
    children : [],
    ...node,
})

const rect = (node) => ({
    width : 0,
    height : 0,
    ...node,
})

const circle = (node) => ({
    radius : 0,
    ...node,
})

export { root, text, box, rect, circle }