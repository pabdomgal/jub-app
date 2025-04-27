import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));  // Para servir archivos estáticos

// Ruta principal para mostrar el formulario
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Sirve el archivo HTML
});

// Ruta para procesar los datos del formulario
app.post('/calcular-jubilacion', (req, res) => {
    const { edad, cotizados } = req.body;

    // Convertir a números (aunque podría venir como string)
    const edadNum = parseInt(edad, 10);
    const cotizadosNum = parseInt(cotizados, 10);

    let puedeJubilarse = false;

    // Lógica de jubilación (puedes adaptarla)
    if ((edadNum >= 65 && cotizadosNum >= 15) || (edadNum >= 63 && cotizadosNum >= 35)) {
        puedeJubilarse = true;
    }

    // Enviar la respuesta al frontend
    res.json({
        puedeJubilarse: puedeJubilarse ? 'Sí' : 'No',
        edad: edadNum,
        cotizados: cotizadosNum
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
