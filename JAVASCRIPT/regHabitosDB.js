let habitosGlobal = [];

const fechaCL = new Date().toLocaleDateString('es-CL');
const tabla_habitos = document.querySelector('.tabla-habitos')


function agregarFilaTabla(habito) {


    let txtBase = '';
    let txtSemanal = '';
    let txtDiario = '';

    const unidadStr = habito.unidad.toLowerCase();


    if (unidadStr === 'horas') {
        txtBase = 'horas';
        txtSemanal = 'horas a la semana';

        // Operador ternario: si la meta es exactamente 1, decimos "hora", si no, "horas"
        txtDiario = (habito.metDia == 1) ? 'hora' : 'horas';

    } else if (unidadStr === 'días' || unidadStr === 'dias') {
        txtBase = 'días';
        txtSemanal = 'días a la semana';

        // Como las metas diarias por días suelen ser textos puros (ej: "Dentro del día" o "No hacerlo hoy"),
        // dejamos el sufijo vacío para que no diga "Dentro del día días".
        txtDiario = '';

    }


    const row = document.createElement('tr')

    row.className = 'fila-habito'
    row.dataset.habito = habito.data.habito
    row.dataset.tipo = habito.data.tipo

    row.innerHTML = `
                <td>${habito.idHabito}</td>
                <td>${habito.data.habito}</td>
                <td>${habito.data.tipo}</td>
                <td>${habito.unidad}</td>
                <td>${habito.sitBase} <span>${txtBase}</span></td>
                <td>${habito.metSem} <span>${txtSemanal}</span></td>
                <td>${habito.metDia} <span>${txtDiario}</span></td>
                <td>${habito.fechaReg}</td>
                <td>${habito.activo}</td>
                <td><button class="btn-editar" data-id="${habito.idHabito}">Editar</button>
                    <button class="btn-eliminar" data-id="${habito.idHabito}">Eliminar</button>
                </td>
                
    `;

    tabla_habitos.appendChild(row);
}

const filter = document.querySelectorAll('.botones-filtros-tabla button')
console.log(filter)

