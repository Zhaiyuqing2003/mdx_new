import { Raise } from "../error/Raise"

type TokenMap = {
  [TokenType.Extern]: {
    type: TokenType.Extern,
    name: string
  },
  [TokenType.Text]: {
    type: TokenType.Text,
    text: string
  },
  [TokenType.Line]: {
    type: TokenType.Line
  },
  [TokenType.Indent]: {
    type: TokenType.Indent,
    length: number
  }
}

export type Token = TokenMap[keyof TokenMap]
export type ExternToken = TokenMap[TokenType.Extern]
export type TextToken = TokenMap[TokenType.Text]
export type LineToken = TokenMap[TokenType.Line]
export type IndentToken = TokenMap[TokenType.Indent]


export type Extern = {
  name: string,
  argument: (string | Extern)[]
}

type Arguments = string | Extern

type ExternInfo = {
  extern: Extern,
  indent: number,
  parameterIndent: number
}

export type ExternMap = {
  [name : string] : {
    function : (args : Arguments[], executor : Executor) => any,
    transformer : (args : Arguments[], executor : Executor) => Arguments[]
  }
}
type ExternFunction = ExternMap[keyof ExternMap]["function"]
type ExternTransformer = ExternMap[keyof ExternMap]["transformer"]

export enum TokenType {
  Extern = "extern",
  Text = "text",
  Line = "line",
  Indent = "indent"
}

export enum ParseState {
  Text, // prev is text
  Extern,  // prev is extern
  Initial, // prev is a initial line
  BlockInitial, // prev is a block initial line
  Indent, // prev is a indent after a initial line
  BlockIndent, // prev is a indent after a block initial line
}
export enum LogLevel {
  Error = "error",
  Warning = "warning",
  Note = "note",
}

