import http from 'http';
import { suma, resta, multiplicacion, division } from './calculo.js';
import { tiempo } from './tiempo.js';

const server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
      <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css">
  </head>
  <body class="bg-primary-subtle">
  <div class="d-flex justify-content-center my-5">
    <ul class="list-group">
      <li class="list-group-item list-group-item-action">Suma: <td>${suma(3, 5)}</td></li>
      <li class="list-group-item list-group-item-action">Resta: <td>${resta(5,2)}<td></li>
      <li class="list-group-item list-group-item-action">Multiplicación: <td>${multiplicacion(2,3)}<td></li>
      <li class="list-group-item list-group-item-action">División: <td>${division(14,7)}<td></li>
      <li class="list-group-item list-group-item-action">Tiempo: <td>${tiempo()}<td></li>
    </ul>
  </div>
      <script href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css"></script>
  </body>
  </html>
      
    `); 
});

server.listen(8084, "127.0.0.1", () => {
  console.log('Listening on 127.0.0.1:8084');
});
