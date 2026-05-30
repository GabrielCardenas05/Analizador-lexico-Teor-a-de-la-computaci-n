import React, { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Download,
  FileCode2,
  Play,
  RotateCcw,
  Upload,
} from "lucide-react";
import { analyzeCode } from "./lib/lexer.js";

const emptyResult = {
  tokens: [],
  errors: [],
  totals: {
    tokens: 0,
    errors: 0,
    lines: 0,
    tokenTypes: 0,
  },
};

const tokenLabels = {
  PALABRA_RESERVADA: "Palabra reservada",
  IDENTIFICADOR: "Identificador",
  NUMERO_ENTERO: "Numero entero",
  NUMERO_DECIMAL: "Numero decimal",
  CADENA: "Cadena",
  CARACTER: "Caracter",
  ASIGNACION: "Asignacion",
  ASIGNACION_COMPUESTA: "Asignacion compuesta",
  OPERADOR_ARITMETICO: "Operador aritmetico",
  OPERADOR_RELACIONAL: "Operador relacional",
  OPERADOR_LOGICO: "Operador logico",
  OPERADOR_INCREMENTO: "Operador incremento",
  DELIMITADOR: "Delimitador",
  COMENTARIO: "Comentario",
};

const regexRows = [
  {
    type: "Palabra reservada",
    regex: String.raw`\b(int|float|string|bool|if|else|while|print|true|false)\b`,
  },
  {
    type: "Identificador",
    regex: String.raw`[a-zA-Z_][a-zA-Z0-9_]*`,
  },
  {
    type: "Entero",
    regex: String.raw`[0-9]+`,
  },
  {
    type: "Decimal",
    regex: String.raw`[0-9]+\.[0-9]+`,
  },
  {
    type: "Cadena",
    regex: String.raw`"[^"\n]*"`,
  },
  {
    type: "Operador relacional",
    regex: String.raw`==|!=|>=|<=|>|<`,
  },
  {
    type: "Operador logico",
    regex: String.raw`&&|\|\||!`,
  },
  {
    type: "Delimitador",
    regex: String.raw`;|,|\(|\)|\{|\}|\[|\]`,
  },
];

const afdStates = [
  ["q0", "Estado inicial. Decide si el simbolo inicia id, numero, cadena, operador o delimitador."],
  ["qID", "Acepta identificadores: letra seguida de letras, digitos o guion bajo."],
  ["qINT", 'Acepta enteros; con "." pasa a qDOT.'],
  ["qDOT", 'Despues de "." exige al menos un digito para formar decimal.'],
  ["qDEC", "Acepta decimales."],
  ["qSTR", "Lee caracteres de cadena hasta encontrar comillas de cierre."],
  ["qACCEPT", "Estado de aceptacion y emision de token."],
  ["qERROR", "Estado de error lexico: simbolo invalido, numero mal formado o cadena sin cerrar."],
];

