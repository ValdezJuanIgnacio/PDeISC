const express = require("express");
const app = express();
const path = require("path");//utilizamos el express y el path para el serv
const PORT =8530;

app.use(express.static(path.join(__dirname, "public")));//carpeta estatica publica donde vamos a estar trabajando
// rutas para enviar archivos html segun la url 
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public','paginas','index.html'));//direccion del index
});
app.get("/simondice", (req, res) => {
  res.sendFile(path.join(__dirname, 'public','paginas','juego1.html'));//direccion de las paginas
});
app.get("/tateti", (req, res) => {
  res.sendFile(path.join(__dirname, 'public','paginas','juego2.html'));
});
app.get("/piedrapapelotijeras", (req, res) => {
  res.sendFile(path.join(__dirname, 'public','paginas','juego3.html'));
});

// inicia el servidor en el puerto definido
app.listen(PORT, () => {//puerto
  console.log("http://localhost:"+PORT); // muestra url en consola
});
