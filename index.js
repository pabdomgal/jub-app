function sumarTiempo(fecha, años = 0, meses = 0, dias = 0) {
  let nuevaFecha = new Date(fecha);
  nuevaFecha.setFullYear(nuevaFecha.getFullYear() + años);
  nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
  nuevaFecha.setDate(nuevaFecha.getDate() + dias);
  return nuevaFecha;
}

function calcularDiasTotales(años, meses, dias) {
  return (años * 365) + (meses * 30) + dias;
}

function diasABloque(dias) {
  const anios = Math.floor(dias / 365);
  dias %= 365;
  const meses = Math.floor(dias / 30);
  const diasRestantes = dias % 30;
  return { anios, meses, dias: diasRestantes };
}

function calcularJubilacion(fechaNacimiento, fechaReferencia, cotizacionTotal, cotizacionPolicia) {
  const fechaRef = new Date(fechaReferencia);
  const nacimiento = new Date(fechaNacimiento);

  const diasCotizados = calcularDiasTotales(cotizacionTotal.anios, cotizacionTotal.meses, cotizacionTotal.dias);
  const diasPolicia = calcularDiasTotales(cotizacionPolicia.anios, cotizacionPolicia.meses, cotizacionPolicia.dias);
  const diasBonificacion = Math.floor(diasPolicia * 0.20);

  const añoReferencia = fechaRef.getFullYear();
  let edadOrdinaria;

  if (añoReferencia <= 2026) {
    edadOrdinaria = diasCotizados >= calcularDiasTotales(38, 3, 0)
      ? { años: 65, meses: 0 }
      : { años: 66, meses: 10 };
  } else {
    edadOrdinaria = diasCotizados >= calcularDiasTotales(38, 6, 0)
      ? { años: 65, meses: 0 }
      : { años: 67, meses: 0 };
  }

  const fechaJubilacionOrdinaria = sumarTiempo(nacimiento, edadOrdinaria.años, edadOrdinaria.meses, 0);

  let anticipacionPermitida;
  if (diasPolicia >= calcularDiasTotales(36, 6, 0)) {
    anticipacionPermitida = calcularDiasTotales(6, 0, 0);
  } else {
    anticipacionPermitida = Math.min(calcularDiasTotales(5, 0, 0), diasBonificacion);
  }

  const fechaJubilacionAnticipada = new Date(fechaJubilacionOrdinaria);
  fechaJubilacionAnticipada.setDate(fechaJubilacionAnticipada.getDate() - anticipacionPermitida);

  const edadJubilacionDias = Math.floor((fechaJubilacionAnticipada - nacimiento) / (1000 * 60 * 60 * 24));
  const edadEnJubilacion = diasABloque(edadJubilacionDias);

  return {
    fechaJubilacion: fechaJubilacionAnticipada.toLocaleDateString(),
    edadEnJubilacion,
    bonificacionDias: diasBonificacion,
    edadOrdinaria,
    edadJubilacionAnticipada: diasABloque(anticipacionPermitida)
  };
}

document.getElementById('jubilacionForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const data = {
    cotizacionTotal: {
      anios: +document.getElementById('ct_anios').value,
      meses: +document.getElementById('ct_meses').value,
      dias: +document.getElementById('ct_dias').value
    },
    cotizacionPolicia: {
      anios: +document.getElementById('cp_anios').value,
      meses: +document.getElementById('cp_meses').value,
      dias: +document.getElementById('cp_dias').value
    },
    fechaActual: new Date(
      +document.getElementById('fa_anio').value,
      +document.getElementById('fa_mes').value - 1,
      +document.getElementById('fa_dia').value
    ),
    fechaNacimiento: new Date(
      +document.getElementById('fn_anio').value,
      +document.getElementById('fn_mes').value - 1,
      +document.getElementById('fn_dia').value
    )
  };

  const resultado = calcularJubilacion(
    data.fechaNacimiento,
    data.fechaActual,
    data.cotizacionTotal,
    data.cotizacionPolicia
  );

  document.getElementById('result').innerHTML = `
    <p><strong>Fecha de Jubilación:</strong> ${resultado.fechaJubilacion}</p>
    <p><strong>Edad en la fecha de jubilación:</strong> ${resultado.edadEnJubilacion.anios} años, ${resultado.edadEnJubilacion.meses} meses, ${resultado.edadEnJubilacion.dias} días</p>
    <p><strong>Días de Bonificación:</strong> ${resultado.bonificacionDias}</p>
    <p><strong>Edad Ordinaria:</strong> ${resultado.edadOrdinaria.años} años, ${resultado.edadOrdinaria.meses} meses</p>
    <p><strong>Anticipación Aplicada:</strong> ${resultado.edadJubilacionAnticipada.anios} años, ${resultado.edadJubilacionAnticipada.meses} meses</p>
  `;
});
