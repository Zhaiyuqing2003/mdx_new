import { Compiler, Executor, Extern } from "./frontend/compiler";
import { parseText, text } from "./text";

const compiler = Compiler.new("#");
const executor = Executor.new();

executor.register("if", (args) => args.flat(), (args, executor) => {
    console.log(executor.run(args[0]))
    const filterString = executor.run(args[0]) === "true" ? "then" : "else"
    return args.filter((arg) => typeof arg !== "string" && arg.name === filterString) as Extern[];
})

executor.register("then", (args) => args, (args) => args)
executor.register("else", (args) => args, (args) => args)

executor.register("log", (args) => console.log(args.join(" ")), (args) => args)
executor.register("choice", (args) => {
    const index = Math.floor(Math.random() * args.length)
    return args[index]
}, (args) => args)

const ast = compiler.compile(text);
// console.log(ast);
console.log(executor.runAll(ast))


