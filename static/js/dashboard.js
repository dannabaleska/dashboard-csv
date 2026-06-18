/*
 * dashboard.js
 * Lógica del cliente: carga del CSV, render de tablas, generación de
 * gráficas con Chart.js y exportación a PNG.
 */

// Estado global de la aplicación
let datos = {
  encabezados: [],
  tipos: {},
  filas: [],
  estadisticas: {},
};

let grafica = null; // instancia actual de Chart.js

// Paleta coherente con el CSS
const PALETA = [
  "#d4731c", "#2d5670", "#3b6b4a", "#b3402f", "#e89a4a",
  "#8a8275", "#4a7a8c", "#6b8e5a", "#c4623f", "#a08968",
];

// --- Referencias al DOM ---
const inputArchivo = document.getElementById("inputArchivo");
const dropZone = document.getElementById("dropZone");
const cargaEstado = document.getElementById("cargaEstado");
const selTipo = document.getElementById("selTipo");
const selEjeX = document.getElementById("selEjeX");
const selEjeY = document.getElementById("selEjeY");
const btnGenerar = document.getElementById("btnGenerar");
const btnExportar = document.getElementById("btnExportar");

// --- Carga del archivo ---
inputArchivo.addEventListener("change", (e) => {
  if (e.target.files.length) subirArchivo(e.target.files[0]);
});

// Drag & drop
["dragenter", "dragover"].forEach((ev) =>
  dropZone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropZone.classList.add("activo");
  })
);
["dragleave", "drop"].forEach((ev) =>
  dropZone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropZone.classList.remove("activo");
  })
);
dropZone.addEventListener("drop", (e) => {
  if (e.dataTransfer.files.length) subirArchivo(e.dataTransfer.files[0]);
});

function subirArchivo(archivo) {
  if (!archivo.name.toLowerCase().endsWith(".csv")) {
    mostrarEstado("El archivo debe ser .csv", "error");
    return;
  }
  if (archivo.size > 5 * 1024 * 1024) {
    mostrarEstado("El archivo supera los 5 MB", "error");
    return;
  }

  mostrarEstado("Procesando archivo...", "");

  const formData = new FormData();
  formData.append("archivo", archivo);

  fetch("/api/cargar", { method: "POST", body: formData })
    .then((r) => r.json())
    .then((res) => {
      if (res.error) {
        mostrarEstado(res.error, "error");
        return;
      }
      datos = res;
      mostrarEstado(
        `Archivo cargado: ${res.total_filas} filas, ${res.encabezados.length} columnas`,
        "exito"
      );
      renderTodo();
    })
    .catch((err) => mostrarEstado("Error de conexión: " + err.message, "error"));
}

function mostrarEstado(texto, clase) {
  cargaEstado.textContent = texto;
  cargaEstado.className = "carga-estado " + clase;
}

// --- Render general ---
function renderTodo() {
  renderResumen();
  renderEstadisticas();
  prepararControles();
  renderVistaPrevia();
  mostrarPaneles();
}

function mostrarPaneles() {
  ["panelResumen", "panelEstadisticas", "panelGrafica", "panelDatos"].forEach((id) => {
    const el = document.getElementById(id);
    el.classList.remove("oculto");
    el.classList.add("aparece");
  });
}

// --- Resumen ---
function renderResumen() {
  document.getElementById("resArchivo").textContent = datos.nombre_archivo;
  document.getElementById("resFilas").textContent = datos.total_filas;
  document.getElementById("resColumnas").textContent = datos.encabezados.length;
  const delimMap = { ",": "coma", ";": "punto y coma", "\t": "tabulador", "|": "pipe" };
  document.getElementById("resDelim").textContent = delimMap[datos.delimitador] || datos.delimitador;
  document.getElementById("resEncoding").textContent = datos.encoding;
}

