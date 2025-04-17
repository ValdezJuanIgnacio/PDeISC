import fs from 'fs';
import http from 'http';

//Creo una variable con contenido de código html
const htmlContent = `
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Página de prueba</title>
</head>
<body>
  <h1>Viva Perón</h1>
  <p>es un simbolo patrio (fs).</p>
</body>
</html>
`;

// Creo un archvio HTML y le paso el contenido de la variable 
fs.appendFile('pagina.html', htmlContent, (err) => {
  if (err) {
    console.error('Error al escribir el archivo:', err);
    return;
  }
  console.log('Archivo HTML creado o actualizado con éxito.');
});

// Creación el servidor
const server = http.createServer((req, res) => {
  // Leectura del archivo HTML
  fs.readFile('pagina.html', 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error al leer el archivo HTML.');
      return;
    }

    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});


server.listen(8080, '127.0.0.1', () => {
  console.log('Servidor escuchando en http://127.0.0.1:8080');
});
