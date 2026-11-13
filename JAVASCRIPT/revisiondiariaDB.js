let habitosGlobal = [];

const hoy = new Date()
const fechaCL = hoy.toLocaleDateString('es-CL');

const contFechahoy = document.querySelector('.fecha-hoy')

contFechahoy.innerHTML = `<h2>Hoy es: </h2><span>${fechaCL}</span>`



function agregarFilaTabla(habito) {
    const tabla_hoy = document.querySelector('.tabla-diaria');
    let strHtmlUnidad = '';

    // Normalizamos a minúsculas para que detecte tanto "Dias"/"dias" como "Horas"/"horas"
    const unidadStr = (habito.unidad || "").toLowerCase();

    if (unidadStr === "dias" || unidadStr === "día") {
        strHtmlUnidad = `<td class="checkbox-habito"><span>Sí</span><input type="checkbox"></td>`;
    }
    else if (unidadStr === "horas" || unidadStr === "hora") {
        strHtmlUnidad = `<td class="number-habito"><input type="number" step="0.1"><span>horas</span></td>`;
    }
    else {
        strHtmlUnidad = `<td></td>`;
    }

    let txtDiario = '';
    if (unidadStr === 'horas' || unidadStr === 'hora') {
        txtDiario = (habito.metDia == 1) ? 'hora' : 'horas';
    } else {
        txtDiario = '';
    }

    const row = document.createElement('tr');
    row.className = 'fila-habito';
    row.dataset.habito = habito.data.habito;
    row.dataset.tipo = habito.data.tipo;
    row.dataset.metDia = habito.metDia;
    row.dataset.unidad = habito.unidad;

    // Resguardo por si la propiedad del porcentaje cambia de nombre
    const porcSemanal = habito.pila_semanal ?? habito.porcSemHabito ?? 0;

    row.innerHTML = `
        <td>${habito.data.habito}</td>
        <td>${habito.data.tipo}</td>
        <td>${habito.metDia}<span> ${txtDiario}</span></td>
        ${strHtmlUnidad}
        <td>${porcSemanal}</td>
    `;

    tabla_hoy.appendChild(row);
}


function cargarDatos() {
    // 1. Intentamos buscar si ya existe un registro guardado para hoy en MongoDB
    fetch(`http://127.0.0.1:8000/diario/fecha/${fechaCL}`)
        .then((response) => {
            if (!response.ok) {
                // Si devuelve 404 (no hay registro), lanzamos error para ir al bloque catch y cargar los hábitos normales
                throw new Error("No hay registro para hoy");
            }
            return response.json();
        })
        .then((diarioGuardado) => {
            // CASO A: ¡Ya existe un diario guardado hoy!
            console.log("Diario encontrado para hoy:", diarioGuardado);

            // Recorremos directamente los hábitos guardados en el registro diario
            diarioGuardado.habitosRealizados.forEach(item => {
                const tabla_hoy = document.querySelector('.tabla-diaria');
                const row = document.createElement('tr');
                row.className = 'fila-habito';
                row.dataset.habito = item.data.habito;
                row.dataset.tipo = item.data.tipo;
                row.dataset.metDia = item.metDia;
                row.dataset.unidad = item.unidad;
                row.dataset.realizado = item.realizado;

                let txtDiario = '';
                const unidadStr = (item.unidad || "").toLowerCase();

                if (unidadStr === 'horas') {
                    txtDiario = (Number(item.metDia) === 1) ? ' hora' : ' horas';
                } else {
                    txtDiario = '';
                }

                let valorTexto = '';
                if (typeof item.realizado === 'boolean') {
                    valorTexto = item.realizado ? '✅ Sí' : '❌ No';
                } else {
                    valorTexto = `${item.realizado} horas`;
                }

                row.innerHTML = `
        <td>${item.data.habito}</td>
        <td>${item.data.tipo}</td>
        <td>${item.metDia} ${txtDiario}</td>
        <td class="checkbox-habito"><span class="textoLectura">${valorTexto}</span></td>
        <td>${item.porcSemHabito}</td>
    `;
                tabla_hoy.appendChild(row);
            });

            // Congelamos de inmediato la tabla y guardamos el estado local
            congelarTabla(); // O tu función de congelar
            localStorage.setItem('habitosGuardados', 'true');
            localStorage.setItem('fechaGuardado', fechaCL);
        })
        .catch(() => {
            // CASO B: No hay registro hoy (devuelve 404), aquí SÍ cargamos la lista maestra (/habitos)
            fetch('http://127.0.0.1:8000/habitos')
                .then((response) => response.json())
                .then((habitos) => {
                    habitosGlobal = habitos;
                    habitos.forEach(habito => {
                        agregarFilaTabla(habito); // Aquí sí usamos tu función original con inputs
                    });
                    localStorage.removeItem('habitosGuardados');
                    localStorage.removeItem('fechaGuardado');
                })
                .catch((error) => console.error("Error al cargar hábitos base:", error));
        });
}

