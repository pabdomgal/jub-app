import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Bienvenido a la calculadora de jubilación!');
});

// Ruta para calcular si puede jubilarse
app.get('/calcular-jubilacion', (req, res) => {
  // Aquí recibimos los parámetros directamente de la query
  const edad = parseInt(req.query.edad);
  const cotizados = parseInt(req.query.cotizados);

  // Validar si se recibieron correctamente los parámetros
  if (isNaN(edad) || isNaN(cotizados)) {
    return res.status(400).json({
      error: "Por favor, ingresa los parámetros 'edad' y 'cotizados' en la URL."
    });
  }

  // Lógica para calcular si puede jubilarse
  let puedeJubilarse = false;

  // Condiciones para jubilarse
  if ((edad >= 65 && cotizados >= 15) || (edad >= 63 && cotizados >= 35)) {
    puedeJubilarse = true;
  }

  // Resultado en formato JSON
  res.json({
    puedeJubilarse: puedeJubilarse ? 'Sí' : 'No',
    edad,
    cotizados
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
