import jsPDF from "jspdf";
// qrcode does not ship TypeScript declarations in this project.
// @ts-expect-error Missing declaration file for the qrcode package.
import QRCode from "qrcode";
import { Prescription } from "@/types/prescription";

/**
 * ✅ FIX: single source of truth for the QR payload.
 * Both the on-screen QR (details page) and the downloaded PDF now call this
 * function, so scanning either one shows the SAME, real prescription data.
 */
export function buildQrPayload(p: Prescription): string {
  const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-";
  return [
    `PRESCRIPTION:${p.prescriptionNumber}`,
    `PATIENT:${p.patientName || "-"}`,
    `DOCTOR:${p.doctorName || "-"}`,
    `DATE:${date}`,
    `STATUS:${p.status || "ACTIVE"}`,
    "VERIFY:HEALTHBRIDGE",
  ].join("\n");
}

// Palette kept in sync with the app's Tailwind theme
const BRAND: [number, number, number] = [37, 99, 235];
const SLATE_900: [number, number, number] = [15, 23, 42];
const SLATE_500: [number, number, number] = [100, 116, 139];
const SLATE_200: [number, number, number] = [226, 232, 240];
const SLATE_100: [number, number, number] = [241, 245, 249];
const EMERALD_50: [number, number, number] = [236, 253, 245];
const EMERALD_700: [number, number, number] = [4, 120, 87];
const WHITE: [number, number, number] = [255, 255, 255];

/**
 * ✅ FIX: proper single-page prescription PDF, generated entirely in the browser.
 * Includes Doctor's Hospital/Branch name as requested.
 */
