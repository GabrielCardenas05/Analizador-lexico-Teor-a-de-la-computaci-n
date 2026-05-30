import { analyzeCode, sampleCode } from "../src/lib/lexer.js";

const result = analyzeCode(sampleCode);
const resultWithErrors = analyzeCode(`int x = 10;
@ "sin cerrar`);
const resultWithBadChar = analyzeCode("char letra = 'ab';");
const errorMessages = resultWithErrors.errors.map((error) => error.message);

const expectations = [
  [result.tokens.length === 25, `tokens esperados: 25, recibidos: ${result.tokens.length}`],
  [result.errors.length === 0, `errores esperados: 0, recibidos: ${result.errors.length}`],
  [result.tokens[0]?.lexeme === "int", "primer lexema esperado: int"],
  [result.tokens.at(-1)?.lexeme === "}", "ultimo lexema esperado: }"],
  [
    errorMessages.includes("Simbolo no reconocido"),
    "debe detectar simbolos no reconocidos",
  ],
  [
    errorMessages.includes("Literal sin cerrar"),
    "debe detectar literales sin cerrar",
  ],
  [
    resultWithBadChar.errors[0]?.message === "Caracter mal formado",
    "debe detectar caracteres mal formados",
  ],
];

const failures = expectations.filter(([passed]) => !passed);

if (failures.length > 0) {
  console.error("Fallo la verificacion del lexer:");
  for (const [, message] of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log("Lexer verificado: ejemplo base y casos de error pasaron.");
