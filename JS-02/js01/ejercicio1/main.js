const express = require("express");
const app = express();
const path = require("path");
const port = 3001;
const personas = []; // Array 

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Ruta para guardar datos desde un formulario
app.post('/enviar', (req, res) => {
    const persona = {
        usr: req.body.usr,
        pass: req.body.pass
    };
    personas.push(persona);
    console.log(personas);
    res.send('Persona agregada correctamente <a href="/">Volver</a>');
});

// Ruta para mostrar datos
app.get('/personas', (req, res) => {
    let lista = '<h1>Listado de personas</h1><ul>';
    personas.forEach(p => {
        lista += `<li>${p.usr} - ${p.pass}</li>`;
    });
    lista += '</ul>';
    res.send(lista);
});

app.listen(port, () => {
    console.log(`Server en: http://localhost:${port}`);
});
