
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Albaran } from '../types';

export const generatePDF = (albaran: Albaran) => {
  const doc = new jsPDF();
  const primaryColor = [79, 70, 229]; // Indigo-600

  let currentY = 20;

  // Header - Logo
  if (albaran.header.logo) {
    try {
      // Detect format from Data URL (e.g. data:image/png;base64,...)
      const match = albaran.header.logo.match(/^data:image\/([a-zA-Z+]+);base64,/);
      const format = match ? match[1].toUpperCase() : 'PNG';
      
      // Render logo. Banner style usually looks good at ~45mm wide.
      doc.addImage(albaran.header.logo, format, 20, 15, 45, 20, undefined, 'FAST');
      currentY = 40; // Push content down
    } catch (e) {
      console.error("Error rendering logo in PDF:", e);
    }
  }

  // Header - Emisor (Company Info)
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(albaran.header.name, 20, currentY);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFont('helvetica', 'normal');
  doc.text([
    albaran.header.address,
    `NIF: ${albaran.header.taxId}`,
    `Tel: ${albaran.header.phone} | ${albaran.header.email}`
  ], 20, currentY + 6);

  // Document Title & Number (Top Right)
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFont('helvetica', 'bold');
  doc.text('ALBARÁN', 200, 25, { align: 'right' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº: ${albaran.number}`, 200, 32, { align: 'right' });
  doc.text(`Fecha: ${albaran.date}`, 200, 38, { align: 'right' });

  // Customer Data Box
  const boxY = Math.max(currentY + 25, 50);
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(20, boxY, 170, 35, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('DESTINATARIO', 25, boxY + 7);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(albaran.customer.name, 25, boxY + 14);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text([
    albaran.customer.address,
    `NIF: ${albaran.customer.taxId}`,
    `Tel: ${albaran.customer.phone} | ${albaran.customer.email}`
  ], 25, boxY + 19);

  // Define Table Columns Dynamically
  const tableHeaders = ['Producto', 'Peso Neto', 'Lote'];
  if (albaran.extraColumnNames) {
    tableHeaders.push(...albaran.extraColumnNames);
  }
  tableHeaders.push('Cant.');
  
  if (!albaran.hidePrices) {
    tableHeaders.push('Precio Unit.', 'Total');
  }

  // Define Table Rows
  const tableRows = albaran.items.map(item => {
    const row: string[] = [item.product, item.netWeight, item.lot];
    if (albaran.extraColumnNames) {
      albaran.extraColumnNames.forEach(col => {
        row.push(item.customFields?.[col] || '-');
      });
    }
    row.push(item.quantity.toString());
    if (!albaran.hidePrices) {
      row.push(`${item.price.toFixed(2)} €`, `${item.total.toFixed(2)} €`);
    }
    return row;
  });

  // Correct way to call autoTable in ESM
  autoTable(doc, {
    startY: boxY + 45,
    head: [tableHeaders],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor as [number, number, number],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { 
      fontSize: 9,
      cellPadding: 4,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
    }
  });

  // Get final Y from the last table
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Totals Section (Only if prices are not hidden)
  if (!albaran.hidePrices) {
    // Check if we need a new page for totals and notes
    if (finalY > 250) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text('Subtotal:', 140, finalY);
    doc.text(`${albaran.subtotal.toFixed(2)} €`, 190, finalY, { align: 'right' });

    doc.text(`IVA (${(albaran.taxRate * 100).toFixed(0)}%):`, 140, finalY + 7);
    doc.text(`${albaran.taxAmount.toFixed(2)} €`, 190, finalY + 7, { align: 'right' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('TOTAL:', 140, finalY + 16);
    doc.text(`${albaran.total.toFixed(2)} €`, 190, finalY + 16, { align: 'right' });
    
    finalY += 30;
  } else {
    finalY += 5;
  }

  // Notes
  if (albaran.notes) {
    // Double check if notes fit
    if (finalY > 260) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES:', 20, finalY);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(albaran.notes, 170);
    doc.text(splitNotes, 20, finalY + 6);
  }

  doc.save(`${albaran.number}.pdf`);
};
