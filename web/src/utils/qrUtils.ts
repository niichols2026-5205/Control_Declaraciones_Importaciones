import QRCode from 'qrcode';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Declaracion } from '../types/types';

/**
 * Obtiene la URL pública para escanear y consultar una declaración
 */
export const getDeclarationQrUrl = (id: string, customBaseUrl?: string): string => {
  let base = customBaseUrl?.trim();
  if (!base) {
    base = window.location.origin;
  }
  // Quitar barras finales
  base = base.replace(/\/+$/, '');
  return `${base}/controlfacturas/consulta/${id}`;
};

/**
 * Formatea la fecha para las etiquetas y tarjetas de QR
 */
export const formatShortDate = (isoDate?: string): string => {
  if (!isoDate) return '-';
  try {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return isoDate;
  }
};

/**
 * Limpia caracteres inválidos para nombres de archivo
 */
export const sanitizeFilename = (name?: string): string => {
  if (!name) return 'declaracion';
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim();
};

/**
 * Genera un DataURL simple de solo el código QR
 */
export const generateQRCodeDataUrl = async (
  url: string,
  width: number = 300,
): Promise<string> => {
  return await QRCode.toDataURL(url, {
    width,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
};

/**
 * Genera un Blob PNG de alta resolución con el código QR y los datos de la declaración
 * (Formato listo para rotular cajas o productos)
 */
export const generateDeclarationBadgeBlob = async (
  declaracion: Declaracion,
  customBaseUrl?: string,
): Promise<Blob> => {
  const url = getDeclarationQrUrl(declaracion._id, customBaseUrl);
  const qrDataUrl = await generateQRCodeDataUrl(url, 400);

  const canvas = document.createElement('canvas');
  canvas.width = 650;
  canvas.height = 780;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto de Canvas');
  }

  // Fondo blanco con bordes redondeados
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Borde externo
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Barra de cabecera
  const isImport =
    declaracion.importadoNacional === 'I' ||
    declaracion.importadoNacional?.toLowerCase().includes('imp');

  ctx.fillStyle = isImport ? '#0284c7' : '#15803d';
  ctx.fillRect(10, 10, canvas.width - 20, 60);

  // Texto de cabecera
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    isImport ? 'DECLARACIÓN DE IMPORTACIÓN' : 'DECLARACIÓN NACIONAL',
    canvas.width / 2,
    48,
  );

  // Cargar y dibujar el QR
  const qrImage = new Image();
  await new Promise<void>((resolve, reject) => {
    qrImage.onload = () => resolve();
    qrImage.onerror = err => reject(err);
    qrImage.src = qrDataUrl;
  });

  const qrSize = 380;
  const qrX = (canvas.width - qrSize) / 2;
  const qrY = 85;
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  // Número de declaración destacado
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.textAlign = 'center';
  const numDec = declaracion.numeroDeclaracion || 'S/N';
  ctx.fillText(`No. ${numDec}`, canvas.width / 2, 500);

  // Línea separadora
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(40, 520);
  ctx.lineTo(canvas.width - 40, 520);
  ctx.stroke();

  // Información complementaria
  ctx.textAlign = 'left';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillStyle = '#475569';

  let currentY = 555;
  const lineHeight = 30;

  // Proveedor
  ctx.fillText('Proveedor:', 50, currentY);
  ctx.font = 'normal 18px Arial, sans-serif';
  ctx.fillStyle = '#0f172a';
  const provText = (declaracion.proveedor || '-').substring(0, 32);
  ctx.fillText(provText, 170, currentY);

  currentY += lineHeight;
  // País
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('País:', 50, currentY);
  ctx.font = 'normal 18px Arial, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(declaracion.pais || '-', 170, currentY);

  currentY += lineHeight;
  // Fecha
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Fecha:', 50, currentY);
  ctx.font = 'normal 18px Arial, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(formatShortDate(declaracion.createdAt), 170, currentY);

  // Pie de tarjeta con instrucción de escaneo
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(12, canvas.height - 65, canvas.width - 24, 53);
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 16px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Escanee este código QR para ver datos y documentos completos',
    canvas.width / 2,
    canvas.height - 32,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Error al convertir el Canvas a Blob'));
    }, 'image/png');
  });
};

/**
 * Descarga individualmente la imagen PNG de una declaración
 */
export const downloadSingleQRPng = async (
  declaracion: Declaracion,
  customBaseUrl?: string,
): Promise<void> => {
  const blob = await generateDeclarationBadgeBlob(declaracion, customBaseUrl);
  const filename = `QR_${sanitizeFilename(declaracion.numeroDeclaracion || declaracion._id)}.png`;
  saveAs(blob, filename);
};

/**
 * Exporta de forma masiva los códigos QR a un archivo ZIP con imágenes PNG
 */
