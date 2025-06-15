export class estudiante{
    constructor (nombre, apellido, edad){
        this.apellido=apellido;
        this.nombre=nombre;
        this.edad=edad;
    };
    saludar(){
        console.log(`Hola soy ${this.nombre}-${this.apellido} y tengo ${this.edad}`);
    }
};