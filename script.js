// Cargar los datos al iniciarse la página
let db;
let lista_estaciones = [
    "Aeroparque","Azul Aero","Bahía Blanca Aero","Bariloche Aero","Benito Juárez Aero","Bernardo de Irigoyen Aero","Bolívar Aero",
    "Catamarca Aero","Ceres Aero","Chamical Aero","Chapelco Aero","Comodoro Rivadavia Aero",
    "Concordia Aero","Córdoba Aero","Córdoba Observatorio","Coronel Suárez Aero","Corrientes Aero","Dolores Aero",
    "El Calafate Aero","El Bolsón Aero","Esquel Aero","Formosa Aero","General Pico Aero",
    "Gualeguaychú Aero","Iguazú Aero","Jujuy Aero","Junín Aero",
    "Laboulaye Aero","La Quiaca Observatorio","La Plata Aero","La Rioja Aero","Las Flores","Las Lomitas",
    "Malargüe Aero","Maquinchao","Marcos Juárez Aero","Mar del Plata Aero","Mendoza Aero","Monte Caseros Aero","Neuquén Aero",
    "Orán Aero","Paraná Aero","Paso de los Libres Aero","Pcia Roque Saenz Peña Aero","Perito Moreno Aero",
    "Pilar Observatorio","Posadas Aero","Puerto Deseado Aero",
    "Reconquista Aero","Resistencia Aero","Rio Cuarto Aero","Rio Gallegos Aero","Rio Grande B.A.","Rosario Aero",
    "Salta Aero","San Antonio Oeste","San Juan Aero","San Julián Aero","San Luis Aero","San Martín Mza","San Rafael Aero",
    "Santa Rosa Aero","Santiago del Estero Aero","Sauce Viejo Aero","Tandil Aero",
    "Tartagal Aero","Trelew Aero","Tres Arroyos","Tucumán Aero","Ushuaia Aero",
    "Viedma Aero","Villa de María del Rio Seco","Villa Dolores","Villa Reynolds"]
let nombre_meses = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio",
    "Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

// Utilidad
function limpiarNombreArchivo(nombre) {
    return nombre
        .normalize("NFD")                    // Separa las tildes de las letras (á -> a + ´)
        .replace(/[\u0300-\u036f]/g, "")     // Borra las tildes
        .replace(/[^a-zA-Z0-9]/g, "_")       // Cambia espacios, guiones y puntos por "_"
        .replace(/_+/g, "_")                 // Si quedan varios "_" juntos, los vuelve uno solo
        .toUpperCase();                      // Todo a mayúsculas
}

// FUNCIONES GENÉRICAS
function genera_interfaz(titulo, controles, funcionCallback) {
    const principal = document.getElementById('principal');
    
    // Título
    principal.innerHTML = `<h2>${titulo}</h2>`;
    
    // Contenedor de controles
    const contenedor = document.createElement('div');
    contenedor.className = "panel-controles";

    // Generamos cada control pedido
    controles.forEach(c => {
        const label = document.createElement('label');
        label.textContent = `${c.label}: `;
        
        let el;
        if (c.tipo === 'select-estaciones') {
            el = document.createElement('select');
            el.id = c.id;
            lista_estaciones.forEach(est => {
                let opt = document.createElement('option');
                opt.value = est;
                opt.textContent = est;
                el.appendChild(opt);
            });
        } else if (c.tipo === 'select') {
            el = document.createElement('select');
            el.id = c.id;
            c.opciones.forEach(op => {
                let opt = document.createElement('option');
                opt.value = op.value;
                opt.textContent = op.text;
                if (c.default && op.value === c.default) {opt.selected = true;}
                el.appendChild(opt);
            });
        } else {
            el = document.createElement('input');
            el.type = c.tipo;
            el.id = c.id;
            if (c.extra) Object.assign(el, c.extra);
        }
        
        label.appendChild(el);
        contenedor.appendChild(label);
    });

    // Botón de acción
    const btn = document.createElement('button');
    btn.textContent = "OK";
    btn.onclick = funcionCallback;
    contenedor.appendChild(btn);

    // Agregar todo al DOM
    principal.appendChild(contenedor);
    principal.appendChild(document.createElement('hr'));
    
    const zonaV = document.createElement('div');
    zonaV.id = "zona-visualizacion";
    principal.appendChild(zonaV);
}

