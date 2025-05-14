

    const roles = [];
    const rolSelect = document.getElementById("selectRol");
    const arrayRolesDiv = document.getElementById("array-roles");
    const resultadoAdminDiv = document.getElementById("resultado-admin");
    //agrega el roll selecionado al array si no esta repetido
    document.getElementById("form-roles").addEventListener("submit", e => {
      e.preventDefault();
      const r = rolSelect.value;
      if (r && !roles.includes(r)) {
        roles.push(r);
        arrayRolesDiv.textContent = `Roles: ${roles.join(", ")}`;
      }
      e.target.reset();
    });
    //busca el roll admin en el array
    function buscarAdmin() {
      const tiene = roles.includes("admin");
      resultadoAdminDiv.textContent = tiene
        ? "'admin' está en los roles."
        : "'admin' NO está en los roles.";
    }

 
    const colores = [];
    const inputColor = document.getElementById("inputColor");
    const arrayColoresDiv = document.getElementById("array-colores");
    const resultadoVerdeDiv = document.getElementById("resultado-verde");
    //convierte el color escrito en minusculas, porque verifica que no este y asi evita errores por mayusculas
    document.getElementById("form-colores").addEventListener("submit", e => {
      e.preventDefault();
      const c = inputColor.value.trim().toLowerCase();
      if (c && !colores.includes(c)) {
        colores.push(c);
        arrayColoresDiv.textContent = `Colores: ${colores.join(", ")}`;
      }
      inputColor.value = "";
    });
    //busca el color "verde" en el array
    function buscarVerde() {
      const tiene = colores.includes("verde");
      resultadoVerdeDiv.textContent = tiene
        ? "Sí, el color 'verde' está en la lista."
        : "'verde' no está en la lista.";
    }

    
    const numeros = [];
    const inputNumero = document.getElementById("inputNumero");
    const arrayNumerosDiv = document.getElementById("array-numeros");
    const resultadoNumeroDiv = document.getElementById("resultado-numero");
    //agrega numeros al array si no estan repetidos
    document.getElementById("form-numeros").addEventListener("submit", e => {
      e.preventDefault();
      const n = parseInt(inputNumero.value, 10);
      if (!isNaN(n)) {
        if (!numeros.includes(n)) {
          numeros.push(n);
          resultadoNumeroDiv.textContent = `Número ${n} agregado.`;
        } else {
          resultadoNumeroDiv.textContent = `El número ${n} ya está en el array.`;
        }
        arrayNumerosDiv.textContent = `Números: ${numeros.join(", ")}`;
      }
      inputNumero.value = "";
    });