// --- BLOQUE ÚNICO DE INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', function () {
    const estaGuardado = localStorage.getItem('habitosGuardados');
    const fechaGuardado = localStorage.getItem('fechaGuardado');

    // Si está guardado Y la fecha guardada es exactamente igual a la de hoy
    if (estaGuardado === 'true' && fechaGuardado === fechaCL) {
        guardarHabitos.style.display = 'none';
        modificarHabitos.style.display = 'flex';
        congelarTabla();
    } else {
        // Si es un nuevo día o no hay registro, limpiamos y dejamos visible el guardado
        localStorage.removeItem('habitosGuardados');
        localStorage.removeItem('fechaGuardado');
        modificarHabitos.style.display = 'none';
        guardarHabitos.style.display = 'flex';
    }

    cargarDatos();
});

const filter = document.querySelectorAll('.botones-filtros-tabla button')
console.log(filter)

filter.forEach(boton => {

    boton.addEventListener('click', function () {

        console.log(boton)
        const filas = tabla_hoy.querySelectorAll('.fila-habito');

        // Al usar 'this.value' o boton.value, capturamos el valor exacto del botón que recibió el clic
        const selectedValue = boton.value;
        console.log(selectedValue)

        filas.forEach(fila => {

            const tipo = fila.getAttribute('data-tipo')

            const isShow = selectedValue === '' || selectedValue === tipo
            fila.classList.toggle('is-hidden', isShow === false)


        })
    })

})

const buscador = document.querySelector('#search-habito');
const btnBuscar = document.querySelector('#btn-buscar');

btnBuscar.addEventListener('click', function (evento) {



    evento.preventDefault();


    const texto = buscador.value.trim();
    console.log(texto)

    const filas = document.querySelectorAll('.tabla-diaria .fila-habito')

    filas.forEach(fila => {

        const habito = fila.getAttribute('data-habito').toLowerCase();

        if (!habito.includes(texto.toLowerCase())) {
            fila.style.display = 'none'

        }

        else {
            fila.style.display = ''
        }


    });



})

const guardarHabitos = document.querySelector('.guardar-habitos')
const deshacerGuardado = document.querySelector('.deshacer-guardado')


function congelarTabla() {

    guardarHabitos.style.display = 'none';
    deshacerGuardado.style.display = 'flex';

    const filas = document.querySelectorAll('.fila-habito');

    filas.forEach(fila => {
        const input = fila.querySelector('input')

        if (input) {
            let valorTexto = '';

            if (input.type === 'checkbox') {
                valorTexto = input.checked ? '✅ Sí' : '❌ No';
            }
            else if (input.type === 'number') {
                valorTexto = input.value ? `${input.value} horas` : '0 horas';
            }

            //conservamos el valor original
            if (input.type === 'checkbox') {
                fila.dataset.realizado = String(input.checked);
            } else {
                fila.dataset.realizado = input.value;
            }

            const originSpan = input.parentElement.querySelector('span')

            if (originSpan) {
                originSpan.style.display = 'none'
            }

            const spanTexto = document.createElement('span')

            spanTexto.className = 'textoLectura';
            spanTexto.textContent = valorTexto;

            input.style.display = 'none';

            input.parentElement.appendChild(spanTexto)



        };

    })


}



