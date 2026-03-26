import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function generateQuotationPDF(data: any) {
    const doc = new jsPDF() as any;

    // Header Colors & Styling
    const primaryColor = [37, 99, 235]; // blue-600
    const secondaryColor = [82, 82, 91]; // zinc-600

    // Add Logo / Title
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('AGENCIAS NEW', 10, 25);
    doc.setFontSize(10);
    doc.text('COTIZACIÓN DE SERVICIOS TURÍSTICOS', 10, 32);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`N°- ${data.internalNumber || '0000'}`, 160, 25);
    const now = new Date();
    doc.text(`${now.toLocaleDateString()}`, 160, 32);

    // Client & Details Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Detalles del Cliente', 10, 55);
    doc.line(10, 57, 50, 57);

    doc.setFontSize(10);
    doc.text(`Nombre Titular: ${data.clientName || 'N/A'}`, 10, 65);
    doc.text(`Documento Titular: ${data.clientDocument || 'N/A'}`, 10, 72);
    doc.text(`Pasajero Principal: ${data.paxName || 'N/A'}`, 10, 79);
    doc.text(`Documento Pax: ${data.paxDocument || 'N/A'}`, 10, 86);

    doc.text(`Adultos: ${data.paxAdults}`, 110, 65);
    doc.text(`Niños: ${data.paxChildren}`, 110, 72);
    doc.text(`Noches: ${data.nights || '0'}`, 110, 79);

    // Travel Section
    doc.text('Alojamiento y Fechas', 10, 95);
    doc.line(10, 97, 50, 97);
    doc.text(`Prestadora: ${data.prestadoraName || 'N/A'}`, 10, 105);
    doc.text(`Proveedor: ${data.providerName || 'N/A'}`, 10, 112);
    doc.text(`Check-in: ${data.checkIn}`, 110, 105);
    doc.text(`Check-out: ${data.checkOut}`, 110, 112);

    // Items Table
    const tableData = data.items.map((item: any, idx: number) => [
        idx + 1,
        item.productDescription || 'Servicio',
        item.quantity.toString(),
        `$${item.price.toLocaleString()}`,
        `$${(item.quantity * item.price).toLocaleString()}`
    ]);

    doc.autoTable({
        startY: 125,
        head: [['#', 'Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
        body: tableData,
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Totals Section
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.text('Resumen Económico', 140, finalY);
    doc.line(140, finalY + 2, 190, finalY + 2);

    doc.setFontSize(10);

    let offsetY = 10;
    if (data.taxSummary) {
        Object.entries(data.taxSummary).forEach(([name, amount]: [string, any]) => {
            doc.text(`${name}:`, 140, finalY + offsetY);
            doc.text(`$${parseFloat(amount).toLocaleString()}`, 190, finalY + offsetY, { align: 'right' });
            offsetY += 7;
        });
    } else {
        doc.text(`Revisar Cargos...`, 140, finalY + offsetY);
        offsetY += 7;
    }

    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`TOTAL FINAL:`, 140, finalY + offsetY + 5);
    doc.text(`$${data.totalAmount?.toLocaleString() || '0'} ${data.currency || 'USD'}`, 190, finalY + offsetY + 5, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Esta es una cotización informativa válida por 48 horas.', 105, 280, { align: 'center' });
    doc.text('Agencias New - Tecnología para servicios turísticos.', 105, 285, { align: 'center' });

    doc.save(`cotizacion_${data.internalNumber || 'draft'}.pdf`);
}
