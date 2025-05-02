"""
Dashboard de Visualización de Datos CSV
Materia: Lenguajes de Programación - 6to Semestre
Proyecto 02

Aplicación web Flask que permite cargar un archivo CSV, detectar
automáticamente sus columnas y tipos de datos, calcular estadísticas
básicas y generar gráficas interactivas configurables por el usuario.
"""

import os
import io
import csv
from flask import Flask, render_template, request, jsonify

from analizador import (
    MAX_FILE_BYTES,
    detectar_delimitador,
    leer_csv,
    analizar_columnas,
    estadisticas_por_columna,
)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_BYTES  # límite de 5 MB


@app.route("/")
def index():
    """Página principal del dashboard."""
    return render_template("index.html")


@app.route("/api/cargar", methods=["POST"])
def cargar_csv():
    """
    Recibe un archivo CSV, lo parsea y devuelve:
    - encabezados (nombres de columna)
    - tipo detectado por columna
    - estadísticas básicas por columna numérica
    - filas de datos (para alimentar las gráficas)
    """
    if "archivo" not in request.files:
        return jsonify({"error": "No se envió ningún archivo."}), 400

    archivo = request.files["archivo"]

    if archivo.filename == "":
        return jsonify({"error": "El nombre del archivo está vacío."}), 400

    if not archivo.filename.lower().endswith(".csv"):
        return jsonify({"error": "El archivo debe tener extensión .csv"}), 400

    # Leer los bytes y validar tamaño manualmente (defensa adicional)
    contenido_bytes = archivo.read()
    if len(contenido_bytes) > MAX_FILE_BYTES:
        return jsonify({"error": "El archivo supera el límite de 5 MB."}), 400

    if len(contenido_bytes) == 0:
        return jsonify({"error": "El archivo está vacío."}), 400

    # Intentar decodificar con distintos encodings comunes
    texto = None
    for encoding in ("utf-8-sig", "utf-8", "latin-1", "cp1252"):
        try:
            texto = contenido_bytes.decode(encoding)
            encoding_usado = encoding
            break
        except UnicodeDecodeError:
            continue

    if texto is None:
        return jsonify({"error": "No se pudo leer la codificación del archivo."}), 400

    try:
        delimitador = detectar_delimitador(texto)
        encabezados, filas = leer_csv(texto, delimitador)
    except Exception as e:
        return jsonify({"error": f"Error al parsear el CSV: {e}"}), 400

    if not encabezados:
        return jsonify({"error": "El CSV no contiene encabezados válidos."}), 400

    tipos = analizar_columnas(encabezados, filas)
    estadisticas = estadisticas_por_columna(encabezados, filas, tipos)

    return jsonify({
        "ok": True,
        "nombre_archivo": archivo.filename,
        "encoding": encoding_usado,
        "delimitador": delimitador,
        "total_filas": len(filas),
        "encabezados": encabezados,
        "tipos": tipos,
        "estadisticas": estadisticas,
        "filas": filas,
    })


@app.errorhandler(413)
def archivo_muy_grande(e):
    return jsonify({"error": "El archivo supera el límite de 5 MB."}), 413


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
