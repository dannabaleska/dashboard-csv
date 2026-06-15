# Dashboard de Visualización de Datos CSV

**Materia:** Lenguajes de Programación · 6º Semestre
**Proyecto 02 — Propuesta de Proyectos Finales**

Aplicación web que permite cargar un archivo CSV, detectar automáticamente sus columnas y tipos de datos, calcular estadísticas básicas y generar gráficas interactivas configurables por el usuario (barras, líneas, pastel y dispersión).

---

## 1. Descripción

El sistema resuelve el problema de explorar rápidamente un conjunto de datos tabular sin necesidad de herramientas pesadas. El usuario sube un `.csv`, el backend lo parsea de forma robusta (detectando delimitador y codificación), clasifica cada columna como **numérica**, **fecha** o **texto**, y devuelve estadísticas básicas. En el navegador, el usuario elige el tipo de gráfica y los ejes, y puede exportar el resultado como imagen PNG.

### Reto técnico abordado
Parsear CSV con diferentes **delimitadores** (coma, punto y coma, tabulador, pipe) y **encodings** (UTF-8, Latin-1, CP1252), y vincular dinámicamente los datos a la librería de gráficos según la selección del usuario. La detección de tipos usa un umbral del 80% de coincidencia por columna, y el motor acepta decimales con coma (formato latinoamericano).

---

## 2. Funcionalidades

- Carga y parseo de archivos CSV de hasta **5 MB** (con drag & drop).
- Detección automática del **delimitador** y del **encoding**.
- Detección automática de **tipos de columna**: numérico, texto, fecha.
- **Estadísticas básicas** por columna: media, mediana, mínimo, máximo, conteo y valores únicos.
- Selector de **tipo de gráfica** (barras, líneas, pastel, dispersión) y ejes configurables.
- **Exportación** del gráfico como imagen **PNG**.
- Vista previa de las primeras 20 filas de datos.

---

## 3. Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3 + Flask |
| Motor de análisis | Python (módulo `csv`, `statistics`, `datetime`) |
| Frontend | HTML + CSS + JavaScript (vanilla) |
| Gráficas | Chart.js 4.4.1 (vía CDN) |

---

## 4. Estructura del proyecto

```
dashboard-csv/
├── app.py                  # Servidor Flask y endpoints
├── analizador.py           # Motor de análisis (lógica de negocio)
├── requirements.txt
├── README.md
├── templates/
│   └── index.html          # Interfaz del dashboard
├── static/
│   ├── css/estilos.css
│   └── js/dashboard.js      # Lógica del cliente y render de gráficas
├── data/                   # 3 datasets CSV de prueba
│   ├── ventas_mensuales.csv        (delimitador: coma)
│   ├── clima_ciudades.csv          (delimitador: punto y coma)
│   └── rendimiento_academico.csv   (delimitador: tabulador)
└── docs/
    ├── casos_de_prueba.md  # Casos de prueba documentados
    └── log_prompts.md      # Log de interacciones con el agente
```

---

## 5. Instalación

Requisitos previos: **Python 3.10 o superior**.

```bash
# 1. Clonar el repositorio
git clone <URL-del-repositorio>
cd dashboard-csv

# 2. (Opcional) Crear entorno virtual
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt
```

---

## 6. Uso

```bash
python app.py
```

Luego abrir el navegador en: **http://localhost:5000**

Pasos en la aplicación:
1. Arrastra un archivo `.csv` a la zona de carga (o haz clic en **Seleccionar archivo**). Puedes usar los datasets de la carpeta `data/`.
2. Revisa el resumen, las estadísticas y la vista previa que aparecen automáticamente.
3. En **Generador de gráficas**, elige el tipo y las columnas para los ejes.
4. Pulsa **Generar gráfica**.
5. Pulsa **Exportar como PNG** para descargar la imagen.

---

## 7. Capturas

> _Sustituir por capturas reales al entregar:_
>
> - `docs/captura_carga.png` — pantalla de carga
> - `docs/captura_estadisticas.png` — tabla de estadísticas
> - `docs/captura_grafica.png` — gráfica generada

---

## 8. Casos de prueba y log del agente

- Casos de prueba documentados: [`docs/casos_de_prueba.md`](docs/casos_de_prueba.md)
- Log de interacciones con el agente: [`docs/log_prompts.md`](docs/log_prompts.md)

---

## 9. Autores

> _integrantes del equipo:_
> - Alvarez Salazar Danna Baleska
> - Coello Cercado Cesar Daniel
> - Garcia Alvarado Anthony David
> - Fajardo Mayorga Emerson Onias
> - Moran Huancayo Valeska Domenica 

