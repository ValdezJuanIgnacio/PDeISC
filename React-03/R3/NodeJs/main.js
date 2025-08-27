const express = require("express");
const app = express();
const path = require("path");
const port = 3001;

const personas = []; // Array para almacenar personas

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use('/js', express.static(path.join(__dirname, "js")));

// POST: agregar persona
app.post('/enviar', (req, res) => {
    const { usr, pass } = req.body;
    personas.push({ usr, pass });
    console.log(personas);
    res.send('Persona agregada correctamente <a href="/">Volver</a>');
});

// GET: mostrar personas
app.get('/personas', (req, res) => {
    let lista = '<h1>Listado de personas</h1><ul>';
    personas.forEach(p => {
        lista += `<li>${p.usr} - ${p.pass}</li>`;
    });
    lista += '</ul>';
    res.send(lista);
});

// Servidor
app.listen(port, () => {
    console.log(`Server en: http://localhost:${port}`);
});
