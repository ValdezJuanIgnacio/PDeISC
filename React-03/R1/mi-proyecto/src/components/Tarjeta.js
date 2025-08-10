//genera una tarjeta con datos de una persona
function Tarjeta({ nombre, apellido, profesion, imagen }) {
  return (
    <div className="card text-center" style={{ width: "18rem" }}>
      <img
        src={imagen}
        className="card-img-top"
        alt={`${nombre} ${apellido}`}
      />
      <div className="card-body">
        <h5 className="card-title">
          {nombre} {apellido}
        </h5>
        <p className="card-text">{profesion}</p>
      </div>
    </div>
  );
}

export default Tarjeta;
