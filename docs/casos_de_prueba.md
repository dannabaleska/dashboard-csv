# Casos de Prueba Documentados

Proyecto 02 — Dashboard de Visualización de Datos CSV

El enunciado exige **al menos 5 casos de prueba por funcionalidad principal**. A continuación se documentan agrupados por funcionalidad. Cada caso indica entrada, acción, resultado esperado y resultado obtenido.

---

## Funcionalidad A — Carga y parseo de CSV

| # | Caso | Entrada | Resultado esperado | Obtenido |
|---|------|---------|--------------------|----------|
| A1 | Carga válida con coma | `ventas_mensuales.csv` | Carga 12 filas, 5 columnas | ✅ OK |
| A2 | Delimitador punto y coma | `clima_ciudades.csv` | Detecta `;`, 8 filas | ✅ OK |
| A3 | Delimitador tabulador | `rendimiento_academico.csv` | Detecta `\t`, 10 filas | ✅ OK |
| A4 | Archivo no CSV | `prueba.txt` | Error: "debe tener extensión .csv" | ✅ OK |
| A5 | Archivo mayor a 5 MB | CSV > 5 MB | Error: "supera el límite de 5 MB" | ✅ OK |
| A6 | Archivo vacío | CSV de 0 bytes | Error: "El archivo está vacío" | ✅ OK |

---

## Funcionalidad B — Detección automática de tipos de columna

| # | Caso | Entrada | Resultado esperado | Obtenido |
|---|------|---------|--------------------|----------|
| B1 | Columna numérica entera | `unidades` | Tipo = numérico | ✅ OK |
| B2 | Columna numérica decimal con punto | `ventas` (4520.50) | Tipo = numérico | ✅ OK |
| B3 | Columna decimal con coma | `temperatura` (28,5) | Tipo = numérico | ✅ OK |
| B4 | Columna de fecha | `fecha_corte` (2024-01-31) | Tipo = fecha | ✅ OK |
| B5 | Columna de texto | `categoria` | Tipo = texto | ✅ OK |
| B6 | Columna mixta (<80% numérico) | texto con algún número | Tipo = texto | ✅ OK |

---

## Funcionalidad C — Estadísticas por columna

| # | Caso | Entrada | Resultado esperado | Obtenido |
|---|------|---------|--------------------|----------|
| C1 | Media de `ventas` | columna numérica | 3616.98 | ✅ OK |
| C2 | Mediana de `unidades` | columna numérica | 195.0 | ✅ OK |
| C3 | Mínimo de `temperatura` | columna numérica | 13.7 | ✅ OK |
| C4 | Máximo de `calificacion` | columna numérica | 9.4 | ✅ OK |
| C5 | Únicos en `carrera` | columna texto | 3 valores únicos | ✅ OK |
| C6 | Conteo en columna con vacíos | columna con celdas vacías | cuenta solo no vacíos | ✅ OK |

---

## Funcionalidad D — Generación de gráficas

| # | Caso | Entrada | Resultado esperado | Obtenido |
|---|------|---------|--------------------|----------|
| D1 | Gráfica de barras | X=mes, Y=ventas | Barras por mes | ✅ OK |
| D2 | Gráfica de líneas | X=mes, Y=unidades | Línea con tendencia | ✅ OK |
| D3 | Gráfica de pastel | X=categoria, Y=ventas | Pastel con proporciones | ✅ OK |
| D4 | Gráfica de dispersión | X=edad, Y=calificacion | Puntos (x,y) | ✅ OK |
| D5 | Cambiar tipo y regenerar | barras → líneas | Reemplaza la gráfica anterior | ✅ OK |
| D6 | Agregación por categoría | categoría repetida | Suma valores correctamente | ✅ OK |

---

## Funcionalidad E — Exportación a PNG

| # | Caso | Entrada | Resultado esperado | Obtenido |
|---|------|---------|--------------------|----------|
| E1 | Exportar barras | gráfica generada | Descarga `grafica.png` | ✅ OK |
| E2 | Exportar con fondo blanco | gráfica generada | PNG con fondo blanco (no transparente) | ✅ OK |
| E3 | Botón deshabilitado sin gráfica | sin generar gráfica | Botón inactivo | ✅ OK |
| E4 | Exportar pastel | gráfica de pastel | Descarga correcta | ✅ OK |
| E5 | Exportar dispersión | gráfica de dispersión | Descarga correcta | ✅ OK |

---

## Cómo reproducir las pruebas del backend

Las pruebas del motor de análisis (A, B, C) pueden reproducirse con el script incluido:

```bash
python -c "from analizador import *; texto=open('data/clima_ciudades.csv',encoding='utf-8').read(); d=detectar_delimitador(texto); enc,filas=leer_csv(texto,d); tipos=analizar_columnas(enc,filas); print(tipos); print(estadisticas_por_columna(enc,filas,tipos))"
```

Las pruebas de frontend (D, E) se verifican manualmente en el navegador siguiendo los pasos del README.
