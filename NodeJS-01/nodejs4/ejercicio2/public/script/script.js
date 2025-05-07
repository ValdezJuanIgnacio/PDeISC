const formulario = document.getElementById('formulario');
const inputs = document.querySelectorAll('#formulario input, #formulario select');

const expresiones = {//Define como se va a validar cada campo
  nombre: /^[a-zA-ZÀ-ÿ\s]{3,40}$/,
  apellido: /^[a-zA-ZÀ-ÿ\s]{3,40}$/,
  edad: /^(?:1[01][0-9]|120|[1-9]?[0-9])$/,     // 0–120
  fechaNacimiento: /^\d{4}-\d{2}-\d{2}$/,        // YYYY‑MM‑DD
  sexo: /^(masculino|femenino|otro)$/i,
  dni: /^\d{8}$/,                                // 8 dígitos
  estadoCivil: /^[a-zA-ZÀ-ÿ\s]{3,20}$/,
  nacionalidad: /^[a-zA-ZÀ-ÿ\s]{3,20}$/,
  telefono: /^\d{7,14}$/,
  correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
};
//Hace que hasta que no se llenen los campos salte error
const campos = {
  nombre: false,
  apellido: false,
  edad: false,
  fechaNacimiento: false,
  sexo: false,
  dni: false,
  estadoCivil: false,
  nacionalidad: false,
  telefono: false,
  correo: false
};
//Valida que los digitos colocados en cada campo sean validos
const validarCampo = (expresion, input, campo) => {
  const grupo = document.getElementById(`grupo__${campo}`);
  const icono = grupo.querySelector('i');
  const error = grupo.querySelector('.formulario__input-error');

  if (expresion.test(input.value)) {
    grupo.classList.add('formulario__grupo-correcto');
    grupo.classList.remove('formulario__grupo-incorrecto');
    icono.classList.replace('fa-times-circle', 'fa-check-circle');
    error.style.display = 'none';
    campos[campo] = true;
  } else {
    grupo.classList.add('formulario__grupo-incorrecto');
    grupo.classList.remove('formulario__grupo-correcto');
    icono.classList.replace('fa-check-circle', 'fa-times-circle');
    error.style.display = 'block';
    campos[campo] = false;
  }
};
//Valida el rango en que se pone la fecha de nacikmiento, para que sea una fecha lógica de alguien vivo, y tambien compara la fecha con la edad
const validarFechaNacimiento = (input) => {
	const grupoFecha = document.getElementById('grupo__fechaNacimiento');
	const iconoFecha = grupoFecha.querySelector('i');
	const errorFecha = grupoFecha.querySelector('.formulario__input-error');
  
	// Chequear fecha y calcular edad
	const fecha = new Date(input.value);
	const hoy = new Date();
	let edadCalculada = hoy.getFullYear() - fecha.getFullYear();
	const m = hoy.getMonth() - fecha.getMonth();
	if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) edadCalculada--;
  
	// Obtener valor del campo edad
	const inputEdad = document.getElementById('edad');
	const valorEdad = parseInt(inputEdad.value, 10);
  
	// Validar formato y rango
	const fechaValida = expresiones.fechaNacimiento.test(input.value) && fecha < hoy && edadCalculada >= 0 && edadCalculada <= 120;
	// Validar que coincida con el campo edad
	const edadCoincide = fechaValida && !isNaN(valorEdad) && valorEdad === edadCalculada;
  
	// Marcar fecha
	if (fechaValida) {
	  grupoFecha.classList.remove('formulario__grupo-incorrecto');
	  grupoFecha.classList.add('formulario__grupo-correcto');
	  iconoFecha.classList.replace('fa-times-circle','fa-check-circle');
	  errorFecha.style.display = 'none';
	} else {
	  grupoFecha.classList.add('formulario__grupo-incorrecto');
	  grupoFecha.classList.remove('formulario__grupo-correcto');
	  iconoFecha.classList.replace('fa-check-circle','fa-times-circle');
	  errorFecha.style.display = 'block';
	}
	campos.fechaNacimiento = fechaValida;
  
	// Marcar edad
	const grupoEdad = document.getElementById('grupo__edad');
	const iconoEdad = grupoEdad.querySelector('i');
	const errorEdad = grupoEdad.querySelector('.formulario__input-error');
  
	if (edadCoincide) {
	  grupoEdad.classList.remove('formulario__grupo-incorrecto');
	  grupoEdad.classList.add('formulario__grupo-correcto');
	  iconoEdad.classList.replace('fa-times-circle','fa-check-circle');
	  errorEdad.style.display = 'none';
	  campos.edad = true;
	} else {
	  grupoEdad.classList.add('formulario__grupo-incorrecto');
	  grupoEdad.classList.remove('formulario__grupo-correcto');
	  iconoEdad.classList.replace('fa-check-circle','fa-times-circle');
	  errorEdad.style.display = 'block';
	  campos.edad = false;
	}
};
//Valida que esten bien todos los campos
const validarFormulario = (e) => {
	const campo = e.target.name;
	if (campo === 'fechaNacimiento' || campo === 'edad') {
	  validarFechaNacimiento(document.getElementById('fechaNacimiento'));
	} else if (expresiones[campo]) {
	  validarCampo(expresiones[campo], e.target, campo);
	}
};
//Se encarga de llamar a las validaciones una vez que se llena cada campo
inputs.forEach(input => {
  input.addEventListener('keyup', validarFormulario);
  input.addEventListener('blur', validarFormulario);
  input.addEventListener('change', validarFormulario); // Para el select y date
});
//Chequea que todo este bien una vez que se apreta enviar
formulario.addEventListener('submit', e => {
  e.preventDefault();
  const todosValidos = Object.values(campos).every(v => v);
  const terminos = document.getElementById('terminos').checked;

  if (todosValidos && terminos) {
    //Aca se aggarran los datos
    const datos = {
      nombre: formulario.nombre.value,
      apellido: formulario.apellido.value,
      edad: formulario.edad.value,
      fechaNacimiento: formulario.fechaNacimiento.value,
      sexo: formulario.sexo.value,
      dni: formulario.dni.value,
      estadoCivil: formulario.estadoCivil.value,
      nacionalidad: formulario.nacionalidad.value,
      telefono: formulario.telefono.value,
      correo: formulario.correo.value
    };
	//muestra en pantalla la info 
    const resultado = document.getElementById('resultado');
    const card = document.createElement('div');
    card.innerHTML = Object.entries(datos)
      .map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`)
      .join('') + '<hr>';
    resultado.appendChild(card);

    // Resetear todo
    formulario.reset();
    Object.keys(campos).forEach(c => campos[c] = false);
    document.querySelectorAll('.formulario__grupo-correcto, .formulario__grupo-incorrecto')
      .forEach(g => g.classList.remove('formulario__grupo-correcto', 'formulario__grupo-incorrecto'));
    document.getElementById('formulario__mensaje-exito')
      .classList.add('formulario__mensaje-exito-activo');
    setTimeout(() => {
      document.getElementById('formulario__mensaje-exito')
        .classList.remove('formulario__mensaje-exito-activo');
    }, 5000);
  } else {
    document.getElementById('formulario__mensaje')
      .classList.add('formulario__mensaje-activo');
    setTimeout(() => {
      document.getElementById('formulario__mensaje')
        .classList.remove('formulario__mensaje-activo');
    }, 5000);
  }
});
