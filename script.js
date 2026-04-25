// Cargar los datos al iniciarse la página
let db;
let lista_estaciones = ["Aeroparque", "Anchorena REM", "Azul", "Azul Aero", "Bahía Blanca Aero", "Balcarce INTA", "Bariloche Aero", "Base Belgrano II", "Base Carlini", "Base Esperanza", "Base Marambio", "Base Orcadas", "Base San Martín", "Bella Vista INTA", "Benito Juárez Aero", "Bernardo de Irigoyen Aero", "Bolivar Aero", "Buenos Aires Observatorio Central", "Capayán IANIGLA", "Castelar INTA", "Catamarca Aero", "Catamarca Aero I", "Ceres Aero", "Cerro Azul INTA", "Chacras de Coria", "Chamical Aero", "Chapelco Aero", "Chepes", "Chilecito Aero", "Cipolletti", "Cipolletti I", "Comodoro Rivadavia Aero", "Concordia Aero", "Córdoba Aero", "Córdoba Observatorio", "Coronel Pringles Aero", "Coronel Suarez Aero", "Corrientes Aero", "Curuzú Cuatiá", "Desaguadero REM", "Dolores Aero", "Don Torcuato Aero", "El Bolsón Aero", "El Bolsón I", "El Calafate Aero", "El Palomar Aero", "El Trébol Aero", "Esquel Aero", "Ezeiza Aero", "Famaillá INTA", "Formosa Aero", "General Acha", "General Pico Aero", "General Pizarro EEAOC", "Gobernador Gregores Aero", "Gualeguaychú Aero", "Hilario Ascasubi INTA", "Iguazú Aero", "Ituzaingó", "Jáchal", "Jujuy Aero", "Jujuy UN", "Junin Aero", "La Consulta INTA", "La Plata Aero", "La Quiaca Observatorio", "La Rioja Aero", "La Tranca REM", "Laboulaye Aero", "Lago Argentino Aero", "Laprida", "Las Breñas INTA", "Las Flores", "Las Lomitas", "Malargüe", "Malargüe Aero", "Maquinchao", "Mar del Plata Aero", "Marcos Juárez Aero", "Mendoza Aero", "Mendoza Observatorio", "Mercedes Aero", "Mercedes INTA", "Metán", "Misión La Paz", "Monte Caseros Aero", "Morón Aero", "Neuquén Aero", "Nueve de Julio", "Oberá", "Olavarría Aero", "Orán Aero", "Paraná Aero", "Paso de Indios", "Paso de los Libres Aero", "Pcia Roque Saenz Peña Aero", "Pehuajó Aero", "Pergamino INTA", "Perito Moreno Aero", "Pigüé Aero", "Pilar Observatorio", "Posadas Aero", "Puerto Deseado Aero", "Puerto Madryn Aero", "Punta Indio B.A.", "Reconquista Aero", "Resistencia Aero", "Rincón de los Sauces SINARAME", "Rio Colorado", "Rio Cuarto Aero", "Rio Gallegos Aero", "Rio Grande B.A.", "Rivadavia", "Rosario Aero", "Salta Aero", "San Antonio Oeste Aero", "San Antonio Oeste I", "San Carlos Mza", "San Fernando Aero", "San Juan Aero", "San Juan Aero I", "San Julián Aero", "San Luis Aero", "San Martín Mza", "San Miguel", "San Pedro INTA", "San Rafael Aero", "Santa Ana EEAOC", "Santa Cruz Aero", "Santa Rosa Aero", "Santa Rosa del Conlara Aero", "Santiago del Estero Aero", "Sauce Viejo Aero", "Tandil Aero", "Tartagal Aero", "Tinogasta", "Trelew Aero", "Trenque Lauquen", "Tres Arroyos", "Tucumán Aero", "Tucumán Aero I", "Unión REM", "Ushuaia Aero", "Ushuaia Aero I", "Uspallata Aero", "Valle de Pancanta REM", "Venado Tuerto Aero", "Victorica", "Viedma Aero", "Villa de María del Río Seco", "Villa Dolores Aero", "Villa Gesell Aero", "Villa Reynolds Aero", "Villaguay Aero"];
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
    
    // 1. Limpiamos y ponemos el título
    principal.innerHTML = `<h2>${titulo}</h2>`;
    
    // 2. Creamos el contenedor de controles
    const contenedor = document.createElement('div');
    contenedor.style = "display: flex; flex-direction: column; gap: 10px; max-width: 300px;";

    // 3. Generamos cada control pedido
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
        } else {
            el = document.createElement('input');
            el.type = c.tipo;
            el.id = c.id;
            if (c.extra) Object.assign(el, c.extra);
        }
        
        label.appendChild(el);
        contenedor.appendChild(label);
    });

    // 4. Botón de acción
    const btn = document.createElement('button');
    btn.textContent = "Ver Tabla";
    btn.onclick = funcionCallback;
    contenedor.appendChild(btn);

    // 5. Agregamos todo al DOM
    principal.appendChild(contenedor);
    principal.appendChild(document.createElement('hr'));
    
    const zonaV = document.createElement('div');
    zonaV.id = "zona-visualizacion";
    principal.appendChild(zonaV);
}
/*
${fila.map(celda => {
    if (celda === null) return '<td>-</td>';
    
    let contenido = celda.toString();
    const tieneSalto = contenido.includes('|');
    
    if (tieneSalto) {
        contenido = contenido.split('|').join('<br>');
    }

    // Aplicamos vertical-align solo si detectamos que habrá varias líneas
    const estiloDinamico = tieneSalto 
        ? 'padding: 8px; vertical-align: top; line-height: 1.2;' 
        : 'padding: 4px 8px; vertical-align: middle;';

    return `<td style="${estiloDinamico}">${contenido}</td>`;
}).join('')}
*/

