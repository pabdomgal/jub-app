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

app.post('/calcular-jubilacion', (req, res) => {
  const {
    cotizacionTotal, // { años, meses, dias }
    cotizacionPolicia, // { años, meses, dias }
    fechaActual, // { dia, mes, anio }
    fechaNacimiento // { dia, mes, anio }
  } = req.body;

  const diasTotales = (cotizacion) => 
    cotizacion.anios * 365 + cotizacion.meses * 30 + cotizacion.dias;

  const diasCotizadosTotal = diasTotales(cotizacionTotal);
  const diasPolicia = diasTotales(cotizacionPolicia);

  // Bonificación: 20% de los días como policía
  const bonificacionDias = Math.floor(diasPolicia * 0.2);

  // Calcular años cotizados totales para reglas
  const totalAniosCotizados = diasCotizadosTotal / 365;
  const aniosPolicia = diasPolicia / 365;

  // Calcular fecha de jubilación ordinaria según REGLAS
  const fechaActualDate = new Date(fechaActual.anio, fechaActual.mes - 1, fechaActual.dia);
  const nacimientoDate = new Date(fechaNacimiento.anio, fechaNacimiento.mes - 1, fechaNacimiento.dia);

  let edadOrdinaria; // en años y meses
  const anioEvaluado = fechaActual.anio;

  if (anioEvaluado < 2027) {
    if (totalAniosCotizados >= 38 + 3 / 12) {
      edadOrdinaria = { anios: 65, meses: 0 };
    } else {
      edadOrdinaria = anioEvaluado === 2025 ? { anios: 66, meses: 8 } : { anios: 66, meses: 10 };
    }
  } else {
    if (totalAniosCotizados >= 38.5) {
      edadOrdinaria = { anios: 65, meses: 0 };
    } else {
      edadOrdinaria = { anios: 67, meses: 0 };
    }
  }

  // Calcular cuántos años puede adelantar
  let maxAnticipacion = 0;
  if (aniosPolicia >= 36.5) {
    maxAnticipacion = 6;
  } else {
    maxAnticipacion = Math.min(5, bonificacionDias / 365);
  }

  const edadJubilacionAnticipada = {
    anios: Math.floor(edadOrdinaria.anios - maxAnticipacion),
    meses: edadOrdinaria.meses
  };

  // Calcular la fecha de jubilación anticipada
  const fechaJubilacion = new Date(nacimientoDate);
  fechaJubilacion.setFullYear(fechaJubilacion.getFullYear() + edadJubilacionAnticipada.anios);
  fechaJubilacion.setMonth(fechaJubilacion.getMonth() + edadJubilacionAnticipada.meses);

  // Edad que tendrá en la fecha de jubilación
  const edadFinalMs = fechaJubilacion - nacimientoDate;
  const edadFinalDate = new Date(edadFinalMs);

  const edadFinal = {
    anios: fechaJubilacion.getFullYear() - nacimientoDate.getFullYear(),
    meses: fechaJubilacion.getMonth() - nacimientoDate.getMonth(),
    dias: fechaJubilacion.getDate() - nacimientoDate.getDate()
  };

  if (edadFinal.dias < 0) {
    edadFinal.meses -= 1;
    edadFinal.dias += 30;
  }

  if (edadFinal.meses < 0) {
    edadFinal.anios -= 1;
    edadFinal.meses += 12;
  }

  res.json({
    fechaJubilacion: fechaJubilacion.toISOString().split('T')[0],
    edadEnJubilacion: edadFinal,
    bonificacionDias,
    edadOrdinaria,
    edadJubilacionAnticipada
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
