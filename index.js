import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cors());

// Ruta para calcular si puede jubilarse
app.get('/calcular-jubilacion', (req, res) => {
  // Obtenemos los parámetros de la URL
  const edad = parseInt(req.query.edad);
  const cotizados = parseInt(req.query.cotizados);

  // Verificamos si los parámetros son válidos
  if (isNaN(edad) || isNaN(cotizados)) {
    return res.status(400).json({
      error: "Por favor, asegúrese de proporcionar los parámetros 'edad' y 'cotizados'."
    });
  }

  // Determinamos si la persona puede jubilarse
  let puedeJubilarse = false;

  if ((edad >= 65 && cotizados >= 15) || (edad >= 63 && cotizados >= 35)) {
    puedeJubilarse = true;
  }

  // Respondemos con el resultado
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
