
    // Ejercicio 1: Colores con límite de 3
    const formColores = document.getElementById("form-colores");
    const colores = [];
    formColores.addEventListener("submit", function(e) {
      e.preventDefault();
      const aviso = document.getElementById("aviso-colores");
      const c1 = document.getElementById("color1").value.trim();
    
      const nuevos = [c1].filter(c => c !== "");
      if (colores.length + nuevos.length > 3) {
        aviso.textContent = "Solo se permiten hasta 3 colores.";
      } else {
        nuevos.reverse().forEach(c => colores.unshift(c)); // unshift en orden correcto
        document.getElementById("resultado-colores").textContent = "Colores: [" + colores.join(", ") + "]";
        aviso.textContent = "";
        formColores.reset();
      }
    });
    
    
        // Ejercicio 2: Tareas
        const formTareas = document.getElementById("form-tareas");
        const tareas = ["Estudiar", "Lavar ropa"];
        formTareas.addEventListener("submit", function(e) {
          e.preventDefault();
          const tarea = document.getElementById("nuevaTarea").value;
          if (tarea) tareas.unshift(tarea);
          document.getElementById("resultado-tareas").textContent = "Tareas: [" + tareas.join(", ") + "]";
          formTareas.reset();
        });
    
        // Ejercicio 3: Usuarios
        const formUsuarios = document.getElementById("form-usuarios");
        const usuarios = ["Lucía", "Carlos"];
        formUsuarios.addEventListener("submit", function(e) {
          e.preventDefault();
          const usuario = document.getElementById("nuevoUsuario").value;
          if (usuario) usuarios.unshift(usuario);
          document.getElementById("resultado-usuarios").textContent = "Usuarios conectados: [" + usuarios.join(", ") + "]";
          formUsuarios.reset();
        });