const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// Ruta para calcular la jubilación
app.get('/calcular-jubilacion', (req, res) => {
  const edad = parseInt(req.query.edad);
  const cotizados = parseInt(req.query.cotizados);

  let puedeJubilarse = false;

  if ((edad >= 65 && cotizados >= 15) || (edad >= 63 && cotizados >= 35)) {
    puedeJubilarse = true;
  }

  res.json({
    puedeJubilarse: puedeJubilarse ? 'Sí' : 'No',
    edad,
    cotizados
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de Jubilación!');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
