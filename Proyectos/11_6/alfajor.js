export class alfajor{
    constructor(nombre, marca, peso, valor){
        this.nombre=nombre;
        this.marca=marca;
        this.peso=peso;
        this._precio=valor;
    };
    getprecio(){
        return this._precio;
    };
    setprecio( nuevo_precio){
        if(isNaN(nuevo_precio)==false){
            if(nuevo_precio>0) this._precio=nuevo_precio;
            else console.log(`El valor tiene que ser mayor a 0`); 
        }
        else if(isNaN(nuevo_precio)==true) console.log(`El valor tiene que ser un numero`);
    }
    mostrar(){
        console.log(`El nuevo alfajor ${this.nombre} de ${this.marca} pesa ${this.peso} gramos y vale $${this.getprecio()}`);
    }
}