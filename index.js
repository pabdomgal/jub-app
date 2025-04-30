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

// Rutas
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
    const diasEnMesAnterior = new Date(fin.getFullYear(), fin.getMonth(), 0).getDate();
    dias += diasEnMesAnterior;
  }

  if (meses < 0) {
    años--;
    meses += 12;
  }

  return { años, meses, dias };
}

function convertirACotizacion({ anios, meses, dias }) {
  const base = new Date(2000, 0, 1);
  const final = sumarTiempo(base, { años: anios, meses, dias });
  return Math.floor((final - base) / (1000 * 60 * 60 * 24));
}

app.post('/calcular-jubilacion', (req, res) => {
  try {
    const {
      cotizacionTotal,
      cotizacionPolicia,
      fechaActual,
      fechaNacimiento
    } = req.body;

    const fechaHoy = new Date(
      Number(fechaActual.anio),
      Number(fechaActual.mes) - 1,
      Number(fechaActual.dia)
    );

    const nacimiento = new Date(
      Number(fechaNacimiento.anio),
      Number(fechaNacimiento.mes) - 1,
      Number(fechaNacimiento.dia)
    );

    const diasTotales = convertirACotizacion(cotizacionTotal);
    const diasPolicia = convertirACotizacion(cotizacionPolicia);
    const bonificacion = Math.floor(diasPolicia * 0.2);
    const maxAnticipacion = Math.min(5, Math.floor(bonificacion / 365));
    const tiene36y6Policia = (cotizacionPolicia.anios * 12 + cotizacionPolicia.meses) >= 438;

    const totalCotizadosMeses = cotizacionTotal.anios * 12 + cotizacionTotal.meses;
    const añoEvaluado = fechaHoy.getFullYear();
    let edadOrdinaria;

    if (añoEvaluado < 2027) {
      if (totalCotizadosMeses >= 459) {
        edadOrdinaria = { años: 65, meses: 0 };
      } else if (añoEvaluado === 2025) {
        edadOrdinaria = { años: 66, meses: 8 };
      } else {
        edadOrdinaria = { años: 66, meses: 10 };
      }
    } else {
      if (totalCotizadosMeses >= 462) {
        edadOrdinaria = { años: 65, meses: 0 };
      } else {
        edadOrdinaria = { años: 67, meses: 0 };
      }
    }

    const anticipacionPermitida = tiene36y6Policia ? 6 : maxAnticipacion;
    const edadAnticipada = {
      años: edadOrdinaria.años - anticipacionPermitida,
      meses: edadOrdinaria.meses
    };

    let fechaEvaluada = new Date(fechaHoy);
    let encontrada = false;
    let fechaJubilacionFinal = null;

    while (!encontrada) {
      const edad = diferenciaFechas(nacimiento, fechaEvaluada);
      const cotizadosHastaHoy = diferenciaFechas(nacimiento, fechaEvaluada);
      const diasCotizados = convertirACotizacion(cotizadosHastaHoy) + bonificacion;

      // Determinar si cumple la edad ordinaria
      const edadOrdinariaCumplida = (
        edad.años > edadOrdinaria.años ||
        (edad.años === edadOrdinaria.años && edad.meses >= edadOrdinaria.meses)
      );

      // Determinar si cumple la edad anticipada
      const edadAnticipadaCumplida = (
        edad.años > edadAnticipada.años ||
        (edad.años === edadAnticipada.años && edad.meses >= edadAnticipada.meses)
      );

      if ((edadOrdinariaCumplida || edadAnticipadaCumplida) && diasCotizados >= diasTotales) {
        encontrada = true;
        fechaJubilacionFinal = new Date(fechaEvaluada);
        break;
      }

      fechaEvaluada.setDate(fechaEvaluada.getDate() + 1); // Avanza un día
    }

    const edadFinal = diferenciaFechas(nacimiento, fechaJubilacionFinal);

    res.json({
      fechaJubilacion: fechaJubilacionFinal.toISOString().split('T')[0],
      edadEnJubilacion: edadFinal,
      bonificacionDias: bonificacion,
      edadOrdinaria,
      edadJubilacionAnticipada: edadAnticipada
    });

  } catch (error) {
    console.error("Error interno:", error);
    res.status(500).json({ error: "Error interno en el cálculo. Revisa los datos ingresados." });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