const modificarHabitos = document.querySelector('.modificar-habitos')
modificarHabitos.style.display = 'none'



guardarHabitos.addEventListener('click', function (evento) {
    evento.preventDefault();

    const filas = document.querySelectorAll('.fila-habito');
    const listaHabitosRegistrados = [];

    filas.forEach(fila => {
        const nombreHabito = fila.dataset.habito;
        const tipoHabito = fila.dataset.tipo;
        const metDia = fila.dataset.metDia;       // <--- Unificado a metDia
        const unidad = fila.dataset.unidad;       // <--- Unificado a unidad
        const input = fila.querySelector('input');

        let realizadoValor;
        if (input) {
            if (input.type === 'checkbox') {
                realizadoValor = input.checked; // true o false
            } else if (input.type === 'number') {
                realizadoValor = input.value ? parseFloat(input.value) : 0;
            }
        }

        // Objeto alineado con tu Pydantic refactorizado
        listaHabitosRegistrados.push({
            data: {
                habito: nombreHabito,
                tipo: tipoHabito
            },
            metDia: String(metDia),     // <--- Enviado como metDia
            unidad: unidad,             // <--- Enviado como unidad
            realizado: realizadoValor,
            porcSemHabito: 0.0
        });
    });

    const datosDiario = {
        fechaReg: fechaCL,
        habitosRealizados: listaHabitosRegistrados
    };

    fetch('http://127.0.0.1:8000/diario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosDiario)
    })
        .then(async (response) => {
            if (!response.ok) {
                const errorDetalle = await response.json();
                console.error("Detalle del error 422 de Pydantic:", errorDetalle);
                throw new Error("Error al guardar el registro en el servidor");
            }
            return response.json();
        })
        .then((resultado) => {
            modificarHabitos.style.display = 'flex'
            congelarTabla();
            localStorage.setItem('habitosGuardados', 'true');
            localStorage.setItem('fechaGuardado', fechaCL);
            console.log("¡Día guardado con éxito en MongoDB!", resultado);
        })
        .catch((error) => {
            console.error("Error:", error.message);
            alert(error.message);
        });
});




deshacerGuardado.addEventListener('click', function (evento) {
    evento.preventDefault();


    // Aquí puedes invocar un DELETE a tu API en FastAPI si ya existía en la DB
    fetch(`http://127.0.0.1:8000/diario/fecha/${fechaCL}`, {
        method: 'DELETE'
    }).then(response => {
        if (!response.ok) {
            throw new Error("Error al eliminar el registro")
        }
    }).then(() => {

        // Limpiamos el almacenamiento local
        localStorage.removeItem('habitosGuardados');
        localStorage.removeItem('fechaGuardado');

        // Limpiamos por completo la tabla visualmente
        const tabla_hoy = document.querySelector('.tabla-diaria');
        tabla_hoy.innerHTML = '';

        // Restablecemos la visibilidad de los botones
        deshacerGuardado.style.display = 'none';
        modificarHabitos.style.display = 'none';
        guardarHabitos.style.display = 'flex';

        // Volvemos a cargar la lista maestra de hábitos con sus inputs limpios y activos
        cargarDatos();
    }).catch(error => {
        console.error("Error:", error.message);
        alert("No se pudo deshacer el guardado en el servidor.");
    }
    )


});


const guardarCambios = document.querySelector('.guardar-cambios')

guardarCambios.style.display = 'none'