export const exportBulkQRToZip = async (
  declaraciones: Declaracion[],
  customBaseUrl?: string,
  onProgress?: (current: number, total: number) => void,
): Promise<void> => {
  if (!declaraciones || declaraciones.length === 0) {
    throw new Error('No hay declaraciones seleccionadas');
  }

  const zip = new JSZip();
  const folder = zip.folder('Codigos_QR_Declaraciones');

  const total = declaraciones.length;
  for (let i = 0; i < total; i++) {
    const dec = declaraciones[i];
    const blob = await generateDeclarationBadgeBlob(dec, customBaseUrl);
    const filename = `QR_${sanitizeFilename(dec.numeroDeclaracion || dec._id)}.png`;
    folder?.file(filename, blob);

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  const zipContent = await zip.generateAsync({ type: 'blob' });
  const today = new Date().toISOString().slice(0, 10);
  saveAs(zipContent, `QRs_Declaraciones_${today}.zip`);
};

/**
 * Genera y descarga un PDF listo para imprimir en planchas de etiquetas
 * Tamaño Carta, 2 columnas x 4 filas = 8 etiquetas por hoja
 */
export const exportBulkQRToStickersPdf = async (
  declaraciones: Declaracion[],
  customBaseUrl?: string,
  onProgress?: (current: number, total: number) => void,
): Promise<void> => {
  if (!declaraciones || declaraciones.length === 0) {
    throw new Error('No hay declaraciones seleccionadas');
  }

  // Dimensiones en mm (Carta: 215.9 x 279.4)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const marginX = 10;
  const marginY = 12;

  const cols = 2;
  const rows = 4;
  const labelsPerPage = cols * rows;

  const labelWidth = (pageWidth - marginX * 2 - 8) / cols; // ~93.9 mm
  const labelHeight = (pageHeight - marginY * 2 - 12) / rows; // ~60.8 mm
  const gapX = 8;
  const gapY = 4;

  const total = declaraciones.length;

  for (let i = 0; i < total; i++) {
    const dec = declaraciones[i];
    const pageIndex = Math.floor(i / labelsPerPage);
    const indexOnPage = i % labelsPerPage;

    if (i > 0 && indexOnPage === 0) {
      doc.addPage();
    }

    const colIndex = indexOnPage % cols;
    const rowIndex = Math.floor(indexOnPage / cols);

    const x = marginX + colIndex * (labelWidth + gapX);
    const y = marginY + rowIndex * (labelHeight + gapY);

    // Fondo y borde redondeado para la etiqueta
    doc.setDrawColor(203, 213, 225); // #cbd5e1
    doc.setLineWidth(0.4);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, labelWidth, labelHeight, 3, 3, 'FD');

    // Cabecera de la etiqueta
    const isImport =
      dec.importadoNacional === 'I' ||
      dec.importadoNacional?.toLowerCase().includes('imp');

    if (isImport) {
      doc.setFillColor(2, 132, 199); // #0284c7
    } else {
      doc.setFillColor(21, 128, 61); // #15803d
    }
    doc.rect(x + 0.4, y + 0.4, labelWidth - 0.8, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    const headerTitle = isImport ? 'DECLARACIÓN IMPORTACIÓN' : 'DECLARACIÓN NACIONAL';
    doc.text(headerTitle, x + labelWidth / 2, y + 4.5, { align: 'center' });

    // Código QR
    const qrUrl = getDeclarationQrUrl(dec._id, customBaseUrl);
    const qrDataUrl = await generateQRCodeDataUrl(qrUrl, 260);

    const qrSize = 34; // mm
    const qrX = x + 3;
    const qrY = y + 8;
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Contenido de texto a la derecha del QR
    const textX = qrX + qrSize + 3;
    let textY = y + 12;

    // No. Declaración
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // #0f172a
    const numDec = dec.numeroDeclaracion || 'S/N';
    doc.text(`No. ${numDec}`, textX, textY);

    // Línea divisoria suave
    textY += 3;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(textX, textY, x + labelWidth - 4, textY);

    // Proveedor
    textY += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Proveedor:', textX, textY);

    textY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const prov = (dec.proveedor || '-').length > 24 ? `${(dec.proveedor || '').slice(0, 24)}...` : dec.proveedor || '-';
    doc.text(prov, textX, textY);

    // País
    textY += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('País:', textX, textY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(dec.pais || '-', textX + 10, textY);

    // Fecha
    textY += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Fecha:', textX, textY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(formatShortDate(dec.createdAt), textX + 12, textY);

    // Franja inferior con pie informativo
    const footerY = y + labelHeight - 5;
    doc.setFillColor(248, 250, 252);
    doc.rect(x + 0.4, footerY - 1, labelWidth - 0.8, 5.6, 'F');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Escanear QR para consultar documentos y detalles', x + labelWidth / 2, footerY + 2.5, {
      align: 'center',
    });

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  doc.save(`Etiquetas_QR_Declaraciones_${today}.pdf`);
};
