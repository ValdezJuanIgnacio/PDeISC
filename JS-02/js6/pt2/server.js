
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const students = [
    { id: 1, name: 'Jorge', email: 'jorge@example.com' },
    { id: 2, name: 'Marriana', email: 'marriana@example.com' },
    { id: 3, name: 'Antonio', email: 'antonio@example.com' }
];

app.get('/api/alumnos', (req, res) => {
    res.send(students);
});

app.get('/api/alumnos/:id', (req, res) => {
    const student = students.find(c => c.id === parseInt(req.params.id));
    if (!student) return res.status(404).send('Estudiante no encontrado');
    res.send(student);
});

app.post('/api/alumnos', (req, res) => {
    const name = req.body.name?.trim() || "Sin nombre";
    const email = req.body.email?.trim() || "sinemail@example.com";

    const student = {
        id: students.length + 1,
        name,
        email
    };

    students.push(student);
    res.send(student);
});

app.delete('/api/alumnos/:id', (req, res) => {
    const student = students.find(c => c.id === parseInt(req.params.id));
    if (!student) return res.status(404).send('Estudiante no encontrado');
    const index = students.indexOf(student);
    students.splice(index, 1);
    res.send(student);
});

const port = 3000;
app.listen(port, () => console.log(`Escuchando en puerto ${port}...`));
