import http from 'http';
import { suma, resta, multiplicacion, division } from './calculo.js';
import { tiempo } from './tiempo.js';

const server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('suma: ' + suma(3, 2)+' , resta: '+resta(5,2)+', tiempo: '+tiempo()); // Usá la función que quieras probar
});

server.listen(8084, "127.0.0.1", () => {
  console.log('Listening on 127.0.0.1:8084');
});
