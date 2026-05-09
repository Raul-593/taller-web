import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const generateMaintenancePDF = (mantenimiento: any) => {
    const doc = new jsPDF()
    
    // --- CABECERA ---
    // LOGO BASADO EN TEXTO
    doc.setFont("helvetica", "bold")
    doc.setFontSize(24)
    doc.setTextColor(0, 0, 0) // Negro para "593 Cycling"
    doc.text("593 Cycling", 15, 20)
    
    const cyclingWidth = doc.getTextWidth("593 Cycling ")
    doc.setTextColor(220, 38, 38) // Rojo (#dc2626) para "Studio"
    doc.text("Studio", 15 + cyclingWidth, 20)

    /* 
    PARA AGREGAR LOGO DE IMAGEN:
    const imgData = 'data:image/png;base64,...'; // O cargar desde URL
    doc.addImage(imgData, 'PNG', 150, 10, 40, 40); 
    */

    // INFO DEL TALLER
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.setFont("helvetica", "normal")
    doc.text("Orden de Trabajo", 15, 28)
    doc.text("Fecha de impresión: " + new Date().toLocaleDateString(), 15, 33)

    // LÍNEA DIVISORIA
    doc.setDrawColor(230, 230, 230)
    doc.line(15, 38, 195, 38)

    // --- INFORMACIÓN DEL CLIENTE Y BICICLETA ---
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("INFORMACIÓN GENERAL", 15, 48)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    const customer = mantenimiento.bicycles?.customers?.name || "N/A"
    const bike = `${mantenimiento.bicycles?.brand || ""} - ${mantenimiento.bicycles?.model || ""}`.trim() || "N/A"
    
    doc.text(`Cliente: ${customer}`, 15, 55)
    doc.text(`Bicicleta: ${bike}`, 15, 60)
    doc.text(`Fecha de Servicio: ${mantenimiento.service_date || "N/A"}`, 120, 55)
    doc.text(`Estado: ${mantenimiento.status?.toUpperCase() || "N/A"}`, 120, 60)

    // --- DESCRIPCIÓN ---
    doc.setFont("helvetica", "bold")
    doc.text("Descripción del trabajo:", 15, 72)
    doc.setFont("helvetica", "normal")
    const splitDescription = doc.splitTextToSize(mantenimiento.description || "Sin descripción", 180)
    doc.text(splitDescription, 15, 78)

    // --- TABLA DE ITEMS ---
    const tableTop = 95
    const items = mantenimiento.maintenance_items || []
    
    const tableBody = items.map((item: any) => [
        item.description || "N/A",
        item.quantity || 1,
        `$${item.unit_price?.toFixed(2) || "0.00"}`,
        `$${(item.quantity * item.unit_price)?.toFixed(2) || "0.00"}`
    ])

    autoTable(doc, {
        startY: tableTop,
        head: [['Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
        body: tableBody,
        theme: 'striped',
        headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 30, halign: 'right' },
            3: { cellWidth: 30, halign: 'right' }
        }
    })

    // --- RESUMEN DE COSTOS ---
    const finalY = (doc as any).lastAutoTable?.finalY || (tableTop + (items.length * 10) + 20)
    
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`TOTAL A PAGAR: $${mantenimiento.cost?.toFixed(2) || "0.00"}`, 140, finalY + 10)

    // --- OBSERVACIONES ---
    if (mantenimiento.observation) {
        doc.setFontSize(10)
        doc.text("Observaciones:", 15, finalY + 10)
        doc.setFont("helvetica", "italic")
        const splitObs = doc.splitTextToSize(mantenimiento.observation, 180)
        doc.text(splitObs, 15, finalY + 16)
    }

    // --- PIE DE PÁGINA ---
    const pageHeight = doc.internal.pageSize.height
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text("Gracias por confiar en 593 Cycling Studio", 105, pageHeight - 15, { align: 'center' })
    doc.text("Este documento es una orden de trabajo informativa.", 105, pageHeight - 10, { align: 'center' })

    // GUARDAR PDF
    doc.save(`${mantenimiento.bicycles?.customers?.name || "Mantenimiento"}|${mantenimiento.bicycles?.brand || ""}-${mantenimiento.bicycles?.model || ""}.pdf`)
}
