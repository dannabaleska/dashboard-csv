# Log de Interacciones con el Agente (Claude Code / Codex)

Proyecto 02 — Dashboard de Visualización de Datos CSV

El enunciado exige documentar **al menos 20 interacciones** con el agente, y que el equipo comprenda, adapte y extienda el código generado. Este log es una **plantilla base** con las interacciones reales del desarrollo. El equipo debe ajustar las redacciones a su propio proceso y agregar capturas de pantalla del agente en uso.

> **Importante para la defensa:** durante la exposición, cada integrante debe poder explicar el código que documenta abajo. Revisen especialmente el módulo `analizador.py` (detección de delimitador y tipos) y la función `generarGrafica()` de `dashboard.js`, que son los puntos más probables de preguntas técnicas.

---

| # | Prompt al agente | Qué generó / ayudó | Adaptación del equipo |
|---|------------------|--------------------|-----------------------|
| 1 | "Crea la estructura base de un proyecto Flask con carpetas templates, static y data" | Estructura de carpetas y `app.py` mínimo | Renombramos carpetas a español |
| 2 | "Escribe un endpoint Flask que reciba un archivo CSV por POST" | Ruta `/api/cargar` con validación de archivo | Añadimos validación de extensión `.csv` |
| 3 | "¿Cómo detectar automáticamente el delimitador de un CSV en Python?" | Uso de `csv.Sniffer` | Agregamos respaldo por conteo manual |
| 4 | "Maneja varios encodings al leer el CSV (UTF-8, Latin-1)" | Bucle de intentos de `decode` | Añadimos `utf-8-sig` y `cp1252` |
| 5 | "Función que clasifique una columna como numérica, fecha o texto" | `detectar_tipo_columna` con umbral | Ajustamos umbral a 80% |
| 6 | "Acepta números con coma decimal (formato latino)" | Reemplazo de `,` por `.` antes de `float` | Aplicado en `_es_numero` y `_a_numero` |
| 7 | "Reconoce varios formatos de fecha comunes" | Lista `FORMATOS_FECHA` con `strptime` | Agregamos formato `dd/mm/yy` |
| 8 | "Calcula media, mediana, mínimo y máximo por columna" | `estadisticas_por_columna` con `statistics` | Añadimos conteo de valores únicos para texto |
| 9 | "Normaliza filas que tengan más o menos columnas que el encabezado" | Relleno/recorte de filas en `leer_csv` | Verificado con CSV irregular |
| 10 | "Diseña el HTML del dashboard con zona de carga drag & drop" | `index.html` con dropzone | Reescribimos estilos a nuestra paleta |
| 11 | "Estilo CSS tipo editorial con tonos cálidos y tipografía serif" | `estilos.css` base | Ajustamos colores y fuentes |
| 12 | "JavaScript para subir el archivo con fetch y FormData" | Función `subirArchivo` | Añadimos validación de tamaño en cliente |
| 13 | "Renderiza una tabla de estadísticas desde el JSON de respuesta" | `renderEstadisticas` | Añadimos badges de color por tipo |
| 14 | "Integra Chart.js para generar gráfica de barras configurable" | `generarGrafica` para barras | Extendimos a líneas, pastel y dispersión |
| 15 | "Agrega valores numéricos agrupados por categoría para el eje X" | `agruparPorCategoria` | Añadimos conteo cuando Y no es numérico |
| 16 | "Implementa gráfica de dispersión con pares (x, y) numéricos" | Rama `scatter` en `generarGrafica` | Filtramos valores no numéricos |
| 17 | "Cambia las etiquetas de los ejes según el tipo de gráfica" | `actualizarEtiquetas` | Adaptamos textos en español |
| 18 | "Exporta el canvas de Chart.js como PNG con fondo blanco" | Botón exportar con canvas temporal | Verificado en Chrome y Firefox |
| 19 | "Valida que el archivo no supere 5 MB en el backend" | `MAX_CONTENT_LENGTH` + chequeo manual | Añadimos `errorhandler(413)` |
| 20 | "Genera 3 datasets CSV de prueba con distintos delimitadores" | 3 archivos en `data/` | Adaptamos datos al rubro del negocio |
| 21 | "Escribe el README con instalación, uso y estructura" | `README.md` base | Completamos autores y capturas |
| 22 | "Redacta casos de prueba documentados por funcionalidad" | `casos_de_prueba.md` | Ejecutamos y confirmamos resultados |

---

## Notas de comprensión (para la defensa individual)

- **Detección de delimitador:** `csv.Sniffer` analiza una muestra del texto y deduce el separador; si lanza error (CSV ambiguo), contamos manualmente los candidatos en la primera línea.
- **Umbral del 80%:** una columna se considera numérica/fecha solo si al menos el 80% de sus valores no vacíos cumplen ese tipo, para tolerar celdas sucias o vacías.
- **Agregación en gráficas:** cuando varias filas comparten la misma categoría en el eje X, sus valores Y se suman (`agruparPorCategoria`); así una columna como "categoría" produce una barra por categoría y no una por fila.
- **Exportar PNG:** el canvas de Chart.js es transparente, por eso se dibuja sobre un canvas temporal con fondo blanco antes de generar el PNG.
