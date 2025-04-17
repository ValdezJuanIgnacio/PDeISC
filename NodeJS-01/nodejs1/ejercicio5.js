import { createServer } from "node:http";
import { suma, resta, multiplicación, division } from "./ejerciocio4/calculos.js";

const server = createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/html" });
  res.end(`
    <html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css">
</head>
<body>
<table class="table sm">
  <thead>
    <tr>
      <th scope="col">Suma</th>
      <th scope="col">Resta</th>
      <th scope="col">Multiplicación</th>
      <th scope="col">División</th>
    </tr>
  </thead>
  <tbody class="table-group-divider">
    <tr>
      <td>${suma(3, 5)}</td>
      <td>${resta(8, 6)}</td>
      <td>${multiplicación(3, 11)}</td>
      <td>${division(30, 5)}</td>
    </tr>
  </tbody>
</table>
    <script href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css"></script>
</body>
</html>
    
  `);
});

server.listen(8084, "127.0.0.1", () => {
  console.log('Listening on 127.0.0.1:8084');
});