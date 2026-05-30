const RESERVED_WORDS = new Set([
  "int",
  "float",
  "double",
  "char",
  "string",
  "bool",
  "boolean",
  "if",
  "else",
  "while",
  "for",
  "do",
  "switch",
  "case",
  "default",
  "break",
  "continue",
  "return",
  "void",
  "main",
  "print",
  "read",
  "true",
  "false",
  "const",
]);

const MULTI_CHAR_TOKENS = new Map([
  ["==", "OPERADOR_RELACIONAL"],
  ["!=", "OPERADOR_RELACIONAL"],
  ["<=", "OPERADOR_RELACIONAL"],
  [">=", "OPERADOR_RELACIONAL"],
  ["&&", "OPERADOR_LOGICO"],
  ["||", "OPERADOR_LOGICO"],
  ["++", "OPERADOR_INCREMENTO"],
  ["--", "OPERADOR_INCREMENTO"],
  ["+=", "ASIGNACION_COMPUESTA"],
  ["-=", "ASIGNACION_COMPUESTA"],
  ["*=", "ASIGNACION_COMPUESTA"],
  ["/=", "ASIGNACION_COMPUESTA"],
  ["%=", "ASIGNACION_COMPUESTA"],
]);

const SINGLE_CHAR_TOKENS = new Map([
  ["=", "ASIGNACION"],
  ["+", "OPERADOR_ARITMETICO"],
  ["-", "OPERADOR_ARITMETICO"],
  ["*", "OPERADOR_ARITMETICO"],
  ["/", "OPERADOR_ARITMETICO"],
  ["%", "OPERADOR_ARITMETICO"],
  ["<", "OPERADOR_RELACIONAL"],
  [">", "OPERADOR_RELACIONAL"],
  ["!", "OPERADOR_LOGICO"],
]);

const DELIMITERS = new Set([";", ",", ".", "(", ")", "{", "}", "[", "]", ":"]);

const isLetter = (char) => /[A-Za-z]/.test(char);
const isDigit = (char) => /[0-9]/.test(char);
const isIdentifierStart = (char) => isLetter(char) || char === "_";
const isIdentifierPart = (char) => isIdentifierStart(char) || isDigit(char);

export function analyzeCode(sourceCode) {
  const source = String(sourceCode ?? "");
  const tokens = [];
  const errors = [];
  let index = 0;
  let line = 1;
  let column = 1;

  const current = () => source[index] ?? "";
  const peek = (offset = 1) => source[index + offset] ?? "";
  const atEnd = () => index >= source.length;

  const advance = () => {
    const char = source[index] ?? "";
    index += 1;

    if (char === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }

    return char;
  };

  const addToken = (lexeme, type, startLine, startColumn) => {
    tokens.push({
      id: tokens.length + 1,
      lexeme,
      type,
      line: startLine,
      column: startColumn,
    });
  };

  const addError = (lexeme, message, startLine, startColumn) => {
    errors.push({
      id: errors.length + 1,
      lexeme,
      message,
      line: startLine,
      column: startColumn,
    });
  };

  const readWhile = (predicate) => {
    let lexeme = "";
    while (!atEnd() && predicate(current())) {
      lexeme += advance();
    }
    return lexeme;
  };

  const readNumber = () => {
    const startLine = line;
    const startColumn = column;
    let lexeme = readWhile(isDigit);
    let type = "NUMERO_ENTERO";

    if (current() === "." && isDigit(peek())) {
      type = "NUMERO_DECIMAL";
      lexeme += advance();
      lexeme += readWhile(isDigit);
    }

    if (isIdentifierStart(current())) {
      lexeme += readWhile(isIdentifierPart);
      addError(lexeme, "Numero mal formado", startLine, startColumn);
      return;
    }

    addToken(lexeme, type, startLine, startColumn);
  };

  const readIdentifier = () => {
    const startLine = line;
    const startColumn = column;
    const lexeme = readWhile(isIdentifierPart);
    const type = RESERVED_WORDS.has(lexeme)
      ? "PALABRA_RESERVADA"
      : "IDENTIFICADOR";

    addToken(lexeme, type, startLine, startColumn);
  };

  const readStringLike = (quote) => {
    const startLine = line;
    const startColumn = column;
    let lexeme = advance();
    let escaped = false;
    let characterLength = 0;

    while (!atEnd()) {
      const char = advance();
      lexeme += char;

      if (char === "\n") {
        addError(lexeme.trimEnd(), "Literal sin cerrar", startLine, startColumn);
        return;
      }

      if (escaped) {
        escaped = false;
        if (quote === "'") {
          characterLength += 1;
        }
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === quote) {
        if (quote === "'" && characterLength !== 1) {
          addError(lexeme, "Caracter mal formado", startLine, startColumn);
          return;
        }

        addToken(lexeme, quote === '"' ? "CADENA" : "CARACTER", startLine, startColumn);
        return;
      }

      if (quote === "'") {
        characterLength += 1;
      }
    }

    addError(lexeme, "Literal sin cerrar", startLine, startColumn);
  };

  const readLineComment = () => {
    const startLine = line;
    const startColumn = column;
    let lexeme = "";

    while (!atEnd() && current() !== "\n") {
      lexeme += advance();
    }

    addToken(lexeme, "COMENTARIO", startLine, startColumn);
  };

  const readBlockComment = () => {
    const startLine = line;
    const startColumn = column;
    let lexeme = "";

    lexeme += advance();
    lexeme += advance();

    while (!atEnd()) {
      const char = advance();
      lexeme += char;

      if (char === "*" && current() === "/") {
        lexeme += advance();
        addToken(lexeme, "COMENTARIO", startLine, startColumn);
        return;
      }
    }

    addError(lexeme, "Comentario de bloque sin cerrar", startLine, startColumn);
  };

  while (!atEnd()) {
    const char = current();

    if (char === "\r") {
      advance();
      continue;
    }

    if (char === "\n" || char === " " || char === "\t") {
      advance();
      continue;
    }

    if (isDigit(char)) {
      readNumber();
      continue;
    }

    if (isIdentifierStart(char)) {
      readIdentifier();
      continue;
    }

    if (char === '"' || char === "'") {
      readStringLike(char);
      continue;
    }

    if (char === "/" && peek() === "/") {
      readLineComment();
      continue;
    }

    if (char === "/" && peek() === "*") {
      readBlockComment();
      continue;
    }

    const pair = char + peek();
    if (MULTI_CHAR_TOKENS.has(pair)) {
      const startLine = line;
      const startColumn = column;
      advance();
      advance();
      addToken(pair, MULTI_CHAR_TOKENS.get(pair), startLine, startColumn);
      continue;
    }

    if (SINGLE_CHAR_TOKENS.has(char)) {
      const startLine = line;
      const startColumn = column;
      advance();
      addToken(char, SINGLE_CHAR_TOKENS.get(char), startLine, startColumn);
      continue;
    }

    if (DELIMITERS.has(char)) {
      const startLine = line;
      const startColumn = column;
      advance();
      addToken(char, "DELIMITADOR", startLine, startColumn);
      continue;
    }

    const startLine = line;
    const startColumn = column;
    addError(advance(), "Simbolo no reconocido", startLine, startColumn);
  }

  return {
    tokens,
    errors,
    totals: {
      tokens: tokens.length,
      errors: errors.length,
      lines: source.length === 0 ? 0 : source.split(/\r\n|\r|\n/).length,
      tokenTypes: new Set(tokens.map((token) => token.type)).size,
    },
  };
}

export const sampleCode = `int contador = 10;
float promedio = 3.14;
if (contador > 0 && true) {
  print("Hola analizador");
}`;