async function ejecuta_y_muestra(estacion, query, params = []) {
    const zona = document.getElementById('zona-visualizacion');
    zona.innerHTML = "<p>Cargando datos...</p>";

    // Diccionario para renombrar encabezados
    const nombresHeaders = {
        "wmo_id": "ESTACION",
        "Fecha_local": "Fecha y hora local",
        "Estado_del_tiempo": "Estado del tiempo",
        "Visibilidad": "Visibilidad [m]",
        "Temp_aire": "Temperatura [°C]",
        "Pto_rocio": "Punto de rocío [°C]",
        "Hum_rel": "Humedad relativa [%]",
        "Viento": "Viento [km/h]",
        "Pres_est": "Presión [hPa]",
        "PNMM_AG": "Presión al nivel del mar [hPa] o Altura geopotencial [mgp]",
        "Temp_max": "Tmax [°C]",
        "Hora_Tmax": "Hora",
        "Temp_min": "Tmin [°C]",
        "Hora_Tmin": "Hora",
        "Tmin_5cm_suelo": "Tmin 5 cm suelo [°C]",
        "Prof_nieve": "Prof. nieve [cm]",
        "Evaporacion": "Evap. [mm]",
        "Heliofania": "Heliofania [horas]",
        "Prec_semanal": "Prec. semanal [mm]"
    };

    try {
        const nombreArchivo = limpiarNombreArchivo(estacion) + ".db";
        const response = await fetch(`db_estaciones/${nombreArchivo}`);
        if (!response.ok) throw new Error("Base de datos no encontrada");

        const ab = await response.arrayBuffer();
        const config = { locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` };
        const SQL = await initSqlJs(config);
        const db_estacion = new SQL.Database(new Uint8Array(ab));

        const stmt = db_estacion.prepare(query);
        stmt.bind(params);
        
        const filas = [];
        let columnas = [];
        while (stmt.step()) {
            if (columnas.length === 0) columnas = stmt.getColumnNames();
            filas.push(stmt.get());
        }

        if (filas.length > 0) {

            const columnasOcultas = ["wmo_id"];
            const columnasVisibles = columnas.filter(col => !columnasOcultas.includes(col));

            let tablaHTML = `
            <style>
                .tabla-clima { 
                    width: 100%; border-collapse: collapse; 
                    border: 1px solid black !important; font-family: Arial, sans-serif;
                }
                .tabla-clima th { 
                    background-color: #8dbedb !important; border: 1px solid black !important; 
                    padding: 4px; text-align: center; font-weight: bold; font-size: 12px;
                }
                .tabla-clima td { 
                    border: 1px solid black !important; padding: 1px; 
                    text-align: center; font-size: 13px; color: black;
                }
                /* Columna Fecha y Hora */
                .tabla-clima td:nth-child(1) { 
                    background-color: #8dbedb !important; font-weight: bold;
                }
            </style>
            <table class="tabla-clima"><thead><tr>`;
            
            // Generar encabezados renombrados
            columnasVisibles.forEach(col => {
                const nombreVisible = nombresHeaders[col] || col.replace(/_/g, ' ');
                tablaHTML += `<th>${nombreVisible}</th>`;
            });

            tablaHTML += `</tr></thead><tbody>`;

            // Generar filas
            filas.forEach(fila => {
                tablaHTML += `<tr>`;
                columnas.forEach((col, idx) => {
                    if (columnasOcultas.includes(col)) return;

                        let celda = fila[idx];
                        let contenido = (celda === null || celda === undefined) ? "-" : celda;

                        if (col === "Fecha_local" && contenido !== "-") {
                            let partes = contenido.toString().split(' ');
                            let fecha = partes[0];
                            let horaFull = partes[1] || "00:00:00"; 
                            let horaFormateada = horaFull.substring(0, 2) + " h";
                            contenido = `${fecha}<br>${horaFormateada}`;
                        }
            tablaHTML += `<td>${contenido}</td>`;
        });
        tablaHTML += `</tr>`;
    });

            tablaHTML += `</tbody></table>`;
            zona.innerHTML = tablaHTML;
        } else {
            zona.innerHTML = "<p>No hay datos registrados para este período.</p>";
        }
        
        stmt.free();
        db_estacion.close();
    } catch (err) {
        zona.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }
}

// FUNCIONES PARTICULARES
// MARCHA HORARIA
function selec_marcha_diaria() {
    genera_interfaz("Marcha Horaria", [
        { label: "Estación", id: "selector_md", tipo: "select-estaciones" },
        { label: "Mes", id: "mes_marcha_diaria", tipo: "select", opciones: nombre_meses.map((mes, index) => ({value: index + 1, text: mes})) },
        { label: "Año", id: "anio_marcha_diaria", tipo: "select",
            opciones: Array.from({ length: 2026 - 1999 + 1 }, (_, i) => { const anio = 1999 + i; return { value: anio, text: anio };}).reverse(),
            default: 2026 },
    ], verTablaDiaria); 
}

function verTablaDiaria() {
    const estacion = document.getElementById('selector_md').value;
    const mes = document.getElementById('mes_marcha_diaria').value.padStart(2, '0');
    const anio = document.getElementById('anio_marcha_diaria').value;

    const filtroFecha = `${anio}-${mes}%`; 
    const sql = `SELECT * FROM reportes WHERE Fecha_local LIKE ? ORDER BY Fecha_local ASC`;
    
    ejecuta_y_muestra(estacion, sql, [filtroFecha]);
}

/*
// RECORDS
function selec_records() {
    genera_interfaz("Records", [
        { label: "Estación", id: "selector_records", tipo: "select-estaciones" },
        { label: "Año Inicio", id: "anio_records", tipo: "select",
            opciones: Array.from({ length: 2001 - 1873 + 1 }, (_, i) => { const anio = 1873 + i; return { value: anio, text: anio };}).reverse(),
            default: 1961 },
    ], verRecords); 
}

function verRecords() {
    const estacion = document.getElementById('selector_records').value;
    const anio = document.getElementById('anio_records').value || 1873;

    const sql = `
    WITH Extremos AS (
        SELECT  M,
        MIN(Tmin) as Tnn, 
        MIN(Tmax) as Txn, 
        MAX(Tmin) as Tnx, 
        MAX(Tmax) as Txx
    FROM weather
    WHERE A >= ?
    GROUP BY M
    )
    
    SELECT 
        E.M, 
        E.Tnn, 
        (SELECT GROUP_CONCAT(A || '-' || printf('%02d', M) || '-' || printf('%02d', D), '|') 
        FROM weather WHERE M = E.M AND Tmin = E.Tnn AND A >= ?) as Fecha_Tnn,
        E.Txn,
        (SELECT GROUP_CONCAT(A || '-' || printf('%02d', M) || '-' || printf('%02d', D), '|')
        FROM weather WHERE M = E.M AND Tmax = E.Txn AND A >= ?) as Fecha_Txn,        
        E.Tnx,
        (SELECT GROUP_CONCAT(A || '-' || printf('%02d', M) || '-' || printf('%02d', D), '|')
        FROM weather WHERE M = E.M AND Tmin = E.Tnx AND A >= ?) as Fecha_Tnx,       
        E.Txx,
        (SELECT GROUP_CONCAT(A || '-' || printf('%02d', M) || '-' || printf('%02d', D), '|')
        FROM weather WHERE M = E.M AND Tmax = E.Txx AND A >= ?) as Fecha_Txx    
        FROM Extremos E 
        ORDER BY E.M`;
    
    ejecuta_y_muestra(estacion, sql, [anio, anio, anio, anio, anio]);
}
*/