modificarHabitos.addEventListener('click', function (evento) {
    evento.preventDefault();

    const filas = document.querySelectorAll('.fila-habito');

    filas.forEach(fila => {
        // Buscamos la celda donde está el control (sea checkbox o número)
        const celdaControl = fila.querySelector('.checkbox-habito') || fila.querySelector('.number-habito') || fila.querySelectorAll('td')[3];

        if (!celdaControl) return;

        // Recuperamos los datos que guardamos en los dataset de la fila
        const unidadStr = (fila.dataset.unidad || "").toLowerCase();
        const metDia = fila.dataset.metDia;

        // Buscamos si ya existe el span de texto de lectura para extraer su valor actual si lo hubiera
        const spanTexto = celdaControl.querySelector('.textoLectura');

        let valorActual = fila.dataset.realizado;

        if (unidadStr.includes('hora')) {
            valorActual = Number(valorActual);
        } else {
            valorActual = valorActual === 'true';
        }

        if (spanTexto) {
            spanTexto.remove();
        }
        // Reconstruimos el input interactivo exacto según la unidad del hábito
        // Reconstruimos el input interactivo exacto según la unidad del hábito
        let htmlInput = '';
        if (unidadStr === "dias" || unidadStr === "día") {
            const isChecked = valorActual === true ? 'checked' : '';
            htmlInput = `<span>Sí</span><input type="checkbox" ${isChecked}>`;
        }
        else if (unidadStr === "horas" || unidadStr === "hora") {
            // Nos aseguramos de limpiar cualquier texto y dejar solo el número puro
            const numPuro = String(valorActual).replace(/[^\d.]/g, '').trim();
            htmlInput = `<input type="number" step="0.1" value="${numPuro}"><span>horas</span>`;
        }

        celdaControl.innerHTML = htmlInput;



    });

    // Alternamos la visibilidad de los botones de acción
    modificarHabitos.style.display = 'none';
    guardarCambios.style.display = 'flex';
    deshacerGuardado.style.display = 'none'
});



guardarCambios.addEventListener('click', function (evento) {
    evento.preventDefault();

    const filas = document.querySelectorAll('.fila-habito');
    const listaHabitosActualizados = [];

    // Recorremos las filas para capturar los nuevos valores que el usuario editó
    filas.forEach(fila => {
        const nombreHabito = fila.dataset.habito;
        const tipoHabito = fila.dataset.tipo;
        const metDia = fila.dataset.metDia;
        const unidad = fila.dataset.unidad;
        const input = fila.querySelector('input');

        let realizadoValor = false;
        if (input) {
            if (input.type === 'checkbox') {
                realizadoValor = input.checked;
            } else if (input.type === 'number') {
                realizadoValor = input.value ? parseFloat(input.value) : 0;
            }
        }

        listaHabitosActualizados.push({
            data: {
                habito: nombreHabito,
                tipo: tipoHabito
            },
            metDia: String(metDia),
            unidad: unidad,
            realizado: realizadoValor,
            porcSemHabito: 0.0
        });
    });

    const datosActualizados = {
        fechaReg: fechaCL,
        habitosRealizados: listaHabitosActualizados
    };

    // Petición PUT enviando el JSON actualizado al backend
    fetch(`http://127.0.0.1:8000/diario/fecha/${fechaCL}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados)
    })
        .then(async (response) => {
            if (!response.ok) {
                const errorDetalle = await response.json();
                console.error("Detalle del error al modificar:", errorDetalle);
                throw new Error("Error al modificar el registro");
            }
            return response.json();
        })
        .then(() => {
            guardarCambios.style.display = 'none';
            modificarHabitos.style.display = 'flex';
            // Limpiamos la tabla visualmente y volvemos a cargar los datos actualizados del servidor
            const tabla_hoy = document.querySelector('.tabla-diaria');
            tabla_hoy.innerHTML = ''; // Limpiamos las filas viejas
            cargarDatos();            // Volvemos a renderizar en modo lectura/congelado
            console.log("¡Registro modificado con éxito!");
        })
        .catch(error => {
            console.error("Error:", error.message);
            alert("No se pudo modificar el registro diario en el servidor.");
        });
});
