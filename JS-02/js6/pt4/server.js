const express = require('express');
const cors = require('cors');
const app = express();

// Sirven para el index pueda acceder a la api
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Usuarios por defecto 
const students = [
  { id: 1, name: 'Jorge', age: 20 },
  { id: 2, name: 'Marriana', age: 30 },
  { id: 3, name: 'Antonio', age: 25 }
];

// Ruta principal
app.get('/', (req, res) => {
  res.send('Node JS API funcionando');
});

// Obtener todos los alumnos
app.get('/api/alumnos', (req, res) => {
  res.send(students);
});

// Obtener un alumno por id
app.get('/api/alumnos/:id', (req, res) => {
  const student = students.find(c => c.id === parseInt(req.params.id));
  if (!student) return res.status(404).send('Estudiante no encontrado');
  res.send(student);
});

// Agregar alumno
app.post('/api/alumnos', (req, res) => {
  const maxId = students.length > 0 ? Math.max(...students.map(s => s.id)) : 0;
  const student = {
    id: maxId + 1,
    name: req.body.name?.trim() || 'Sin nombre',
    age: parseInt(req.body.age) || 0
  };
  students.push(student);
  res.send(student);
});

// Eliminar alumno por el id
app.delete('/api/alumnos/:id', (req, res) => {
  const student = students.find(c => c.id === parseInt(req.params.id));
  if (!student) return res.status(404).send('Estudiante no encontrado');
  const index = students.indexOf(student);
  students.splice(index, 1);
  res.send(student);
});

const port = 3000;
app.listen(port, () => console.log(`Servidor escuchando en puerto ${port}...`));
