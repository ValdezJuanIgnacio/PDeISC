import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <>
           {" "}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow">
               {" "}
        <div className="container">
                   {" "}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
                        <span className="navbar-toggler-icon"></span>     {" "}
          </button>
                   {" "}
          <div className="collapse navbar-collapse" id="navbarNav">
                       {" "}
            <ul className="navbar-nav me-auto">
                           {" "}
              <li className="nav-item">
                               {" "}
                <Link className="nav-link" to="/">
                                    Lista                {" "}
                </Link>
                             {" "}
              </li>
                           {" "}
              <li className="nav-item">
                               {" "}
                <Link className="nav-link" to="/agregar">
                                    Agregar                {" "}
                </Link>
                             {" "}
              </li>
                         {" "}
            </ul>
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </nav>
            {/* Spacer para que el contenido no quede debajo del navbar */}     {" "}
      <div style={{ height: "50px" }}></div>   {" "}
    </>
  );
};

export default Navbar;
