import { Raise } from "../../error/Raise";

export type ComputeFunction = (node : any, context : any, computer : Computer) => any;
export type AuxiliaryFunction = (...args : any[]) => any
export type Node = {
    type : string;
    [key : string] : any;
}

export class Computer {
    private computeFn : Record<string, ComputeFunction> & ThisType<Computer> = {};
    private rootComputeFn : ComputeFunction;
    private auxiliary : Record<string, AuxiliaryFunction> = {}

    private constructor(root : ComputeFunction) {
        this.rootComputeFn = root.bind(this);
    }

    static new(root : ComputeFunction) : Computer {
        return new Computer(root);
    }

    register(name : string, fn : ComputeFunction) : this {
        this.computeFn[name] = fn.bind(this);
        return this;
    }

    assist(name : string, fn : AuxiliaryFunction) : this {
        this.auxiliary[name] = fn.bind(this)
        return this;
    }

    use(name : string) : AuxiliaryFunction {
        return this.auxiliary[name] ?? Raise.Error.auxiliaryNotFound(name);
    }

    compute(node : any, context : any) : any {
        return this.computeFn[node.type]
            ? this.rootComputeFn(this.computeFn[node.type].call(this, node, context, this), context, this)
            : Raise.Error.nodeTypeNotFound(node.type);
    }
}
