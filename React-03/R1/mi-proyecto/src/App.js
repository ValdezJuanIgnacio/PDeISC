import logo from './logo.svg';
import './App.css';
import Titulo from './components/Titulo'; 
import Tarjeta from './components/Tarjeta'; 
import Contador from './components/Contador';
import Lista from './components/Lista';
import Formulario from './components/Formulario';
function App() {
  return (
    <>
      <Titulo />
      
      <div className="container mt-5 d-flex justify-content-center">
        <Tarjeta
          nombre="Valdez"
          apellido="Juan Ignacio"
          profesion="Técnico en Informática"
          imagen="https://img.uefa.com/imgml/TP/players/3/2024/324x324/250113392.jpg"
        />
      </div>
      <div className="container mt-5">
        <Contador />
      </div>
      <div className="container mt-5">
        <Lista />
      </div>
      <div className="container mt-5">
        <Formulario />
      </div>
    </>
  );
}

export default App;