export async function generatePrescriptionPdf(prescription: Prescription, doctorBranch?: string): Promise<void> {
  const qrPayload = buildQrPayload(prescription);
  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    margin: 4, // ✅ Fixed: minimum 4-module quiet zone for reliable scanning
    width: 320,
    errorCorrectionLevel: "H",
  });

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let y = 50;

  // ---------- Header ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...BRAND);
  doc.text("HealthBridge", marginX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...SLATE_500);
  doc.text("Electronic Prescription", marginX, y + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BRAND);
  doc.text(prescription.prescriptionNumber, pageWidth - marginX, y, { align: "right" });

  doc.setFontSize(8);
  doc.setTextColor(...EMERALD_700);
  doc.text((prescription.status || "ACTIVE").toUpperCase(), pageWidth - marginX, y + 16, { align: "right" });

  y += 30;
  doc.setDrawColor(...SLATE_200);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 24;

  // ---------- Info blocks + QR ----------
  const qrSize = 120;
  const gap = 16;
  const infoAreaWidth = pageWidth - marginX * 2 - qrSize - gap;
  const colWidth = (infoAreaWidth - gap) / 2;
  const col1X = marginX;
  const col2X = marginX + colWidth + gap;
  const qrX = pageWidth - marginX - qrSize;
  
  // ✅ Increased blockHeight to 110 to comfortably fit 3 rows
  const blockHeight = 110;

  const infoBlock = (x: number, labels: string[], values: (string | undefined)[]) => {
    doc.setFillColor(...SLATE_100);
    doc.roundedRect(x, y, colWidth, blockHeight, 6, 6, "F");
    let ly = y + 16; // ✅ Adjusted starting Y for better vertical spacing
    labels.forEach((label, i) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...SLATE_500);
      doc.text(label, x + 12, ly);
      doc.setFontSize(10.5);
      doc.setTextColor(...SLATE_900);
      doc.text(values[i] || "-", x + 12, ly + 14, { maxWidth: colWidth - 24 });
      ly += 28; // ✅ Adjusted row height
    });
  };

  infoBlock(col1X, ["PATIENT", "PHONE", "DIAGNOSIS"], [
    prescription.patientName,
    prescription.patientPhone,
    prescription.diagnosis,
  ]);

  // ✅ ADDED: Hospital / Branch name to the PDF
  infoBlock(col2X, ["PRESCRIBED BY", "HOSPITAL / BRANCH", "DATE ISSUED"], [
    prescription.doctorName,
    doctorBranch || "Health Bridge Hospital",
    prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : "-",
  ]);

  doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...SLATE_500);
  doc.text("Scan to verify", qrX + qrSize / 2, y + qrSize + 12, { align: "center" });

  y += blockHeight + 24;

  // ---------- Medicines table ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...SLATE_900);
  doc.text("Prescribed Medicines", marginX, y);
  y += 14;

  const tableX = marginX;
  const tableWidth = pageWidth - marginX * 2;
  const colWidths = [24, tableWidth * 0.32, tableWidth * 0.15, tableWidth * 0.19, tableWidth * 0.15, 0];
  colWidths[5] = tableWidth - colWidths.slice(0, 5).reduce((a, b) => a + b, 0);

  const headers = ["#", "Medicine", "Dosage", "Frequency", "Duration", "Qty"];
  let hx = tableX;
  doc.setFillColor(...BRAND);
  doc.rect(tableX, y, tableWidth, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  headers.forEach((h, i) => {
    doc.text(h, hx + 6, y + 14);
    hx += colWidths[i];
  });
  y += 22;

  prescription.items.forEach((item, idx) => {
    const hasInstructions = !!item.instructions;
    const rowHeight = hasInstructions ? 34 : 22;

    if (y + rowHeight > doc.internal.pageSize.getHeight() - 80) {
      doc.addPage();
      y = 50;
    }

    const shaded = idx % 2 === 0;
    doc.setFillColor(...(shaded ? SLATE_100 : WHITE));
    doc.rect(tableX, y, tableWidth, rowHeight, "F");
    doc.setDrawColor(...SLATE_200);
    doc.rect(tableX, y, tableWidth, rowHeight);

    let cx = tableX;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...SLATE_900);
    doc.text(String(idx + 1), cx + 6, y + 14);
    cx += colWidths[0];

    doc.setFont("helvetica", "bold");
    doc.text(item.medicineName || "-", cx + 6, y + 14, { maxWidth: colWidths[1] - 12 });
    if (hasInstructions) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...SLATE_500);
      doc.text(item.instructions, cx + 6, y + 27, { maxWidth: colWidths[1] - 12 });
    }
    cx += colWidths[1];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...SLATE_900);
    doc.text(item.dosage || "-", cx + 6, y + 14, { maxWidth: colWidths[2] - 12 });
    cx += colWidths[2];

    doc.text(item.frequency || "-", cx + 6, y + 14, { maxWidth: colWidths[3] - 12 });
    cx += colWidths[3];

    doc.text(item.duration || "-", cx + 6, y + 14, { maxWidth: colWidths[4] - 12 });
    cx += colWidths[4];

    doc.text(String(item.quantity ?? "-"), cx + 6, y + 14);

    y += rowHeight;
  });

  y += 20;

  // ---------- Notes ----------
  if (prescription.notes) {
    const notesLines = doc.splitTextToSize(prescription.notes, tableWidth - 24);
    const notesHeight = 34 + notesLines.length * 12;

    if (y + notesHeight > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      y = 50;
    }

    doc.setFillColor(...EMERALD_50);
    doc.roundedRect(tableX, y, tableWidth, notesHeight, 6, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...EMERALD_700);
    doc.text("Doctor's Notes", tableX + 12, y + 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...SLATE_900);
    doc.text(notesLines, tableX + 12, y + 34);
    y += notesHeight + 16;
  }

  // ---------- Footer ----------
  if (y > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage();
    y = 50;
  }
  doc.setDrawColor(...SLATE_200);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 14;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...SLATE_500);
  const footerText = `This is a digitally generated e-prescription issued via HealthBridge. Scan the QR code above to verify its authenticity. Generated on ${new Date().toLocaleDateString()}.`;
  doc.text(doc.splitTextToSize(footerText, tableWidth), marginX, y);

  doc.save(`Prescription-${prescription.prescriptionNumber}.pdf`);
}