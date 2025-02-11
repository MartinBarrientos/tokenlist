import { Moneda, monedaArray } from '../models/moneda.js';
var apyKey = '2abcdb5e0df740facf6106a7a76eebb6b1a4fb85e4514ae998fc7f5c202b159a';
var precios = [];
let id = 0;
// let monedas = new Moneda('','');
document.addEventListener('DOMContentLoaded', () => {
    obtenerCotizaciones();
    // Usamos delegación de eventos para asignar el evento click a los elementos .moneda dinámicamente
    $('#tabla').on('click', '.boton', function (e) {
        e.preventDefault();
        console.log('Has clicado en la moneda con id ' + $(this).attr('id'));
        sessionStorage.setItem('id', $(this).attr('id'));

        localStorage.setItem('monedas', JSON.stringify(monedaArray));
        window.location.href = './html/informacion.html';
    });
});
function obtenerCotizaciones() {
    //CONSULTA ajax
    $.ajax({
        headers: {
            'Authorization': apyKey
        },
        type: "GET",
        url: "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,ADA,DOGE,XRP,SOL,HBAR,ZIL,BNB,TRX,LINK,AVAX,XLM,TON,DOT,CRO,POL,ALGO,KAS,SEI,SNEK,PEPE&tsyms=USD",
        // data: precios,
        dataType: "json",
        beforeSend: function () {
            $('body').append('<div id="loading" style="position:fixed; top:80%; left:50%; transform:translate(-50%, -80%); background:green; padding:10px; border:1px solid #ccc;">Cargando datos...</div>');
        },
        success: function (response) {
            precios = response.DISPLAY;
            //creamos los objetos de la clase Moneda e insertamos en el array
            Object.entries(precios).forEach(element => {
                var objetoMoneda = new Moneda(element[0], element[1].USD.PRICE, element[1].USD.CHANGEPCTDAY, element[1].USD.MKTCAP, element[1].USD.IMAGEURL, element[1].USD.TOTALTOPTIERVOLUME24HTO);
                monedaArray.push(objetoMoneda);
            });
            //vamos a ordenar el array por cotizacion
            monedaArray.sort((a, b) => convertirCapitalizacion(b.capitalizacion) - convertirCapitalizacion(a.capitalizacion));
            // console.log(monedaArray);
            mostrarCotizaciones();
        }, 
        error: function(){
            $('.moneda').append('<h1 style="background:red; text-align: center;">ERROR AL CARGAR LOS DATOS</h1>');
        },
        complete: function(){
            $('#loading').remove();
        }
    });
}
function mostrarCotizaciones() {
    //recorremos el array de objetos de la clase moneda e insertamos en el html
    monedaArray.forEach(element => {
        id += 1;
        $('#tabla').append('<tr class="moneda" id="moneda_' + id + '">' + '<td><img id="logo" src="https://www.cryptocompare.com/' + element.url + '"></td>' + '<td>' + element.nombre + '</td>' + '<td>' + element.precio + '</td>' + '<td class="" id="porcentaje_' + id + '">' + element.cambio + ' %' + '</td>' + '<td>' + element.capitalizacion + '</td>' + '<td><canvas id="chart_' + id + '" width="200" height="100"></canvas></td>' + '<td><button class="boton" id="' + id + '">+ info</button></td>' + '</tr>');
        if (element.cambio < 0) {
            let cambio = document.getElementById('porcentaje_' + id);
            cambio.classList.add('rojo');
        } else if (element.cambio > 0) {
            let cambio = document.getElementById('porcentaje_' + id);
            cambio.classList.add('verde');
        } else {
            $('#porcentaje_' + id).addClass('grey');
        }
        generarGrafico('chart_' + id, element.nombre);
    })
}
//funciona para convertir la capitalizacion en numero
function convertirCapitalizacion(cap) {
    let num = parseFloat(cap.replace(/[^0-9.]/g, ''));
    return cap.includes('B') ? num * 1e9 : num * 1e6;
};
//vamos a generar el grafico con chart.js
function generarGrafico(id, token) {
    let ctx = document.getElementById(id).getContext('2d');
    //consulta a la api para obtener las 24horas del precio del activo
    $.ajax({
        url: `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${token}&tsym=USD&limit=24`,
        type: 'GET',
        dataType: 'json',
        // 🔹 Mostrar mensaje de carga en el body antes de enviar la petición
        
        success: function (response) {
            if (response.Data && response.Data.Data) {
                let historial = response.Data.Data;

                // Extraer precios de cierre y tiempos
                let precios = historial.map(d => d.close);
                let tiempos = historial.map(d => new Date(d.time * 1000).getHours() + ":00");

                // Dibujar el gráfico con los datos reales
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
                            tension: 0,
                            pointRadius: 2
                        }]
                    },
                    options: {
                        responsive: false,
                        scales: {
                            x: { display: false },
                            y: { display: false }
                        },
                        plugins: {
                            legend: { display: false }
                        }
                    }
                });
            } else {
                console.error("Error obteniendo datos históricos para el grafico de", token);
                let canvas = document.getElementById(id);
                let ctx = canvas.getContext('2d');
                //Limpiar el canvas antes de dibujar
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                //Asegurar que el mensaje de error se dibuje en el centro
                ctx.font = "14px Arial";  // Reducir tamaño si el canvas es pequeño
                ctx.fillStyle = "red";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                //Dibujar el mensaje en el centro del canvas
                ctx.fillText("Error al generar el gráfico", canvas.width / 2, canvas.height / 2);
            }
        },
        error: function () {
            console.error("Error en la solicitud AJAX para", token);
            //Obtener correctamente el canvas y su contexto
            let canvas = document.getElementById(id);
            let ctx = canvas.getContext('2d');
            //Limpiar el canvas antes de dibujar
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            //Asegurar que el mensaje de error se dibuje en el centro
            ctx.font = "14px Arial";  // Reducir tamaño si el canvas es pequeño
            ctx.fillStyle = "red";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            //Dibujar el mensaje en el centro del canvas
            ctx.fillText("Error al generar el gráfico", canvas.width / 2, canvas.height / 2);
        }
    })
}