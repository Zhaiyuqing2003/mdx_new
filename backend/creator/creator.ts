import { Raise } from "../../error/Raise";

type CreateFunction = (param : any, creator : Creator) => any;

export class Creator {
    private createFn : Record<string, CreateFunction> = {};
    private rootCreateFn : CreateFunction;
    private constructor(root : CreateFunction) {
        this.rootCreateFn = root;
    }
    public static new(root : CreateFunction) : Creator {
        return new Creator(root);
    }

    public register(name : string, fn : CreateFunction) : Creator {
        this.createFn[name] = fn;
        return this;
    }

    public create(type : string, parameter : any) : any {
        return this.createFn[type]
            ? this.rootCreateFn(this.createFn[type](parameter, this), this)
            : Raise.Error.nodeTypeNotFound(type);
    }
}