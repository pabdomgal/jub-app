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

function diasABloque(añosDias) {
    const años = Math.floor(añosDias / 365);
    const restoDias = añosDias % 365;
    const meses = Math.floor(restoDias / 30);
    const dias = restoDias % 30;
    return { años, meses, dias };
}

function calcularJubilacion({
    fechaNacimiento,               // "1970-01-01"
    fechaReferencia,              // "2025-01-01"
    cotizacionTotal,              // { años: 38, meses: 3, dias: 0 }
    cotizacionPolicia             // { años: 36, meses: 6, dias: 0 }
}) {
    const fechaRef = new Date(fechaReferencia);
    const nacimiento = new Date(fechaNacimiento);

    // Calcular días totales de cotización
    const diasCotizados = calcularDiasTotales(cotizacionTotal.años, cotizacionTotal.meses, cotizacionTotal.dias);
    const diasPolicia = calcularDiasTotales(cotizacionPolicia.años, cotizacionPolicia.meses, cotizacionPolicia.dias);

    // Bonificación: 20% de los días como policía
    const diasBonificacion = Math.floor(diasPolicia * 0.20);

    // Calcular edad ordinaria según el año de referencia
    let edadOrdinaria;
    const añoReferencia = fechaRef.getFullYear();

    if (añoReferencia === 2025) {
        edadOrdinaria = diasCotizados >= calcularDiasTotales(38, 3, 0)
            ? { años: 65, meses: 0 }
            : { años: 66, meses: 10 };
    } else if (añoReferencia === 2026) {
        edadOrdinaria = diasCotizados >= calcularDiasTotales(38, 3, 0)
            ? { años: 65, meses: 0 }
            : { años: 66, meses: 10 };
    } else {
        edadOrdinaria = diasCotizados >= calcularDiasTotales(38, 6, 0)
            ? { años: 65, meses: 0 }
            : { años: 67, meses: 0 };
    }

    // Fecha ordinaria de jubilación
    const fechaJubilacionOrdinaria = sumarTiempo(nacimiento, edadOrdinaria.años, edadOrdinaria.meses, 0);

    // ¿Cuántos años antes puede jubilarse?
    let anticipacionPermitida;
    if (diasPolicia >= calcularDiasTotales(36, 6, 0)) {
        anticipacionPermitida = calcularDiasTotales(6, 0, 0); // 6 años
    } else {
        anticipacionPermitida = Math.min(calcularDiasTotales(5, 0, 0), diasBonificacion); // Hasta 5 años o lo que permita la bonificación
    }

    // Restar la anticipación a la fecha ordinaria
    const fechaJubilacionAnticipada = new Date(fechaJubilacionOrdinaria);
    fechaJubilacionAnticipada.setDate(fechaJubilacionAnticipada.getDate() - anticipacionPermitida);

    // Calcular edad en la fecha de jubilación
    const edadJubilacionDias = Math.floor((fechaJubilacionAnticipada - nacimiento) / (1000 * 60 * 60 * 24));
    const edadJubilacion = diasABloque(edadJubilacionDias);

    // Resultado
    console.log("Fecha de jubilación:", fechaJubilacionAnticipada.toDateString());
    console.log("Edad en la jubilación:", `${edadJubilacion.años} años, ${edadJubilacion.meses} meses, ${edadJubilacion.dias} días`);
}

// 🧪 Ejemplo de uso:
calcularJubilacion({
    fechaNacimiento: "1970-01-01",
    fechaReferencia: "2025-01-01",
    cotizacionTotal: { años: 40, meses: 0, dias: 0 },
    cotizacionPolicia: { años: 37, meses: 0, dias: 0 }
});
