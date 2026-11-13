

const hoy = new Date()
const fechaCL = hoy.toLocaleDateString('es-CL');

const contFechahoy = document.querySelector('.fecha-hoy')

contFechahoy.innerHTML=`<h2>Hoy es: </h2><span>${fechaCL}</span>`



function agregarFilaTabla(habito){

    const tabla_hoy= document.querySelector('.tabla-diaria')

    let strHtmlUnidad= ''

    if (habito.unidad === "Dias"
    ) {
    strHtmlUnidad = `<td class="checkbox-habito"><span>Si</span><input type="checkbox"></td>`
    }
    else if (habito.unidad === "Horas") {
        strHtmlUnidad = `<td class="number-habito"><input type="number" step="0.1"><span>horas</span></td>`
    }
    else {
        strHtmlUnidad = `<td></td>`
    }

    let txtDiario = '';

    const horaStr = habito.unidad.toLowerCase();

    if (horaStr === 'horas') {

        // Operador ternario: si la meta es exactamente 1, decimos "hora", si no, "horas"
        txtDiario = (habito.metDia == 1) ? 'hora' : 'horas'; 
            
    } else {
        txtDiario = '';
    }



    const row = document.createElement('tr')

    row.className = 'fila-habito'
    row.dataset.habito = habito.data.habito
    row.dataset.tipo = habito.data.tipo

    row.innerHTML = `
        
            <td>${habito.data.habito}</td>
            <td>${habito.data.tipo}</td>
            <td>${habito.metDia}<span> ${txtDiario}</span></td>
            ${strHtmlUnidad}
            <td>${habito.pila_semanal}</td>
        `

        tabla_hoy.appendChild(row)
    
    
    
}





fetch('../MOCK/reghabitos.json').then((response) =>
{
   return response.json();
}).then((habitos)=>{
    habitos.forEach(habito => {
    
    agregarFilaTabla(habito)    
       
    });
});

const filter = document.querySelectorAll('.botones-filtros-tabla button' )
console.log(filter)

filter.forEach(boton=>{
    
    boton.addEventListener('click', function(){

    console.log(boton)
    const filas = tabla_hoy.querySelectorAll('.fila-habito');
        
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

const buscador = document.querySelector('#search-habito');
const btnBuscar = document.querySelector('#btn-buscar');

btnBuscar.addEventListener('click', function(evento){

    evento.preventDefault();


    const texto = buscador.value.trim();
    console.log(texto)

    const filas =document.querySelectorAll('.tabla-diaria .fila-habito')

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


guardarHabitos.addEventListener('click', function(evento){

    evento.preventDefault()

    const filas = document.querySelectorAll('.fila-habito');

    filas.forEach(fila=>{
        const input = fila.querySelector('input')

        if (input !== 'none'){
            let valorTexto = '';

            if (input.type === 'checkbox'){
                valorTexto = input.checked ? '✅ Sí' : '❌ No';
            }
            else if  (input.type === 'number'){
                valorTexto = input.value ? `${input.value} horas` : '0 horas';
            }

            const originSpan = input.parentElement.querySelector('span')

            if(originSpan !== 'none'){
                originSpan.style.display='none'
            }
        
            const spanTexto = document.createElement('span')

            spanTexto.className = 'textoLectura';
            spanTexto.textContent = valorTexto;

            input.style.display = 'none';

            input.parentElement.appendChild(spanTexto)



        };

    })
    

})

const modificarHabitos = document.querySelector('.modificar-habitos')

modificarHabitos.addEventListener('click', function(evento){
    evento.preventDefault();

    const filas = document.querySelectorAll('.fila-habito');

    filas.forEach(fila => {

        const input = fila.querySelector('input');

        const spanTexto = fila.querySelector('.textoLectura')

        if(input && spanTexto){

            const spanOrigin = input.parentElement.querySelector('span:not(.textoLectura)');

            if (spanOrigin){
                spanOrigin.style.display = ''
            }


            input.style.display='';

            spanTexto.remove()
        }

    })


})
