import { useState } from "react";
//genera un contador que se sube y baja de a uno
function Contador() {
  const [contador, setContador] = useState(0);

  const incrementar = () => setContador(contador + 1);
  const decrementar = () => setContador(contador - 1);

  return (
    <div className="text-center">
      <h2>Contador: {contador}</h2>
      <button className="btn btn-success m-3" onClick={incrementar}>
        +
      </button>
      <button className="btn btn-success m-3" onClick={decrementar}>
        -
      </button>
    </div>
  );
}

export default Contador;
