let enlaces = [];

function crearEnlaces() {
  enlaces = [
    { texto: "Google", href: "https://www.google.com" },
    { texto: "Facebook", href: "https://www.facebook.com" },
    { texto: "Twitter", href: "https://www.twitter.com" },
    { texto: "YouTube", href: "https://www.youtube.com" },
    { texto: "Instagram", href: "https://www.instagram.com" }
  ];
  mostrarEnlaces();
  log("Enlaces predeterminados creados.");
}

function mostrarEnlaces() {
  const div = document.getElementById('enlaces');
  div.innerHTML = '';
  enlaces.forEach((e, i) => {
    const a = document.createElement('a');
    a.href = e.href;
    a.textContent = `${i}. ${e.texto}`;
    a.target = "_blank";
    div.appendChild(a);
    div.appendChild(document.createElement('br'));
  });
}

function agregarEnlace() {
  const texto = document.getElementById('nuevoTexto').value;
  const href = document.getElementById('nuevoHref').value;
  if (texto && href) {
    enlaces.push({ texto, href });
    mostrarEnlaces();
    log(`Nuevo enlace agregado: ${texto} → ${href}`);
  } else {
    log("⚠️ Ingrese texto y URL para agregar un enlace.");
  }
}

function modificarEnlace() {
  const index = parseInt(document.getElementById('modIndex').value);
  const nuevoTexto = document.getElementById('modTexto').value;
  const nuevoHref = document.getElementById('modHref').value;

  if (!isNaN(index) && enlaces[index]) {
    const anterior = { ...enlaces[index] };
    if (nuevoTexto) enlaces[index].texto = nuevoTexto;
    if (nuevoHref) enlaces[index].href = nuevoHref;
    mostrarEnlaces();
    log(`Modificado el enlace #${index}: de ${anterior.texto} → ${anterior.href} a ${enlaces[index].texto} → ${enlaces[index].href}`);
  } else {
    log("Índice inválido");
  }
}

function log(mensaje) {
  const div = document.getElementById('log');
  const p = document.createElement('p');
  p.textContent = mensaje;
  div.appendChild(p);
}
