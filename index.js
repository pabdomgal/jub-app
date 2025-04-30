import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function sumarTiempo(fecha, { años = 0, meses = 0, dias = 0 }) {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setFullYear(nuevaFecha.getFullYear() + años);
  nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
  nuevaFecha.setDate(nuevaFecha.getDate() + dias);
  return nuevaFecha;
}

function diferenciaFechas(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  let años = fin.getFullYear() - inicio.getFullYear();
  let meses = fin.getMonth() - inicio.getMonth();
  let dias = fin.getDate() - inicio.getDate();

  if (dias < 0) {
    meses--;
    dias += new Date(fin.getFullYear(), fin.getMonth(), 0).getDate();
  }

  if (meses < 0) {
    años--;
    meses += 12;
  }

  return { años, meses, dias };
}

function convertirACotizacion({ años, meses, dias }) {
  const fechaInicio = new Date(2000, 0, 1);
  const fechaFinal = sumarTiempo(fechaInicio, { años, meses, dias });
  return Math.floor((fechaFinal - fechaInicio) / (1000 * 60 * 60 * 24));
}

app.post('/calcular-jubilacion', (req, res) => {
  const {
    cotizacionTotal, // { años, meses, dias }
    cotizacionPolicia, // { años, meses, dias }
    fechaActual, // { dia, mes, año }
    fechaNacimiento // { dia, mes, año }
  } = req.body;

  const fechaHoy = new Date(fechaActual.anio, fechaActual.mes - 1, fechaActual.dia);
  const nacimiento = new Date(fechaNacimiento.anio, fechaNacimiento.mes - 1, fechaNacimiento.dia);

  const diasTotales = convertirACotizacion(cotizacionTotal);
  const diasPolicia = convertirACotizacion(cotizacionPolicia);
  const bonificacion = Math.floor(diasPolicia * 0.2);

  const totalCotizadosMeses = cotizacionTotal.anios * 12 + cotizacionTotal.meses;
  const totalPoliciaMeses = cotizacionPolicia.anios * 12 + cotizacionPolicia.meses;

  const añoEvaluado = fechaHoy.getFullYear();
  let edadOrdinaria;

  if (añoEvaluado < 2027) {
    if (totalCotizadosMeses >= 459) {
      edadOrdinaria = { años: 65, meses: 0 };
    } else {
      edadOrdinaria = añoEvaluado === 2025
        ? { años: 66, meses: 8 }
        : { años: 66, meses: 10 };
    }
  } else {
    if (totalCotizadosMeses >= 462) {
      edadOrdinaria = { años: 65, meses: 0 };
    } else {
      edadOrdinaria = { años: 67, meses: 0 };
    }
  }

  let maxAnticipacion;
  if (totalPoliciaMeses >= 438) {
    maxAnticipacion = 6;
  } else {
    maxAnticipacion = Math.min(5, Math.floor(bonificacion / 365));
  }

  const edadJubilacionAnticipada = {
    años: edadOrdinaria.años - maxAnticipacion,
    meses: edadOrdinaria.meses
  };

  const fechaJubilacion = sumarTiempo(nacimiento, edadJubilacionAnticipada);
  const edadFinal = diferenciaFechas(nacimiento, fechaJubilacion);

  res.json({
    fechaJubilacion: fechaJubilacion.toISOString().split('T')[0],
    edadEnJubilacion: edadFinal,
    bonificacionDias: bonificacion,
    edadOrdinaria,
    edadJubilacionAnticipada
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
