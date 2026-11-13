
const fechaCL = new Date().toLocaleDateString('es-CL');
const tabla_habitos = document.querySelector('.tabla-habitos')


function agregarFilaTabla(habito){
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
                
            `
        tabla_habitos.appendChild(row)

}






/*1 LLamar a los datos con datos mockeados 

fetch('../MOCK/reghabitos.json').then((response) =>
{
   return response.json();
}).then((habitos)=>{
    habitos.forEach(habito => {
    
    agregarFilaTabla(habito)    
       
    });
}); */





/**/
// . AL CARGAR LA PÁGINA: Revisamos el LocalStorage
let habitosCargados = JSON.parse(localStorage.getItem('mis_habitos'));

// Si no hay nada o está vacío, traemos los datos de prueba
if (!habitosCargados || habitosCargados.length === 0) {
    fetch('../MOCK/reghabitos.json')
        .then(response =>response.json())
        .then(mockHabitos => {
            // Los guardamos en el cajón
            localStorage.setItem('mis_habitos', JSON.stringify(mockHabitos));
            // Los dibujamos en la tabla
            mockHabitos.forEach(habito => agregarFilaTabla(habito));
        });
} else {
    // Si YA hay datos en el cajón (porque ya guardaste antes), simplemente los dibujamos
    habitosCargados.forEach(habito => agregarFilaTabla(habito));
}



const filter = document.querySelectorAll('.botones-filtros-tabla button' )
console.log(filter)

filter.forEach(boton=>{

    boton.addEventListener('click', function(){

    console.log(boton)
    const filas = tabla_habitos.querySelectorAll('.fila-habito');
        
        // Al usar 'this.value' o boton.value, capturamos el valor exacto del botón que recibió el clic
        const selectedValue = boton.value;
        console.log(selectedValue)

    filas.forEach(fila=>{

        const tipo = fila.getAttribute('data-tipo')

        const isShow= selectedValue === '' || selectedValue === tipo
        fila.classList.toggle('is-hidden', isShow === false)


    }) 
})

})

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


const inputSearch = document.getElementById('buscarHabito')
const btnBuscar = document.getElementById('btn-buscar')

btnBuscar.addEventListener('click', function(evento){

    evento.preventDefault();

    const texto = inputSearch.value.trim();

    const filas = document.querySelectorAll('.fila-habito');

    filas.forEach(fila=>{

        const habito = fila.getAttribute('data-habito').toLowerCase();

        if (habito.includes(texto.toLowerCase())){
            fila.style.display = ''
        }

        else {
            fila.style.display= 'none'
        }

    })

    
    

})

const checkboxActivo = document.getElementById('activo');

checkboxActivo.addEventListener('change', function() {
    if (this.checked) {
        this.value = "Si";
    } else {
        this.value = "No";
    }
});






const formRegistrar = document.getElementById('registro-dialog')

console.log(formRegistrar)

formRegistrar.addEventListener("submit", function(){



    let letraId = ''

    if (tipo.value == 'Positivo'){
        letraId = 'b'
    }
    else if (tipo.value == 'Negativo'){
        letraId = 'm'
    }
    else {
         letraId = 'x'
    }



    const unidadform = document.getElementById('unidad').value
    const tipoForm = document.getElementById('tipo').value

    let metDiariaForm = ''
    let sitBaseForm =''
    let metSemanalForm =''
    

    if(unidadform === 'Horas') {
        metDiariaForm = document.getElementById('metDiaria').value
        sitBaseForm = document.getElementById('sitBase_hora').value
        metSemanalForm = document.getElementById('metSemanal_hora').value
    }
    else if (unidadform === 'Dias') {

        sitBaseForm = document.getElementById('sitBase_dia').value
        metSemanalForm = document.getElementById('metSemanal_dia').value
            
        if(tipoForm==='Positivo') {
            metDiariaForm = 'Dentro del dia'
            

        
        }
        else if (tipoForm ==='Negativo'){
            metDiariaForm = 'No hacerlo hoy'
        }

    }
    else {
        metDiariaForm = ''
    }
                


    let habitosGuardados = JSON.parse(localStorage.getItem('mis_habitos')) || [];
    const idEdicion = formRegistrar.dataset.editId;

    if (idEdicion) {
        // Si hay un ID de edición, significa que estamos editando un hábito existente
        // Buscamos el índice del hábito que estamos editando
        const index = habitosGuardados.findIndex(h => h.idHabito === idEdicion);

        if (index !== -1) {
            habitosGuardados[index] = {
                idHabito: idEdicion,
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

            formRegistrar.dataset.editId = "";
        }
    } else {
        const nuevoHabito = {
            idHabito: letraId + Date.now(),
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

        habitosGuardados.push(nuevoHabito);
    }

    localStorage.setItem('mis_habitos', JSON.stringify(habitosGuardados));

    // Borramos todo el contenido actual de la tabla
    tabla_habitos.innerHTML = "";

    habitosGuardados.forEach(habito => agregarFilaTabla(habito));

});

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



/* botones_editar.forEach((boton) => {
  boton.addEventListener('click', (event) => {
    // JavaScript sabe exactamente cuál tocaste gracias a 'boton' o 'event.target'
    console.log("Hiciste clic en:", event.target); 
  });
});
 */

const botones_editar = document.querySelectorAll('.btn-editar')

tabla_habitos.addEventListener("click", function(evento){

    const elemento = evento.target

    const idSeleccionado = elemento.getAttribute('data-id')


    if (elemento.classList.contains('btn-editar')){


        let obtenerDatos =  JSON.parse(localStorage.getItem('mis_habitos')) || [];
        
        const habitoEditar = obtenerDatos.find(h => h.idHabito === idSeleccionado)
        
// 3. Guardamos el ID en el propio modal de forma invisible
        formRegistrar.dataset.editId = habitoEditar.idHabito;

        // 4. Llenamos los campos base
        document.getElementById('habito').value = habitoEditar.data.habito;
        document.getElementById('tipo').value = habitoEditar.data.tipo;
        document.getElementById('unidad').value = habitoEditar.unidad;

        // 5. Disparamos el evento 'change' manualmente para que se muestren las cajas correctas de horas o días
        //silenciosamente hacemos que el evento 'change' se dispare en el select de unidad, para que se muestren las cajas correctas de horas o días
        document.getElementById('unidad').dispatchEvent(new Event('change'));

        // 6. Llenamos las cajas específicas
        if (habitoEditar.unidad === 'Horas') {
            document.getElementById('sitBase_hora').value = habitoEditar.sitBase;
            document.getElementById('metSemanal_hora').value = habitoEditar.metSem;
            document.getElementById('metDiaria').value = habitoEditar.metDia;
        } else if (habitoEditar.unidad === 'Dias') {
            document.getElementById('sitBase_dia').value = habitoEditar.sitBase;
            document.getElementById('metSemanal_dia').value = habitoEditar.metSem;
        }

        document.getElementById('fechaReg').value = habitoEditar.fechaReg;

        // 7. Marcamos el checkbox si corresponde
        document.getElementById('activo').checked = (habitoEditar.activo === "Si" || habitoEditar.activo === "No");

        // 8. Cambio de botones: Ocultamos Registrar, mostramos Guardar
        document.getElementById('btn-registrar-form').style.display = 'none';
        document.getElementById('btn-guardar-edicion').style.display = 'inline-block';
        
        // 9. Abrimos el modal
        formRegistrar.showModal();
    }
    else if (elemento.classList.contains('btn-eliminar')) {

       const confirmacion = confirm("¿Estás seguro de que deseas eliminar este hábito?"); 
       
       if (confirmacion) {
         
        // obtener los hábitos guardados en el LocalStorage
        let habitosGuardados =  JSON.parse(localStorage.getItem('mis_habitos')) || [];

        // sobreescribimos el array filtrando el hábito que queremos eliminar y quedando fuera
        // descartado el que coincide con el idSeleccionado y quedando solo los que no coinciden
        habitosGuardados = habitosGuardados.filter(h => h.idHabito !== idSeleccionado);

        // Guardamos el array actualizado en el LocalStorage
        localStorage.setItem('mis_habitos', JSON.stringify(habitosGuardados));

        // Borramos todo el contenido actual de la tabla
        tabla_habitos.innerHTML = "";

        // Dibujamos nuevamente la tabla con los hábitos restantes
        habitosGuardados.forEach(habito => agregarFilaTabla(habito));

        


       }
    }
} );