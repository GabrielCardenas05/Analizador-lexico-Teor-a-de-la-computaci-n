# Analizador Léxico y sintáctico

Proyecto en React + Vite para analizar codigo fuente y generar una tabla de tokens con linea, columna, tipo de token y lexema. Tambien muestra errores lexicos detectados y permite cargar archivos de codigo fuente.

## Requisitos

- Node.js 18 o superior
- npm

## Ejecutar

```bash
npm install
npm run dev
```

## Verificar el lexer

```bash
npm run test:lexer
```

## Tokens reconocidos

- Palabras reservadas: `int`, `float`, `if`, `else`, `while`, `for`, `return`, `print`, `true`, `false`, entre otras.
- Identificadores.
- Numeros enteros y decimales.
- Cadenas y caracteres.
- Operadores aritmeticos, relacionales, logicos, incremento y asignacion.
- Delimitadores.
- Comentarios de linea y bloque.

Los errores lexicos se reportan con lexema, descripcion, linea y columna.