async function ejecuta_y_muestra(estacion, query, params = []) {
    const zona = document.getElementById('zona-visualizacion');
    zona.innerHTML = "<p>Cargando datos...</p>";

    try {
        const nombreArchivo = limpiarNombreArchivo(estacion) + ".db";
        const response = await fetch(`db_estaciones/${nombreArchivo}`);
        if (!response.ok) throw new Error("No se encontró la base de datos.");

        const ab = await response.arrayBuffer();
        const config = { locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` };
        const SQL = await initSqlJs(config);
        const db_estacion = new SQL.Database(new Uint8Array(ab));

        const stmt = db_estacion.prepare(query);
        stmt.bind(params);
        const filas = [];
        let columnas = [];
        let columnasCapturadas = false;
        while (stmt.step()) {
            if (!columnasCapturadas) {
        columnas = stmt.getColumnNames();
        columnasCapturadas = true; }
        filas.push(stmt.get());
        }

        if (filas.length > 0) {
            zona.innerHTML = `<table style="width:100%; border-collapse: collapse;" border="1">
            <thead style="background: #f4f4f4;">
                <tr>${columnas.map(col => `<th>${col}</th>`).join('')}</tr>
            </thead>
            <tbody>
                ${filas.map(fila => `
                    <tr>
                        ${fila.map(celda => {
                            if (celda === null) return '<td>-</td>';
                            
                            let contenido = celda.toString();
                            
                            if (contenido.includes('|')) {
                                contenido = contenido.split('|').join('<br>');
                            }
                            
                            return `<td style="padding: 8px; vertical-align: top;">${contenido}</td>`;
                        }).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
    } else {
            zona.innerHTML = "<p>No hay resultados para esta consulta.</p>";
        }
        stmt.free();
        db_estacion.close();
    } catch (err) {
        zona.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }
}   


// FUNCIONES PARTICULARES
// MARCHA DIARIA
function selec_marcha_diaria() {
    genera_interfaz("Marcha Diaria", [
        { label: "Estación", id: "selector_md", tipo: "select-estaciones" },
        { label: "Mes", id: "mes_marcha_diaria", tipo: "number", extra: { value: 1, min: 1, max: 12 } },
        { label: "Año", id: "anio_marcha_diaria", tipo: "number", extra: { value: 2025, min: 1961, max: 2026 } }
    ], verTablaDiaria); 
}

function verTablaDiaria() {
    const estacion = document.getElementById('selector_md').value;
    const mes = document.getElementById('mes_marcha_diaria').value;
    const anio = document.getElementById('anio_marcha_diaria').value;

    const sql = `SELECT * FROM weather WHERE M = ? AND A = ? ORDER BY D ASC`;
    
    ejecuta_y_muestra(estacion, sql, [mes, anio]);
}

// RECORDS
function selec_records() {
    genera_interfaz("Records", [
        { label: "Estación", id: "selector_records", tipo: "select-estaciones" },
        { label: "Año Inicio", id: "anio_records", tipo: "number", extra: { value: 1961, min: 1873, max: 2001 } }
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


