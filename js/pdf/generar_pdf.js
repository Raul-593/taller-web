// Generar PDF de la orden de trabajo del mantenimiento de la bicicleta
export function generarPDFMantenimiento(mantenimiento) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const marginLeft = 20;
  let y = 20;

  const fechaEmision = new Date();
  const fechaFormateada = fechaEmision.toLocaleDateString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const logoUrl = 'image/logoCyclingStudio.jpg';
  const img = new Image();
  img.src = logoUrl;

  img.onload = () => {
    doc.addImage(img, 'JPG', marginLeft, y, 30, 30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Orden de Trabajo - Servicio de Bicicleta', 60, y + 10);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de emisión: ${fechaFormateada}`, marginLeft, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    y += 40;

    // Datos Bicicleta
    doc.setFillColor(240, 240, 240);
    doc.rect(marginLeft, y, 170, 10, 'F');
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text('Datos de la Bicicleta', marginLeft + 2, y + 7);
    y += 15;

    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(`Marca: ${mantenimiento.brand || '-'}`, marginLeft, y);
    y += 7;
    doc.text(`Modelo: ${mantenimiento.model || '-'}`, marginLeft, y);
    y += 15;

    // Detalle del mantenimiento
    doc.setFillColor(240, 240, 240);
    doc.rect(marginLeft, y, 170, 10, 'F');
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text('Detalle del Mantenimiento', marginLeft + 2, y + 7);
    y += 15;

    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(`Fecha del servicio: ${mantenimiento.service_date}`, marginLeft, y);
    y += 7;
    doc.text(`Descripción:`, marginLeft, y);
    y += 6;

    const descripcion = doc.splitTextToSize(mantenimiento.description, 170);
    doc.text(descripcion, marginLeft + 5, y);
    y += descripcion.length * 6;

    doc.text(`Costo: $${mantenimiento.cost}`, marginLeft, y);
    y += 7;

    doc.text(`Observación:`, marginLeft, y);
    y += 6;

    const observacion = doc.splitTextToSize(mantenimiento.observation || 'Sin observación', 170);
    doc.text(observacion, marginLeft + 5, y);
    y += observacion.length * 6;

    // Footer
    y += 5;
    doc.setTextColor(150);
    doc.text('Gracias por confiar en Cycling Studio.', marginLeft, y);
    y += 5;
    doc.text('Este documento es una constancia de servicio técnico de mantenimiento.', marginLeft, y);

    doc.save(`orden_trabajo_${mantenimiento.brand}.pdf`);
  };
}
