import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Rasterizes the passport sheet's own on-screen DOM (which already renders Thai text correctly
 * via the browser's normal font rendering) into a downloadable PDF. Trade-off: the PDF is an
 * image, not selectable text — deliberate, see the Phase 7 plan notes on why real Thai font
 * embedding via pdfmake/pdfkit was rejected in favor of this simpler, more reliable approach.
 */
export async function exportPassportPdf(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, { backgroundColor: '#0F172A', scale: 2 });
  const imgData = canvas.toDataURL('image/png');

  const pdfWidth = 210; // A4 portrait, mm
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfWidth, pdfHeight] });
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}
