// Cargar los datos al iniciarse la página
let db;
let lista_estaciones = ["Aeroparque", "Anchorena REM", "Azul", "Azul Aero", "Bahía Blanca Aero", "Balcarce INTA", "Bariloche Aero", "Base Belgrano II", "Base Carlini", "Base Esperanza", "Base Marambio", "Base Orcadas", "Base San Martín", "Bella Vista INTA", "Benito Juárez Aero", "Bernardo de Irigoyen Aero", "Bolivar Aero", "Buenos Aires Observatorio Central", "Capayán IANIGLA", "Castelar INTA", "Catamarca Aero", "Catamarca Aero I", "Ceres Aero", "Cerro Azul INTA", "Chacras de Coria", "Chamical Aero", "Chapelco Aero", "Chepes", "Chilecito Aero", "Cipolletti", "Cipolletti I", "Comodoro Rivadavia Aero", "Concordia Aero", "Córdoba Aero", "Córdoba Observatorio", "Coronel Pringles Aero", "Coronel Suarez Aero", "Corrientes Aero", "Curuzú Cuatiá", "Desaguadero REM", "Dolores Aero", "Don Torcuato Aero", "El Bolsón Aero", "El Bolsón I", "El Calafate Aero", "El Palomar Aero", "El Trébol Aero", "Esquel Aero", "Ezeiza Aero", "Famaillá INTA", "Formosa Aero", "General Acha", "General Pico Aero", "General Pizarro EEAOC", "Gobernador Gregores Aero", "Gualeguaychú Aero", "Hilario Ascasubi INTA", "Iguazú Aero", "Ituzaingó", "Jáchal", "Jujuy Aero", "Jujuy UN", "Junin Aero", "La Consulta INTA", "La Plata Aero", "La Quiaca Observatorio", "La Rioja Aero", "La Tranca REM", "Laboulaye Aero", "Lago Argentino Aero", "Laprida", "Las Breñas INTA", "Las Flores", "Las Lomitas", "Malargüe", "Malargüe Aero", "Maquinchao", "Mar del Plata Aero", "Marcos Juárez Aero", "Mendoza Aero", "Mendoza Observatorio", "Mercedes Aero", "Mercedes INTA", "Metán", "Misión La Paz", "Monte Caseros Aero", "Morón Aero", "Neuquén Aero", "Nueve de Julio", "Oberá", "Olavarría Aero", "Orán Aero", "Paraná Aero", "Paso de Indios", "Paso de los Libres Aero", "Pcia Roque Saenz Peña Aero", "Pehuajó Aero", "Pergamino INTA", "Perito Moreno Aero", "Pigüé Aero", "Pilar Observatorio", "Posadas Aero", "Puerto Deseado Aero", "Puerto Madryn Aero", "Punta Indio B.A.", "Reconquista Aero", "Resistencia Aero", "Rincón de los Sauces SINARAME", "Rio Colorado", "Rio Cuarto Aero", "Rio Gallegos Aero", "Rio Grande B.A.", "Rivadavia", "Rosario Aero", "Salta Aero", "San Antonio Oeste Aero", "San Antonio Oeste I", "San Carlos Mza", "San Fernando Aero", "San Juan Aero", "San Juan Aero I", "San Julián Aero", "San Luis Aero", "San Martín Mza", "San Miguel", "San Pedro INTA", "San Rafael Aero", "Santa Ana EEAOC", "Santa Cruz Aero", "Santa Rosa Aero", "Santa Rosa del Conlara Aero", "Santiago del Estero Aero", "Sauce Viejo Aero", "Tandil Aero", "Tartagal Aero", "Tinogasta", "Trelew Aero", "Trenque Lauquen", "Tres Arroyos", "Tucumán Aero", "Tucumán Aero I", "Unión REM", "Ushuaia Aero", "Ushuaia Aero I", "Uspallata Aero", "Valle de Pancanta REM", "Venado Tuerto Aero", "Victorica", "Viedma Aero", "Villa de María del Río Seco", "Villa Dolores Aero", "Villa Gesell Aero", "Villa Reynolds Aero", "Villaguay Aero"];
let nombre_meses = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio","JUlio",
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


// Cambiar a marcha diaria
function selec_marcha_diaria() {
    const principal = document.getElementById('principal');
    
    principal.innerHTML = `
        <h2>Marcha Diaria</h2>
        <div style="display: flex; flex-direction: column; gap: 10px; max-width: 300px;">
            <label>Estación: <select id="selector_md"></select></label>
            <label>Mes: <input type="number" id="mes_marcha_diaria" value="1" min="1" max="12"></label>
            <label>Año: <input type="number" id="anio_marcha_diaria" value="2025" min="1961" max="2026"></label>
            <button onclick="verTabla()">Ver Tabla</button>
        </div>
        <hr>
        <div id="zona-visualizacion_md"></div>
    `;

    const select = document.getElementById('selector_md');
    lista_estaciones.forEach(nombre => {
        let opt = document.createElement('option');
        opt.value = nombre;
        opt.textContent = nombre;
        select.appendChild(opt);
    });
}

async function verTabla() {
    // 1. Capturamos los valores seleccionados por el usuario
    const estacion = document.getElementById('selector_md').value;
    const mes = document.getElementById('mes_marcha_diaria').value;
    const anio = document.getElementById('anio_marcha_diaria').value;
    const zona = document.getElementById('zona-visualizacion_md');

    try {

        const nombreArchivo = limpiarNombreArchivo(estacion) + ".db";
        const response = await fetch(`db_estaciones/${nombreArchivo}`);
        
        if (!response.ok) throw new Error("No se encontró el archivo de la estación.");

        const ab = await response.arrayBuffer();

        const config = { locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` };
        const SQL = await initSqlJs(config);
        const db_estacion = new SQL.Database(new Uint8Array(ab));

        // Consulta
        const query = `
            SELECT * FROM weather 
            WHERE M = ${mes} 
            AND A = ${anio}
            ORDER BY D ASC`;

        const resultado = db_estacion.exec(query);

        if (resultado.length > 0) {
            const columnas = resultado[0].columns;
            const filas = resultado[0].values;

            let tablaHTML = `
                <table style="width:100%; border-collapse: collapse; margin-top: 10px;" border="1">
                    <thead style="background: #f4f4f4;">
                        <tr>${columnas.map(col => `<th>${col}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                        ${filas.map(fila => `
                            <tr>${fila.map(celda => `<td>${celda !== null ? celda : '-'}</td>`).join('')}</tr>
                        `).join('')}
                    </tbody>
                </table>`;

                 zona.innerHTML = tablaHTML;
        } else {
            zona.innerHTML = "<p>No se encontraron datos para ese mes y año.</p>";
        }

    } catch (err) {
        console.error(err);
        zona.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }

}





    

    


