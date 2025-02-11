var id =sessionStorage.getItem('id')-1;
var monedaArray = localStorage.getItem('monedas');
var monedasObjetos = JSON.parse(monedaArray);
console.log(monedasObjetos[id].nombre);
var token = monedasObjetos[id].nombre;
// let chartInstance = null;
document.addEventListener('DOMContentLoaded',()=>{
    generarRecursos(token);
    generarGrafico(token);
    $('#tokenList').click(function (e) { 
        e.preventDefault();
        window.location.href= '../index.html';
    });
    $('button').click(function (e) { 
        e.preventDefault();
        duracionGrafico($(this).attr('id'));
    });
})
//funcion para setear las caracteristicas del grafico
function duracionGrafico(duracion){
    console.log(duracion)
    var histo;
    var limit;
    if(duracion === 'dia'){
        histo = 'histohour'
        limit = 24;
    }else if(duracion === 'semana'){
        histo = 'histoday'
        limit = 7;
    }else if(duracion === 'mes'){
        histo = 'histoday'
        limit = 30;
    }else if(duracion === 'ano'){
        histo = 'histoday'
        limit = 365;
    }
    generarGraficoX(histo, limit, token);
}
function generarRecursos(token){
    $('.encabezado2').append('<div id="div-graf"><img id="img-graf" src="../img/'+token+'.png"></div>');
    $('#div-graf').append('<button id="dia">1D</button>');
    $('#div-graf').append('<button id="semana">1W</button>');
    $('#div-graf').append('<button id="mes">1M</button>');
    $('#div-graf').append('<button id="ano">1Y</button>');
    $('#div-graf').append('<p class="info-p"> Precio: '+monedasObjetos[id].precio+ '</p>');
    $('#div-graf').append('<p class="info-p"> Capitalización de mercado: '+monedasObjetos[id].capitalizacion+' </p>');
    $('#div-graf').append('<p class="info-p"> Cambio 24h: '+monedasObjetos[id].cambio+' %</p>');
    $('#div-graf').append('<p class="info-p"> Volumen 24h: '+monedasObjetos[id].vol+'</p>');
}
//funcion para generar el grafico con chart.js
function generarGrafico(token){
    let ctx = document.getElementById('grafico').getContext('2d');
    //consulta a la api para obtener las 24horas del precio del activo
    $.ajax({
        url: `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${token}&tsym=USD&limit=24`,
        type: 'GET',
        dataType: 'json',
        success: function(response){
            if (response.Data && response.Data.Data) {
                let historial = response.Data.Data;

                // Extraer precios de cierre y tiempos
                let precios = historial.map(d => d.close);
                let tiempos = historial.map(d => new Date(d.time * 1000).getHours() + ":00");

                // Dibujar el gráfico con los datos
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: tiempos,
                        datasets: [{
                            label: 'Precio',
                            data: precios,
                            borderColor: '#4CAF50',
                            borderWidth: 2,
                            fill: true,
                            backgroundColor: 'rgba(20, 206, 26, 0.2)',
                            tension: 0,
                            pointRadius: 2
                        }]
                    },
                    options: {
                        responsive: false,
                        scales: {
                            x: { display: true },
                            y: { display: true }
                        },
                        plugins: {
                            legend: { display: false }
                        }
                    }
                });
            } else {
                console.error("Error obteniendo datos históricos para el grafico de", token);
            }
        },        
        error: function () {
            console.error("Error en la solicitud AJAX para", token);
        }
    })
}
//funciona para crear el grafico con paso los parametros de duracionGrafico()
function generarGraficoX(histo, limit, token){
    //eliminamos el canvas viejo y creamos uno nuevo, a si el grafico se estruye y se muestra el nuevo
    $('#grafico').remove(); 
    $('.moneda').append('<canvas id="grafico"></canvas>');
    let ctx = document.getElementById('grafico').getContext('2d');

    //consulta a la api para obtener     
    $.ajax({
        url: `https://min-api.cryptocompare.com/data/v2/${histo}?fsym=${token}&tsym=USD&limit=${limit}`,
        type: 'GET',
        dataType: 'json',
        success: function(response){
            if (response.Data && response.Data.Data) {
                let historial = response.Data.Data;
                // Extraer precios de cierre y tiempos
                let precios = historial.map(d => d.close);
                let tiempos = (histo === 'histohour') 
                    ? historial.map(d => new Date(d.time * 1000).getHours() + ":00")
                    : historial.map(d => new Date(d.time * 1000).toLocaleDateString());

                // Dibujar el gráfico con los datos reales
                chartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: tiempos,
                        datasets: [{
                            label: 'Precio',
                            data: precios,
                            borderColor: '#4CAF50',
                            borderWidth: 2,
                            fill: true,
                            backgroundColor: 'rgba(20, 206, 26, 0.2)',
                            tension: 0,
                            pointRadius: 2
                        }]
                    },
                    options: {
                        responsive: false,
                        scales: {
                            x: { display: true },
                            y: { display: true }
                        },
                        plugins: {
                            legend: { display: false }
                        }
                    }
                });
            } else {
                console.error("Error obteniendo datos históricos para el grafico de", token);
            }
        },        
        error: function () {
            console.error("Error en la solicitud AJAX para", token);
        }
    })
}