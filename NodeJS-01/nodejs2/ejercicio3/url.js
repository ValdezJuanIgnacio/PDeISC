import http from 'http';
import { parse } from 'url';

const server = http.createServer((req, res) => {
  const parsedUrl = parse(req.url, true); // true para convertir query en objeto

  console.log('Host:', req.headers.host);//Se muestra por consola los datos deseados
  console.log('Pathname:', parsedUrl.pathname);// //
  console.log('Query:', parsedUrl.query);// //

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Consulta registrada. Revisá la consola para ver los detalles.');
});

server.listen(8084, '127.0.0.1', () => {
  console.log('Servidor escuchando en http://127.0.0.1:8084');
});