filter.forEach(boton => {

    boton.addEventListener('click', function () {

        console.log(boton)
        const filas = tabla_habitos.querySelectorAll('.fila-habito');

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


function cargarDatos() {
    fetch('http://127.0.0.1:8000/habitos').then((response) => {
        if (!response.ok) {
            throw new Error("Error al obtener los hábitos desde la API");
        }
        return response.json();

    }).then((habitos) => {
    
        console.log("Datos recibidos desde FastAPI:", habitos);

    habitosGlobal = habitos;
    tabla_habitos.innerHTML = "";

    habitos.forEach(habito => {
        agregarFilaTabla(habito);
    });
}).catch((error) => {
        // Capturamos cualquier error de red o el throw new Error de arriba
        console.error("Hubo un problema con la petición fetch:", error);
    });;
}

cargarDatos();







const formRegistrar = document.getElementById('registro-dialog')

console.log(formRegistrar)

formRegistrar.addEventListener("submit", function (event) {
    event.preventDefault();


    const unidadform = document.getElementById('unidad').value
    const tipoForm = document.getElementById('tipo').value

    let metDiariaForm = ''
    let sitBaseForm = ''
    let metSemanalForm = ''


    if (unidadform === 'Horas') {
        metDiariaForm = document.getElementById('metDiaria').value
        sitBaseForm = document.getElementById('sitBase_hora').value
        metSemanalForm = document.getElementById('metSemanal_hora').value
    }
    else if (unidadform === 'Dias') {

        sitBaseForm = document.getElementById('sitBase_dia').value
        metSemanalForm = document.getElementById('metSemanal_dia').value

        if (tipoForm === 'Positivo') {
            metDiariaForm = 'Dentro del dia'



        }
        else if (tipoForm === 'Negativo') {
            metDiariaForm = 'No hacerlo hoy'
        }

    }
    else {
        metDiariaForm = ''
    }



    const idEdicion = formRegistrar.dataset.editId;


    const nuevosHabitos = {
        data: {
            habito: document.getElementById('habito').value,
            tipo: tipoForm
        },
        fechaReg: document.getElementById('fechaReg').value || fechaCL, // Si no hay fecha, usamos la fecha actual
        unidad: unidadform,
        metSem: metSemanalForm,
        metDia: metDiariaForm,
        sitBase: sitBaseForm,
        activo: document.getElementById('activo').checked ? "Si" : "No"
    };

    if (idEdicion) {
        // Si hay un ID de edición, significa que estamos editando un hábito existente
        // Buscamos el índice del hábito que estamos editando

        fetch(`http://127.0.0.1:8000/habitos/${idEdicion}`, {
                method: 'PUT',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(nuevosHabitos)

            }
        ).
            then((response) => {
                if (!response.ok) {
                    throw new Error("Error en actualizar el habito")
                }
                return response.json();
            }).
            then(() => {
                formRegistrar.dataset.editId = ""
                formRegistrar.close()
                cargarDatos()
            })

    }
    else {
        fetch('http://127.0.0.1:8000/habitos',
            {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(nuevosHabitos)

            }
        ).
            then((response) => {
                if (!response.ok) {
                    throw new Error("Error en guardar el habito")
                }
                return response.json();
            }).
            then(() => {
                formRegistrar.close()
                cargarDatos()
            })
            .catch(error => console.error("Error en POST:", error));

    }
    ;

});

const sel_unidad = document.getElementById('unidad')
console.log(sel_unidad)

const camposHoras = document.querySelectorAll('.grupo-horas-form');
console.log(camposHoras)

const camposDias = document.querySelectorAll('.grupo-dias-form');


sel_unidad.addEventListener('change', function(){

    const seleccion = sel_unidad.value
    
    camposHoras.forEach(campo=>{

        const inputDentroDelCampo = campo.querySelector('input');

        if (seleccion === "Horas") {
            campo.style.display='flex'
            inputDentroDelCampo.required = true
            
        }

        else {
            campo.style.display='none'
            inputDentroDelCampo.required = false

        }
    })


    camposDias.forEach(campo=>{

        const inputDentroDelCampo = campo.querySelector('input');

        if (seleccion === "Dias") {
            campo.style.display='flex'
            inputDentroDelCampo.required = true
            
        }

        else {
            campo.style.display='none'
            inputDentroDelCampo.required = false

        }
    })

})



const botonCancelarForm = document.getElementById('btn-cancelar-form')


botonCancelarForm.addEventListener('click', function(){
    // 1. Limpiamos los campos base
    document.getElementById('habito').value = "";
    document.getElementById('tipo').value = "";
    document.getElementById('unidad').value = "";
    document.getElementById('metDiaria').value = "";
    
    // 2. Limpiamos los NUEVOS campos que creaste para horas y días
    document.getElementById('sitBase_hora').value = "";
    document.getElementById('sitBase_dia').value = "";
    document.getElementById('metSemanal_hora').value = "";
    document.getElementById('metSemanal_dia').value = "";
    
    // 3. Reseteamos el checkbox
    const activo = document.getElementById('activo');
    activo.checked = true;
    activo.value = "Si";

    const gruposDinamicos = document.querySelectorAll('.grupo-dias-form, .grupo-horas-form')

    gruposDinamicos.forEach(grupo =>{
        grupo.style.display= 'none'
    })

    formRegistrar.close();
        

})



const botones_editar = document.querySelectorAll('.btn-editar')

tabla_habitos.addEventListener("click", function(evento){

    const elemento = evento.target
    const idSeleccionado = elemento.getAttribute('data-id')

    // --- CASO 1: EDITAR ---
    if (elemento.classList.contains('btn-editar')){

        // Buscamos en el array global que trajimos de MongoDB
        const habitoEditar = habitosGlobal.find(h => h.idHabito === idSeleccionado)
        
        // Guardamos el ID en el propio modal de forma invisible
        formRegistrar.dataset.editId = habitoEditar.idHabito;

        // Llenamos los campos base
        document.getElementById('habito').value = habitoEditar.data.habito;
        document.getElementById('tipo').value = habitoEditar.data.tipo;
        document.getElementById('unidad').value = habitoEditar.unidad;

        // Disparamos el evento 'change' para que se muestren las cajas correctas de horas o días
        document.getElementById('unidad').dispatchEvent(new Event('change'));

        // Llenamos las cajas específicas
        if (habitoEditar.unidad === 'Horas') {
            document.getElementById('sitBase_hora').value = habitoEditar.sitBase;
            document.getElementById('metSemanal_hora').value = habitoEditar.metSem;
            document.getElementById('metDiaria').value = habitoEditar.metDia;
        } else if (habitoEditar.unidad === 'Dias') {
            document.getElementById('sitBase_dia').value = habitoEditar.sitBase;
            document.getElementById('metSemanal_dia').value = habitoEditar.metSem;
        }

        document.getElementById('fechaReg').value = habitoEditar.fechaReg;

        // Marcamos el checkbox si corresponde
        document.getElementById('activo').checked = (habitoEditar.activo === "Si");

        // Cambio de botones: Ocultamos Registrar, mostramos Guardar
        document.getElementById('btn-registrar-form').style.display = 'none';
        document.getElementById('btn-guardar-edicion').style.display = 'inline-block';
        
        // Abrimos el modal
        formRegistrar.showModal();
    }

    // --- CASO 2: ELIMINAR ---
    else if (elemento.classList.contains('btn-eliminar')) {

       const confirmacion = confirm("¿Estás seguro de que deseas eliminar este hábito?"); 
       
       if (confirmacion) {
           
            // Hacemos la petición DELETE a FastAPI enviando el idSeleccionado de MongoDB
            fetch(`http://127.0.0.1:8000/habitos/${idSeleccionado}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al eliminar el hábito")
                }
                cargarDatos()

                
            })
            .catch(error => {
                console.error("Error en DELETE:", error);
            });
       }
    }
});