function App() {
  const [sourceCode, setSourceCode] = useState("");
  const [analysis, setAnalysis] = useState(emptyResult);
  const [fileName, setFileName] = useState("sin-archivo");
  const fileInputRef = useRef(null);

  const groupedTokens = useMemo(() => {
    return analysis.tokens.reduce((groups, token) => {
      groups[token.type] = (groups[token.type] ?? 0) + 1;
      return groups;
    }, {});
  }, [analysis.tokens]);

  const handleAnalyze = () => {
    setAnalysis(analyzeCode(sourceCode));
  };

  const handleClear = () => {
    setSourceCode("");
    setFileName("sin-archivo");
    setAnalysis(emptyResult);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setFileName(file.name);
    setSourceCode(text);
    setAnalysis(analyzeCode(text));
  };

  const downloadCsv = () => {
    const header = "LEXEMA,TOKEN,LINEA,COLUMNA\n";
    const rows = analysis.tokens
      .map((token) =>
        [
          csvEscape(token.lexeme),
          csvEscape(token.type),
          token.line,
          token.column,
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tabla-tokens.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="workspace__header">
          <div>
            <p className="eyebrow">Proyecto de teoria de la computacion</p>
            <h1>Analizador Léxico y sintáctico</h1>
          </div>
          <div className="file-chip" title={fileName}>
            <FileCode2 size={18} aria-hidden="true" />
            <span>{fileName}</span>
          </div>
        </div>

        <div className="editor-panel">
          <label className="field-label" htmlFor="source-code">
            Codigo fuente
          </label>
          <textarea
            id="source-code"
            spellCheck="false"
            value={sourceCode}
            onChange={(event) => setSourceCode(event.target.value)}
          />

          <div className="actions">
            <input
              ref={fileInputRef}
              className="sr-only"
              type="file"
              accept=".txt,.c,.cpp,.java,.js,.cs,.py,.mlang"
              onChange={handleFile}
            />
            <button
              className="button button--soft"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Cargar archivo"
            >
              <Upload size={18} aria-hidden="true" />
              <span>Cargar</span>
            </button>
            <button
              className="button button--primary"
              type="button"
              onClick={handleAnalyze}
              title="Analizar codigo"
            >
              <Play size={18} aria-hidden="true" />
              <span>Analizar</span>
            </button>
            <button
              className="button button--ghost"
              type="button"
              onClick={handleClear}
              title="Limpiar editor"
            >
              <RotateCcw size={18} aria-hidden="true" />
              <span>Limpiar</span>
            </button>
            <button
              className="button button--ghost"
              type="button"
              onClick={downloadCsv}
              disabled={analysis.tokens.length === 0}
              title="Descargar tabla de tokens"
            >
              <Download size={18} aria-hidden="true" />
              <span>CSV</span>
            </button>
          </div>

          <div className="stats-grid" aria-label="Resumen del analisis">
            <Stat label="Tokens" value={analysis.totals.tokens} />
            <Stat
              label="Errores"
              value={analysis.totals.errors}
              danger={analysis.totals.errors > 0}
            />
            <Stat label="Lineas" value={analysis.totals.lines} />
            <Stat label="Tipos" value={analysis.totals.tokenTypes} />
          </div>
        </div>

        <section className="results-grid">
          <div className="result-panel">
            <div className="section-title">
              <h2>Tabla de Tokens</h2>
              <span>{analysis.tokens.length}</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Lexema</th>
                    <th>Token</th>
                    <th>Linea</th>
                    <th>Columna</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.tokens.length === 0 ? (
                    <EmptyRow colSpan={4} text="Sin tokens generados" />
                  ) : (
                    analysis.tokens.map((token) => (
                      <tr key={token.id}>
                        <td>
                          <code>{token.lexeme}</code>
                        </td>
                        <td>{token.type}</td>
                        <td>{token.line}</td>
                        <td>{token.column}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="side-panel">
            <div className="result-panel result-panel--compact">
              <div className="section-title">
                <h2>Categorias</h2>
                <span>{Object.keys(groupedTokens).length}</span>
              </div>
              <div className="category-list">
                {Object.keys(groupedTokens).length === 0 ? (
                  <p className="empty-text">Sin categorias</p>
                ) : (
                  Object.entries(groupedTokens).map(([type, total]) => (
                    <div className="category-item" key={type}>
                      <span>{tokenLabels[type] ?? type}</span>
                      <strong>{total}</strong>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="result-panel result-panel--compact">
              <div className="section-title">
                <h2>Resumen</h2>
                <span>{analysis.totals.lines}</span>
              </div>
              <div className="summary-list">
                <div>
                  <span>Archivo</span>
                  <strong>{fileName}</strong>
                </div>
                <div>
                  <span>Lineas analizadas</span>
                  <strong>{analysis.totals.lines}</strong>
                </div>
                <div>
                  <span>Errores detectados</span>
                  <strong>{analysis.totals.errors}</strong>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="result-panel error-panel">
          <div className="section-title">
            <h2>Errores Lexicos</h2>
            <span
              className={
                analysis.errors.length > 0 ? "badge badge--danger" : "badge"
              }
            >
              {analysis.errors.length}
            </span>
          </div>
          <div className="table-wrap table-wrap--errors">
            <table>
              <thead>
                <tr>
                  <th>Lexema</th>
                  <th>Error</th>
                  <th>Linea</th>
                </tr>
              </thead>
              <tbody>
                {analysis.errors.length === 0 ? (
                  <EmptyRow
                    className="empty-cell--error"
                    colSpan={3}
                    text="Sin errores lexicos"
                  />
                ) : (
                  analysis.errors.map((error) => (
                    <tr className="error-row" key={error.id}>
                      <td>
                        <code>{error.lexeme}</code>
                      </td>
                      <td>
                        <span className="error-line">
                          <AlertTriangle size={15} aria-hidden="true" />
                          {error.message}
                        </span>
                      </td>
                      <td>{error.line}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="result-panel theory-panel">
          <div className="section-title section-title--plain">
            <h2>Evidencia Teorica</h2>
          </div>
          <div className="theory-grid">
            <div>
              <h3>Expresiones Regulares</h3>
              <div className="table-wrap table-wrap--theory">
                <table>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Regex</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regexRows.map((row) => (
                      <tr key={row.type}>
                        <td>{row.type}</td>
                        <td>
                          <code>{row.regex}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3>AFD de Reconocimiento</h3>
              <ul className="afd-list">
                {afdStates.map(([state, description]) => (
                  <li key={state}>
                    <strong>{state}:</strong> {description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value, danger = false }) {
  return (
    <div className={`stat ${danger ? "stat--danger" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyRow({ className = "", colSpan, text }) {
  return (
    <tr>
      <td className={`empty-cell ${className}`} colSpan={colSpan}>
        {text}
      </td>
    </tr>
  );
}

function csvEscape(value) {
  const text = String(value).replaceAll('"', '""');
  return `"${text}"`;
}

export default App;
