// Cargar los datos al iniciarse la página
let db;
let lista_estaciones = [];
let nombre_meses = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio","JUlio",
    "Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

async function conectar() {
        const status = document.getElementById('status');
        const select = document.getElementById('selector');
        const info = document.getElementById('info');

        try {
            const config = { 
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` 
            };
            const SQL = await initSqlJs(config);

            const response = await fetch('datos.db');
            
            if (!response.ok) {
                throw new Error("No se encontró el archivo datos.db. ¿Está en la misma carpeta?");
            }
            
            const ab = await response.arrayBuffer();
            db = new SQL.Database(new Uint8Array(ab));
            
            // Consulta simple para traer los nombres de las estaciones
            const estaciones = db.exec("SELECT DISTINCT Estacion FROM weather ORDER BY Estacion");

            lista_estaciones= estaciones[0].values;

        } catch (err) {
            console.error(err);
            status.innerText = "Error: " + err.message;
            info.innerText = "Hubo un problema al cargar los datos. Revisa la consola (F12).";
        }
    }

    // Ejecutar la función apenas cargue la página
    window.onload = conectar;

// Cambiar a marcha diaria
function selec_marcha_diaria() {

    const principal = document.getElementById('principal');

    // Define HTML e inyecta contenido
    const controles = `
        <h2>Marcha Diaria</h2>
        <div style="display: flex; flex-direction: column; gap: 10px; max-width: 300px;">
            <label>Estación: 
                <select id="selector"><option></option></select>
            </label>
            <label>Mes: <input type="number" id="mes_marcha_diaria", value="1" min="1" max="12"></label>
            <label>Año: <input type="number" id="anio_marcha_diaria" value="2025" min="1961" max="2025"></label>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="verGrafico()">Ver Gráfico</button>
                <button onclick="verTabla()">Ver Tabla</button>
            </div>
        </div>
        <hr>
        <div id="zona-visualizacion">
            <!-- Aquí se dibujará la tabla o el gráfico después -->
        </div>
    `;

    principal.innerHTML = controles;

    // Opciones para estaciones
    const select = document.getElementById('selector');
    select.innerHTML = "";
    lista_estaciones.forEach(row => {
        let opt = document.createElement('option');
        opt.value = row[0];
        opt.textContent = row[0];
        select.appendChild(opt);
    });

}

// Funciones para los nuevos botones inyectados
/*
function verGrafico() {
    document.getElementById('zona-visualizacion').innerHTML = "<p>📊 Aquí iría el gráfico...</p>";
}
*/

function verTabla() {
    // 1. Capturamos los valores seleccionados por el usuario
    const estacion = document.getElementById('selector').value;
    const mes = document.getElementById('mes_marcha_diaria').value;
    const anio = document.getElementById('anio_marcha_diaria').value;
    const zona = document.getElementById('zona-visualizacion');

    // Validamos que la base de datos esté cargada
    if (!db) {
        zona.innerHTML = "<p style='color:red;'>Error: La base de datos no está lista.</p>";
        return;
    }

    try {
        // 2. Armamos la consulta SQL (Asegurate que los nombres de columnas coincidan con tu DB)
        // Usamos WHERE para filtrar por los tres campos
        const query = `
            SELECT * FROM weather 
            WHERE Estacion = '${estacion}' 
            AND M = ${mes} 
            AND A = ${anio}
            ORDER BY D ASC`;

        const resultado = db.exec(query);

        // 3. Verificamos si hay datos
        if (resultado.length === 0 || resultado[0].values.length === 0) {
            zona.innerHTML = "<p>No se encontraron datos para esa búsqueda.</p>";
            return;
        }

        // 4. Construimos la tabla HTML
        const columnas = resultado[0].columns;
        const filas = resultado[0].values;

        let tablaHTML = `
            <table border="1" style="width:100%; border-collapse: collapse; margin-top: 20px;">
                <thead style="background-color: #eee;">
                    <tr>
                        ${columnas.map(col => `<th>${col}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${filas.map(fila => `
                        <tr>
                            ${fila.map(celda => `<td>${celda !== null ? celda : '-'}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;

        // 5. Inyectamos la tabla en la zona de visualización
        zona.innerHTML = tablaHTML;

    } catch (err) {
        console.error(err);
        zona.innerHTML = "<p style='color:red;'>Error en la consulta: " + err.message + "</p>";
    }
}





    

    


