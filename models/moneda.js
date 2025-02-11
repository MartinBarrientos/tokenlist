const monedaArray = [];
class Moneda {
    nombre;
    precio; 
    cambio;
    capitalizacion;
    url;
    vol;
    constructor(nombre, precio, cambio, capitalizacion, url, vol){
        this.nombre = nombre;
        this.precio = precio;
        this.cambio = cambio;
        this.capitalizacion = capitalizacion;
        this.url = url;
        this.vol = vol;
    }
    
}
export {Moneda, monedaArray};