import { ParseState } from "../frontend/compiler";

export const Raise = class {
  static readonly Error = {
    invalidToken: () => { throw new Error("[Tokenizer Error] Invalid token"); },
    doubleIndent: () => { throw new Error("[Tokenizer Error] Double indent in a line"); },
    indentAfterText: () => { throw new Error("[Tokenizer Error] Indent after text"); },
    indentAfterExtern: () => { throw new Error("[Tokenizer Error] Indent after extern"); },

    parentExternNotFound: () => { throw new Error("[Parser Error] Parent extern function not found"); },

    textStartWithZeroIndent: () => { throw new Error("[Syntax Error] Text start with zero indent"); },
    noExternMatchIndent: () => { throw new Error("[Syntax Error] No extern match indent"); },

    externNotFound: (name: string) => { throw new Error(`[Executor Error] Extern macro "${name}" not found`); },

    nodeTypeNotFound: (type: string) => { throw new Error(`[Creator Error] Node type "${type}" not found`); },

    paddingParameterInvalid: () => { throw new Error("[CreatorHelper(Padding) Error] Padding parameter invalid"); },
    auxiliaryNotFound: (name: string) => { throw new Error(`[DefaultComputer(Auxiliary) Error] Auxiliary function "${name}" not found`); },
  };
  static readonly Warning = {
    whiteSpaceText: () => { console.warn("[Syntax Warning] Text contains only whitespace"); },
    lineWithOnlyIndent: () => { console.warn("[Syntax Warning] Line contains only indent"); },
    blockStartingLineWithOnlyIndent: () => { console.warn("[Syntax Warning] Block starting line contains only indent"); },
  };
  static readonly Note = {
    emptyLine: () => { console.info("[Syntax Note] Empty line"); },
    redirect: (state: ParseState) => { console.info(`[Parser Note] Redirect to ParseState.${ParseState[state]} state`); }
  };
};