// --- Estadísticas ---
function renderEstadisticas() {
  const tabla = document.getElementById("tablaStats");
  const thead = tabla.querySelector("thead");
  const tbody = tabla.querySelector("tbody");

  thead.innerHTML = `
    <tr>
      <th>Columna</th><th>Tipo</th><th>Conteo</th>
      <th>Media</th><th>Mediana</th><th>Mínimo</th><th>Máximo</th><th>Únicos</th>
    </tr>`;

  tbody.innerHTML = "";
  datos.encabezados.forEach((col) => {
    const s = datos.estadisticas[col];
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${col}</td>
      <td><span class="badge-tipo tipo-${s.tipo}">${s.tipo}</span></td>
      <td>${s.conteo ?? "—"}</td>
      <td>${s.media ?? "—"}</td>
      <td>${s.mediana ?? "—"}</td>
      <td>${s.minimo ?? "—"}</td>
      <td>${s.maximo ?? "—"}</td>
      <td>${s.unicos ?? "—"}</td>`;
    tbody.appendChild(fila);
  });
}

// --- Controles de gráfica ---
function prepararControles() {
  selEjeX.innerHTML = "";
  selEjeY.innerHTML = "";

  datos.encabezados.forEach((col) => {
    selEjeX.appendChild(new Option(col, col));
    selEjeY.appendChild(new Option(col, col));
  });

  // Sugerir por defecto: X una columna de texto/fecha, Y una numérica
  const numericas = datos.encabezados.filter((c) => datos.tipos[c] === "numerico");
  const noNumericas = datos.encabezados.filter((c) => datos.tipos[c] !== "numerico");

  if (noNumericas.length) selEjeX.value = noNumericas[0];
  if (numericas.length) selEjeY.value = numericas[0];

  actualizarEtiquetas();
  selTipo.addEventListener("change", actualizarEtiquetas);
}

function actualizarEtiquetas() {
  const tipo = selTipo.value;
  const lblX = document.getElementById("lblEjeX");
  const lblY = document.getElementById("lblEjeY");
  if (tipo === "pie") {
    lblX.textContent = "Categorías (etiquetas)";
    lblY.textContent = "Valores numéricos";
  } else if (tipo === "scatter") {
    lblX.textContent = "Eje X (numérico)";
    lblY.textContent = "Eje Y (numérico)";
  } else {
    lblX.textContent = "Eje X (categoría)";
    lblY.textContent = "Eje Y (valor numérico)";
  }
}

// --- Generación de gráfica ---
btnGenerar.addEventListener("click", generarGrafica);

function generarGrafica() {
  const tipo = selTipo.value;
  const colX = selEjeX.value;
  const colY = selEjeY.value;

  const idxX = datos.encabezados.indexOf(colX);
  const idxY = datos.encabezados.indexOf(colY);

  if (grafica) grafica.destroy();

  const ctx = document.getElementById("lienzo").getContext("2d");
  let config;

  if (tipo === "scatter") {
    // Dispersión: ambos ejes numéricos
    const puntos = datos.filas
      .map((f) => ({
        x: parseFloat(String(f[idxX]).replace(",", ".")),
        y: parseFloat(String(f[idxY]).replace(",", ".")),
      }))
      .filter((p) => !isNaN(p.x) && !isNaN(p.y));

    config = {
      type: "scatter",
      data: {
        datasets: [{
          label: `${colY} vs ${colX}`,
          data: puntos,
          backgroundColor: PALETA[0],
          borderColor: PALETA[1],
          pointRadius: 5,
        }],
      },
      options: opcionesBase(true),
    };
  } else if (tipo === "pie") {
    // Pastel: agregar valores numéricos por categoría
    const agregado = agruparPorCategoria(idxX, idxY);
    const etiquetas = Object.keys(agregado);
    const valores = Object.values(agregado);

    config = {
      type: "pie",
      data: {
        labels: etiquetas,
        datasets: [{
          data: valores,
          backgroundColor: etiquetas.map((_, i) => PALETA[i % PALETA.length]),
          borderColor: "#f4f0e8",
          borderWidth: 2,
        }],
      },
      options: opcionesBase(false),
    };
  } else {
    // Barras y líneas: agregar por categoría
    const agregado = agruparPorCategoria(idxX, idxY);
    const etiquetas = Object.keys(agregado);
    const valores = Object.values(agregado);

    config = {
      type: tipo,
      data: {
        labels: etiquetas,
        datasets: [{
          label: colY,
          data: valores,
          backgroundColor: tipo === "line" ? "rgba(212,115,28,0.15)" : etiquetas.map((_, i) => PALETA[i % PALETA.length]),
          borderColor: PALETA[0],
          borderWidth: 2,
          fill: tipo === "line",
          tension: 0.3,
        }],
      },
      options: opcionesBase(true),
    };
  }

  grafica = new Chart(ctx, config);
  btnExportar.disabled = false;
}

// Agrupa los valores de la columna Y sumados por cada categoría de X
function agruparPorCategoria(idxX, idxY) {
  const mapa = {};
  datos.filas.forEach((f) => {
    const cat = f[idxX] || "(vacío)";
    const val = parseFloat(String(f[idxY]).replace(",", "."));
    if (!isNaN(val)) {
      mapa[cat] = (mapa[cat] || 0) + val;
    } else {
      // Si Y no es numérico, contar ocurrencias
      mapa[cat] = (mapa[cat] || 0) + 1;
    }
  });
  return mapa;
}

function opcionesBase(conEjes) {
  const base = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { font: { family: "'Spline Sans', sans-serif" }, color: "#14110f" },
      },
    },
  };
  if (conEjes) {
    base.scales = {
      x: { ticks: { color: "#8a8275" }, grid: { color: "#d8d0bf" } },
      y: { ticks: { color: "#8a8275" }, grid: { color: "#d8d0bf" } },
    };
  }
  return base;
}

// --- Exportar a PNG ---
btnExportar.addEventListener("click", () => {
  if (!grafica) return;
  // Fondo blanco para el PNG (el canvas es transparente por defecto)
  const canvas = document.getElementById("lienzo");
  const tmp = document.createElement("canvas");
  tmp.width = canvas.width;
  tmp.height = canvas.height;
  const ctx = tmp.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, tmp.width, tmp.height);
  ctx.drawImage(canvas, 0, 0);

  const enlace = document.createElement("a");
  enlace.download = "grafica.png";
  enlace.href = tmp.toDataURL("image/png");
  enlace.click();
});

// --- Vista previa de datos (primeras 20 filas) ---
function renderVistaPrevia() {
  const tabla = document.getElementById("tablaDatos");
  const thead = tabla.querySelector("thead");
  const tbody = tabla.querySelector("tbody");

  thead.innerHTML = "<tr>" + datos.encabezados.map((h) => `<th>${h}</th>`).join("") + "</tr>";
  tbody.innerHTML = "";

  datos.filas.slice(0, 20).forEach((f) => {
    tbody.innerHTML += "<tr>" + f.map((c) => `<td>${c || "—"}</td>`).join("") + "</tr>";
  });
}
