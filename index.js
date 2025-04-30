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

// Funciones auxiliares
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

function calcularFechaJubilacionProgresiva({ cotizacionTotal, cotizacionPolicia, fechaActual, fechaNacimiento }) {
  const nacimiento = new Date(fechaNacimiento.año, fechaNacimiento.mes - 1, fechaNacimiento.dia);
  let fecha = new Date(fechaActual.año, fechaActual.mes - 1, fechaActual.dia);

  const diasCotizadosBase = convertirACotizacion(cotizacionTotal);
  const diasPolicia = convertirACotizacion(cotizacionPolicia);
  const bonificacion = Math.floor(diasPolicia * 0.2);
  const diasTotales = diasCotizadosBase + bonificacion;

  while (true) {
    const edad = diferenciaFechas(nacimiento, fecha);
    const añoEvaluado = fecha.getFullYear();
    const totalCotizadosMeses = Math.floor(diasTotales / 30.42); // Aproximación

    // Calcular edad ordinaria
    let edadOrdinaria;
    if (añoEvaluado < 2027) {
      if (totalCotizadosMeses >= 459) {
        edadOrdinaria = { años: 65, meses: 0 };
      } else {
        edadOrdinaria = (añoEvaluado === 2025)
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

    // Calcular edad mínima con anticipación
    const edadMinima = { años: edadOrdinaria.años, meses: edadOrdinaria.meses };
    const añosPolicia = cotizacionPolicia.años + cotizacionPolicia.meses / 12;
    if (añosPolicia >= 36.5) {
      edadMinima.años -= 6;
    } else {
      const maxAnticipacion = Math.min(5, Math.floor(bonificacion / 365));
      edadMinima.años -= maxAnticipacion;
    }

    // Verificar si se cumple edad mínima
    if (
      edad.años > edadMinima.años ||
      (edad.años === edadMinima.años && edad.meses >= edadMinima.meses)
    ) {
      return {
        fechaJubilacion: fecha,
        edadOrdinaria,
        edadAnticipada: edadMinima,
        bonificacion
      };
    }

    // Si no, avanzar un día
    fecha.setDate(fecha.getDate() + 1);
  }
}

app.post('/calcular-jubilacion', (req, res) => {
  try {
    const {
      cotizacionTotal,
      cotizacionPolicia,
      fechaActual,
      fechaNacimiento
    } = req.body;

    const resultado = calcularFechaJubilacionProgresiva({
      cotizacionTotal,
      cotizacionPolicia,
      fechaActual,
      fechaNacimiento
    });

    const nacimiento = new Date(fechaNacimiento.año, fechaNacimiento.mes - 1, fechaNacimiento.dia);
    const edadFinal = diferenciaFechas(nacimiento, resultado.fechaJubilacion);

    res.json({
      fechaJubilacion: resultado.fechaJubilacion.toISOString().split('T')[0],
      edadEnJubilacion: edadFinal,
      bonificacionDias: resultado.bonificacion,
      edadOrdinaria: resultado.edadOrdinaria,
      edadJubilacionAnticipada: resultado.edadAnticipada
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al calcular jubilación' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
