"""
analizador.py
Motor de análisis del Dashboard CSV.

Contiene la lógica de negocio no trivial del proyecto:
- detección automática del delimitador
- parseo robusto del CSV
- detección automática del tipo de cada columna (numérico, fecha, texto)
- cálculo de estadísticas básicas (media, mediana, mínimo, máximo)

Reto técnico del proyecto: parsear CSV con diferentes delimitadores y
encodings, y clasificar correctamente los tipos de columna.
"""

import io
import csv
import statistics
from datetime import datetime

# Límite de 5 MB exigido por el enunciado
MAX_FILE_BYTES = 5 * 1024 * 1024

# Formatos de fecha que el detector intentará reconocer
FORMATOS_FECHA = (
    "%Y-%m-%d",
    "%d/%m/%Y",
    "%m/%d/%Y",
    "%d-%m-%Y",
    "%Y/%m/%d",
    "%d/%m/%y",
)


def detectar_delimitador(texto):
    """
    Detecta el delimitador del CSV usando csv.Sniffer.
    Si falla, recurre a un conteo simple sobre la primera línea.
    Soporta coma, punto y coma, tabulador y pipe.
    """
    muestra = texto[:4096]
    try:
        dialecto = csv.Sniffer().sniff(muestra, delimiters=",;\t|")
        return dialecto.delimiter
    except csv.Error:
        # Respaldo: contar candidatos en la primera línea
        primera_linea = texto.splitlines()[0] if texto.splitlines() else ""
        candidatos = {
            ",": primera_linea.count(","),
            ";": primera_linea.count(";"),
            "\t": primera_linea.count("\t"),
            "|": primera_linea.count("|"),
        }
        mejor = max(candidatos, key=candidatos.get)
        # Si no encontró nada, usar coma por defecto
        return mejor if candidatos[mejor] > 0 else ","


def leer_csv(texto, delimitador):
    """
    Parsea el texto CSV y devuelve (encabezados, filas).
    Cada fila es una lista de strings alineada con los encabezados.
    """
    buffer = io.StringIO(texto)
    lector = csv.reader(buffer, delimiter=delimitador)

    filas_crudas = [fila for fila in lector if any(c.strip() for c in fila)]

    if not filas_crudas:
        return [], []

    encabezados = [h.strip() for h in filas_crudas[0]]
    n = len(encabezados)

    filas = []
    for fila in filas_crudas[1:]:
        # Normalizar el largo de cada fila respecto a los encabezados
        if len(fila) < n:
            fila = fila + [""] * (n - len(fila))
        elif len(fila) > n:
            fila = fila[:n]
        filas.append([c.strip() for c in fila])

    return encabezados, filas


def _es_numero(valor):
    """Determina si un string representa un número (acepta coma decimal)."""
    if valor is None or valor == "":
        return False
    v = valor.replace(",", ".").strip()
    try:
        float(v)
        return True
    except ValueError:
        return False


def _a_numero(valor):
    """Convierte un string a float aceptando coma como separador decimal."""
    return float(valor.replace(",", ".").strip())


def _es_fecha(valor):
    """Determina si un string corresponde a alguno de los formatos de fecha."""
    if not valor:
        return False
    for fmt in FORMATOS_FECHA:
        try:
            datetime.strptime(valor.strip(), fmt)
            return True
        except ValueError:
            continue
    return False


def detectar_tipo_columna(valores):
    """
    Detecta el tipo de una columna a partir de sus valores no vacíos.
    Devuelve 'numerico', 'fecha' o 'texto'.

    Estrategia: una columna es de un tipo si al menos el 80% de sus
    valores no vacíos cumplen ese tipo. Se evalúa numérico, luego fecha,
    y por defecto texto.
    """
    no_vacios = [v for v in valores if v is not None and v.strip() != ""]
    if not no_vacios:
        return "texto"

    total = len(no_vacios)
    numericos = sum(1 for v in no_vacios if _es_numero(v))
    if numericos / total >= 0.8:
        return "numerico"

    fechas = sum(1 for v in no_vacios if _es_fecha(v))
    if fechas / total >= 0.8:
        return "fecha"

    return "texto"


def analizar_columnas(encabezados, filas):
    """Devuelve un diccionario {nombre_columna: tipo_detectado}."""
    tipos = {}
    for i, col in enumerate(encabezados):
        valores = [fila[i] for fila in filas]
        tipos[col] = detectar_tipo_columna(valores)
    return tipos


def estadisticas_por_columna(encabezados, filas, tipos):
    """
    Calcula estadísticas por columna.
    - Numérico: media, mediana, mínimo, máximo, conteo.
    - Texto/fecha: conteo de valores y cantidad de valores únicos.
    """
    resultado = {}
    for i, col in enumerate(encabezados):
        valores = [fila[i] for fila in filas]
        no_vacios = [v for v in valores if v is not None and v.strip() != ""]

        if tipos[col] == "numerico":
            nums = [_a_numero(v) for v in no_vacios if _es_numero(v)]
            if nums:
                resultado[col] = {
                    "tipo": "numerico",
                    "conteo": len(nums),
                    "media": round(statistics.mean(nums), 4),
                    "mediana": round(statistics.median(nums), 4),
                    "minimo": round(min(nums), 4),
                    "maximo": round(max(nums), 4),
                }
            else:
                resultado[col] = {"tipo": "numerico", "conteo": 0}
        else:
            resultado[col] = {
                "tipo": tipos[col],
                "conteo": len(no_vacios),
                "unicos": len(set(no_vacios)),
            }
    return resultado
