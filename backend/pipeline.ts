export type Fn = (node : any, context : any, pipeline : Pipeline) => any;
export type AuxFn = (...args : any[]) => any;

export class Pipeline {
    private fn : Record<string, Fn> = {};
    private rootFn : Fn;
    private aux : Record<string, AuxFn> = {}
    private fnNotFoundError : Function = (name : string) => { throw new Error(`Function ${name} not found`) };
    private auxNotFoundError : Function = (name : string) => { throw new Error(`Auxiliary ${name} not found`) };

    private constructor() {}

    static new() : Pipeline {
        return new Pipeline();
    }

    root(fn : Fn) : this {
        this.rootFn = fn;
        return this;
    }

    onFnNotFound(fn : Function) : this {
        this.fnNotFoundError = fn;
        return this;
    }

    onAuxNotFound(fn : Function) : this {
        this.auxNotFoundError = fn;
        return this;
    }

    auxillary(name : string, fn : AuxFn) : this
    auxillary(record : Record<string, AuxFn>) : this
    auxillary(nameOrRecord : string | Record<string, AuxFn>, fn ?: AuxFn) : this {
        const record = typeof nameOrRecord === "string" ? { [nameOrRecord] : fn } : nameOrRecord;
        for (const [name, fn] of Object.entries(record)) {
            this.aux[name] = fn!.bind(this);
            this[name] = fn!.bind(this)
        }

        return this;
    }

    register(name : string, fn : Fn) : this
    register(record : Record<string, Fn>) : this
    register(nameOrRecord : string | Record<string, Fn>, fn ?: Fn) : this {
        const record = typeof nameOrRecord === "string" ? { [nameOrRecord] : fn } : nameOrRecord;
        for (const [name, fn] of Object.entries(record)) {
            this.fn[name] = fn!.bind(this);
        }

        return this;
    }

    use(name : string) : AuxFn {
        return this.aux[name] ?? this.auxNotFoundError(name);
    }

    run(node : any, context : any) : any {
        // this = Pipeline
        return this.fn[node.type] !== undefined
            ? this.rootFn(this.fn[node.type](node, context, this), context, this)
            : this.fnNotFoundError(node.type);
    }
}