export const Compiler = class {
  private readonly externFnChar: string;
  private readonly tokenRegex: RegExp;

  // private error(type: ErrorType) : never {
  //   throw new Error(type);
  // }
  // private warn(type: WarningType) {
  //   if (this.logLevel === LogLevel.Warning || this.logLevel === LogLevel.Note) console.warn(type);
  // }
  // private note(type: NoteType) {
  //   if (this.logLevel === LogLevel.Note) console.info(type);
  // }

  private constructor(externFnChar: string, tokenRegex: RegExp, logLevel : LogLevel) {
    this.externFnChar = externFnChar;
    this.tokenRegex = tokenRegex;
  }

  static new(char: string = "$", logLevel : LogLevel = LogLevel.Error) {
    return new Compiler(
      char,
      new RegExp(
      `(?<extern>\\${char}\\${char}\\S+)|` +
      `(?<line>\\n|\\r\\n)|` +
      `(?<indent>^[^\\S\\n\\r]+)|` +
      `(?<text>.+?(?=(?:\\${char}\\${char}\\w+|$)))`,
      "gm"),
      logLevel
    );
  }

  tokenize(str: string): Token[] {
    return [...str.matchAll(this.tokenRegex)].map(({ groups }) => {
      const { extern, line, indent, text } = groups!;
      if (extern !== undefined) {
        return { type: TokenType.Extern, name : extern };
      } else if (line !== undefined) {
        return { type: TokenType.Line };
      } else if (indent !== undefined) {
        return { type: TokenType.Indent, length: indent?.length };
      } else if (text !== undefined) {
        return { type: TokenType.Text, text };
      }
      // should not use return here, but just to shut the ts compiler up
      return Raise.Error.invalidToken();
    })
  }

  parse(tokens: Token[]) {
    let externInfoStack: ExternInfo[] = [];
    const ast: Extern[] = [];

    let lineState = ParseState.Initial;

    const peek = () => externInfoStack[externInfoStack.length - 1] ?? Raise.Error.parentExternNotFound();

    const peekParentIndent = () => peek().indent;
    const peekParentParameterIndent = () => peek().parameterIndent;

    const setParentParameterIndent = (indent: number) =>
      peek().parameterIndent = indent;

    const addToParentLastArgument = (arg: string) => {
      const parentArguments = peek().extern.argument;
      parentArguments[parentArguments.length - 1] += arg;
    }

    const addParentArgument = (arg: string | Extern) =>
      peek().extern.argument.push(arg);

    const automaton = {
      [TokenType.Extern] : {
        [ParseState.Text] : (token : TokenMap[TokenType.Extern]) => {
          addToParentLastArgument(token.name);
          return [true, ParseState.Text] as const;
        },
        [ParseState.Extern] : (token : ExternToken) => {
          const child = {
            name: token.name.slice(2),
            argument: [],
          }

          addParentArgument(child);
          // the new indent has the same value of the parent indent
          externInfoStack.push({
            extern : child,
            indent : peekParentIndent(),
            parameterIndent : Infinity,
          })
          return [true, ParseState.Extern] as const;
        },
        // [line_start, extern] <-- have 0 indent
        [ParseState.Initial] : () => [false, ParseState.BlockInitial] as const,
        [ParseState.BlockInitial] : (token : ExternToken) => {
          const extern = {
            name: token.name.slice(2),
            argument: [],
          }
          ast.push(extern);

          externInfoStack = [{
            extern,
            indent : 0,
            parameterIndent : Infinity,
          }]
          return [true, ParseState.Extern] as const;
        },
        [ParseState.Indent] : () => [false, ParseState.BlockIndent] as const,
        [ParseState.BlockIndent] : (token : ExternToken) => {
          const child = {
            name: token.name.slice(2),
            argument: [],
          }

          addParentArgument(child);

          // the new indent is the parameter indent of the parent extern
          externInfoStack.push({
            extern : child,
            indent : peekParentParameterIndent(),
            parameterIndent : Infinity,
          })
          return [true, ParseState.Extern] as const;
        }
      },
      [TokenType.Text] : {
        // (text, extern literal, text) pattern
        [ParseState.Text] : (token : TextToken) => {
          addToParentLastArgument(token.text);
          return [true, ParseState.Text] as const;
        },
        // (extern, text) <- text as parameter
        [ParseState.Extern] : (token : TextToken) => {
          if (token.text.trim() !== "") addParentArgument(token.text.trim());
          return [true, ParseState.Extern] as const;
        },
        // text can never start with zero indent
        [ParseState.Initial] : () => Raise.Error.textStartWithZeroIndent(),
        [ParseState.BlockInitial] : () => Raise.Error.textStartWithZeroIndent(),
        // (indent, text) <- text as parameter
        [ParseState.Indent] : () => [false, ParseState.BlockIndent] as const,
        [ParseState.BlockIndent] : (token : TextToken) => {
          addParentArgument(token.text);
          return [true, ParseState.Text] as const;
        }
      },
      [TokenType.Indent] : {
        [ParseState.Text] : () => Raise.Error.indentAfterText(),
        [ParseState.Extern] : () => Raise.Error.indentAfterExtern(),
        [ParseState.Indent] : () => Raise.Error.doubleIndent(),
        [ParseState.BlockIndent] : () => Raise.Error.doubleIndent(),
        [ParseState.Initial] : (token : IndentToken) => {
          // (line_start, indent) <-- parameter indication for the extern that have same indent
          while (peekParentParameterIndent() > token.length) {
            externInfoStack.pop();
          }

          if (peekParentParameterIndent() < token.length)
            Raise.Error.noExternMatchIndent()

          return [true, ParseState.Indent] as const;
        },
        [ParseState.BlockInitial] : (token : IndentToken) => {
          // extern
          // indent <-- is that for the above extern
          if (peekParentIndent() < token.length) {
            // initialize the parameter indent for the extern
            setParentParameterIndent(token.length);
            return [true, ParseState.BlockIndent] as const;
          }
          // for the previous extern
          return [false, ParseState.Initial] as const;
        }
      },
      [TokenType.Line] : {
        // reset line state
        [ParseState.Text] : () => [true, ParseState.Initial] as const,
        [ParseState.Extern] : () => [true, ParseState.BlockInitial] as const,
        // some warning
        [ParseState.Indent] : () => {
          Raise.Warning.lineWithOnlyIndent();
          return [true, ParseState.Initial] as const;
        },
        [ParseState.BlockIndent] : () => {
          Raise.Warning.blockStartingLineWithOnlyIndent();
          return [true, ParseState.BlockInitial] as const;
        },
        [ParseState.Initial] : () => {
          Raise.Note.emptyLine();
          return [true, ParseState.Initial] as const;
        },
        [ParseState.BlockInitial] : () => {
          Raise.Note.emptyLine();
          return [true, ParseState.BlockInitial] as const;
        }
      }
    } as const;

    // console.log(tokens)
    let index = 0;
    while (index < tokens.length) {
      // console.log(index);
      const token = tokens[index]!;
      const [proceed, nextState] : readonly [boolean, ParseState] = automaton[token.type][lineState](token as any);
      lineState = nextState;
      proceed ? index++ : Raise.Note.redirect(nextState);
    }

    return ast;
  }

  compile(str : string) {
    const tokens = this.tokenize(str);
    const ast = this.parse(tokens);
    return ast;
  }
}

export class Executor{
  private externMap : ExternMap;
  private env : object;

  private constructor(externMap : ExternMap, env : object) {
    this.externMap = externMap;
    this.env = env;
  }

  static new() {
    return new Executor({}, {});
  }

  register(name : string, func : ExternFunction, transformer : ExternTransformer) {
    this.externMap[name] = {
      function : func,
      transformer : transformer
    }
  }

  remove(name : string) {
    delete this.externMap[name];
  }

  run(arg : Arguments) {
    if (typeof arg === "string") return arg;
    const extern = this.externMap[arg.name];
    if (extern === undefined) Raise.Error.externNotFound(arg.name);
    return extern.function(this.runAll(extern.transformer(arg.argument, this)), this)
  }

  runAll(args : Arguments[]) {
    return args.map(arg => this.run(arg));
  }
}
