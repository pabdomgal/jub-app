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
    fechaActual, // { dia, mes, año }
    fechaNacimiento // { dia, mes, año }
  } = req.body;

  const diasTotales = (cotizacion) => 
    cotizacion.años * 365 + cotizacion.meses * 30 + cotizacion.dias;

  const diasCotizadosTotal = diasTotales(cotizacionTotal);
  const diasPolicia = diasTotales(cotizacionPolicia);

  // Bonificación: 20% de los días como policía
  const bonificacionDias = Math.floor(diasPolicia * 0.2);

  // Calcular años cotizados totales para reglas
  const totalañosCotizados = diasCotizadosTotal / 365;
  const añosPolicia = diasPolicia / 365;

  // Calcular fecha de jubilación ordinaria según REGLAS
  const fechaActualDate = new Date(fechaActual.año, fechaActual.mes - 1, fechaActual.dia);
  const nacimientoDate = new Date(fechaNacimiento.año, fechaNacimiento.mes - 1, fechaNacimiento.dia);

  let edadOrdinaria; // en años y meses
  const añoEvaluado = fechaActual.año;

  if (añoEvaluado < 2027) {
    if (totalañosCotizados >= 38 + 3 / 12) {
      edadOrdinaria = { años: 65, meses: 0 };
    } else {
      edadOrdinaria = añoEvaluado === 2025 ? { años: 66, meses: 8 } : { años: 66, meses: 10 };
    }
  } else {
    if (totalañosCotizados >= 38.5) {
      edadOrdinaria = { años: 65, meses: 0 };
    } else {
      edadOrdinaria = { años: 67, meses: 0 };
    }
  }

  // Calcular cuántos años puede adelantar
  let maxAnticipacion = 0;
  if (añosPolicia >= 36.5) {
    maxAnticipacion = 6;
  } else {
    maxAnticipacion = Math.min(5, bonificacionDias / 365);
  }

  const edadJubilacionAnticipada = {
    años: Math.floor(edadOrdinaria.años - maxAnticipacion),
    meses: edadOrdinaria.meses
  };

  // Calcular la fecha de jubilación anticipada
  const fechaJubilacion = new Date(nacimientoDate);
  fechaJubilacion.setFullYear(fechaJubilacion.getFullYear() + edadJubilacionAnticipada.años);
  fechaJubilacion.setMonth(fechaJubilacion.getMonth() + edadJubilacionAnticipada.meses);

  // Edad que tendrá en la fecha de jubilación
  const edadFinalMs = fechaJubilacion - nacimientoDate;
  const edadFinalDate = new Date(edadFinalMs);

  const edadFinal = {
    años: fechaJubilacion.getFullYear() - nacimientoDate.getFullYear(),
    meses: fechaJubilacion.getMonth() - nacimientoDate.getMonth(),
    dias: fechaJubilacion.getDate() - nacimientoDate.getDate()
  };

  if (edadFinal.dias < 0) {
    edadFinal.meses -= 1;
    edadFinal.dias += 30;
  }

  if (edadFinal.meses < 0) {
    edadFinal.años -= 1;
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
