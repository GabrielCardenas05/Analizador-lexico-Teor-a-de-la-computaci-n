# Analizador Léxico y sintáctico

## Descripción general

El proyecto consiste en una aplicación web orientada al análisis de código fuente. Su función principal es leer un texto escrito con una sintaxis tipo lenguaje de programación, recorrerlo carácter por carácter y transformar sus componentes en una tabla de tokens. Cada token conserva el lexema encontrado, su tipo, la línea en la que aparece y la columna donde inicia.

El programa se presenta como un analizador léxico con base para análisis sintáctico, ya que la tabla de tokens generada es la estructura que normalmente se utiliza como entrada para validar reglas gramaticales en una etapa posterior.

## Objetivo

El objetivo del sistema es representar de forma práctica la primera fase de un compilador: el análisis léxico. Esta fase permite identificar las unidades mínimas significativas de un programa, como palabras reservadas, identificadores, números, operadores, delimitadores, cadenas, caracteres y comentarios.

El analizador permite observar cómo un código fuente deja de ser solamente texto plano y se convierte en información clasificada. Esto facilita comprender la relación entre expresiones regulares, autómatas finitos y la construcción de compiladores.

## Finalidad del programa

El programa sirve para comprobar visualmente cómo se reconocen los elementos básicos de un lenguaje. Al ingresar o cargar código fuente, la aplicación genera una salida ordenada que muestra qué lexemas fueron aceptados, qué tipo de token representan y en qué posición se encontraron.

También permite detectar errores léxicos. Estos errores aparecen cuando el texto contiene símbolos no reconocidos, números mal formados, cadenas sin cerrar, comentarios de bloque incompletos o caracteres inválidos. La finalidad de esta detección es separar los elementos válidos de aquellos que no pertenecen al lenguaje definido.

## Funcionamiento

El analizador recibe una cadena de entrada y la procesa mediante un recorrido secuencial. Durante este recorrido mantiene tres referencias internas: la posición actual dentro del texto, la línea y la columna. Con esa información puede registrar la ubicación exacta de cada token o error.

Cuando encuentra una letra o guion bajo, intenta formar un identificador. Después compara el lexema obtenido con la lista de palabras reservadas para decidir si debe clasificarse como identificador o como palabra reservada.

Cuando encuentra un dígito, forma un número entero. Si aparece un punto seguido de otro dígito, el token se clasifica como número decimal. Si después del número aparece una letra, se reporta como número mal formado.

Cuando encuentra comillas dobles o simples, procesa literales de cadena o de carácter. Si el cierre no aparece antes del final de línea o del final del archivo, se genera un error léxico.

El sistema también reconoce operadores de uno o dos caracteres, delimitadores, comentarios de línea y comentarios de bloque. Los caracteres que no pertenecen a ninguna categoría se agregan a la tabla de errores.

## Desarrollo del analizador

La lógica principal del proyecto está separada de la interfaz. El análisis se realiza mediante una función especializada que recibe el código fuente y devuelve tres elementos: la lista de tokens, la lista de errores y un resumen del análisis.

Esta separación permite que el proceso léxico sea independiente de la vista. La interfaz solo se encarga de recibir el código, mostrar el resultado y organizar la información en tablas, mientras que el analizador conserva la responsabilidad de clasificar el texto.

El desarrollo usa estructuras simples para representar el lenguaje:

- Un conjunto de palabras reservadas.
- Un mapa de operadores de dos caracteres.
- Un mapa de operadores de un carácter.
- Un conjunto de delimitadores.
- Reglas de lectura para identificadores, números, cadenas, comentarios y símbolos desconocidos.

Esta organización permite que el comportamiento del analizador sea claro y extensible. Si se desea ampliar el lenguaje, se pueden agregar nuevas palabras reservadas, operadores o reglas de reconocimiento sin modificar toda la aplicación.

## Tokens reconocidos

El analizador clasifica los lexemas en las siguientes categorías:

- Palabras reservadas.
- Identificadores.
- Números enteros.
- Números decimales.
- Cadenas.
- Caracteres.
- Operadores aritméticos.
- Operadores relacionales.
- Operadores lógicos.
- Operadores de incremento.
- Asignaciones simples y compuestas.
- Delimitadores.
- Comentarios.

Cada token generado contiene su lexema original, el tipo asignado, la línea y la columna. Esto permite analizar no solo qué elementos existen en el código, sino también dónde se ubican.

## Manejo de errores léxicos

Los errores léxicos se almacenan por separado para distinguirlos de los tokens válidos. Cada error conserva el lexema problemático, una descripción del problema, la línea y la columna.

El sistema considera errores léxicos los símbolos que no forman parte del lenguaje definido, los literales sin cerrar, los comentarios de bloque incompletos, los números mal formados y los caracteres que no cumplen la estructura esperada.

Separar los errores de los tokens permite revisar el código fuente sin perder el análisis de las partes correctas. Esto es importante porque un analizador no debe detenerse ante el primer error; debe reportar la mayor cantidad de información útil posible.

## Evidencia teórica

La aplicación incluye una sección de evidencia teórica para relacionar el comportamiento del programa con los conceptos vistos en clase. En esta sección se muestran expresiones regulares representativas para los tipos de token principales y una descripción del AFD de reconocimiento.

Las expresiones regulares muestran la forma esperada de cada lexema. El AFD describe los estados generales que sigue el reconocimiento: estado inicial, reconocimiento de identificadores, lectura de números enteros y decimales, lectura de cadenas, aceptación de tokens y detección de errores.

Esta evidencia ayuda a justificar por qué el programa clasifica el texto de cierta manera. La intención es mostrar que el análisis no se realiza de forma arbitraria, sino con reglas formales basadas en patrones y estados.

## Interfaz del programa

La interfaz está diseñada para mostrar el flujo completo del análisis. Primero se presenta un área de código fuente donde se puede ingresar texto o cargar un archivo. Después se muestra un resumen con la cantidad de tokens, errores, líneas analizadas y tipos encontrados.

La tabla de tokens funciona como salida principal del analizador. La tabla de errores muestra los problemas detectados. La sección de categorías resume cuántos tokens aparecieron de cada tipo. Finalmente, la evidencia teórica conecta los resultados prácticos con las reglas formales usadas para reconocerlos.

El modo oscuro se utiliza para mejorar la lectura del código y de las tablas, además de dar una presentación visual más clara para una herramienta de análisis.

## Importancia dentro del análisis sintáctico

Aunque el programa se enfoca en el análisis léxico, su salida es necesaria para una etapa sintáctica. Un analizador sintáctico no trabaja directamente con caracteres aislados, sino con una secuencia ordenada de tokens.

Por eso, la tabla generada por este proyecto representa el punto de partida para validar estructuras gramaticales como declaraciones, asignaciones, condiciones, ciclos o llamadas a funciones. Primero se reconoce qué elementos existen; después se puede verificar si esos elementos respetan una gramática.

## Conclusión

El proyecto demuestra cómo un programa puede transformar código fuente en una representación estructurada mediante reglas léxicas. Su propósito es hacer visible el proceso de reconocimiento de tokens, detección de errores y relación entre teoría formal y construcción de compiladores.

La aplicación permite entender para qué sirve el análisis léxico: organizar el texto de entrada, eliminar ambigüedad inicial, detectar errores básicos y preparar la información necesaria para continuar con el análisis sintáctico.
