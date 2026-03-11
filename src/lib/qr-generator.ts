const BRAND = "EMERGENCY SAFETY QRR";

/**
 * Generate a branded QR canvas.
 * The QR encodes `tel:PHONE` so any phone camera shows
 * "Call +91XXXXXXXXXX" instantly — no app or website needed.
 *
 * @param phone         Emergency contact number (primary)
 * @param vehicleNumber e.g. "MH12AB1234"  (shown on sticker label)
 * @param qrId          Record ID (shown as reference on sticker)
 */
export const generateBrandedQRCanvas = async (
  phone: string,
  vehicleNumber: string,
  qrId: string,
): Promise<HTMLCanvasElement> => {
  const QRCode = (await import("qrcode")).default;

  // Encode tel: URI so camera shows call prompt directly
  const cleanPhone = phone.replace(/\D/g, "");
  const telUri     = `tel:+91${cleanPhone.startsWith("91") ? cleanPhone.slice(2) : cleanPhone.replace(/^0/, "")}`;

  const inner = document.createElement("canvas");
  await (QRCode as any).toCanvas(inner, telUri, {
    width: 280, margin: 2,
    color: { dark: "#1a1a1a", light: "#ffffff" },
    errorCorrectionLevel: "H",
  });

  const c = document.createElement("canvas");
  c.width = 400; c.height = 500;
  const ctx = c.getContext("2d")!;

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 400, 500);

  // Red top stripe
  ctx.fillStyle = "#d25656";
  ctx.fillRect(0, 0, 400, 62);

  // Brand text top
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px 'Rajdhani', Arial";
  ctx.textAlign = "center";
  ctx.fillText(BRAND, 200, 30);
  ctx.font = "11px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText("SCAN TO CALL EMERGENCY CONTACT", 200, 50);

  // QR code
  ctx.drawImage(inner, 60, 72, 280, 280);

  // Corner accent marks
  const mk = "#141111", ms = 20, mt = 3;
  [[60,72],[340-ms,72],[60,352-ms],[340-ms,352-ms]].forEach(([x,y]) => {
    ctx.fillStyle = mk;
    ctx.fillRect(x, y, ms, mt);
    ctx.fillRect(x, y, mt, ms);
    ctx.fillRect(x+ms-mt, y, mt, ms);
    ctx.fillRect(x, y+ms-mt, ms, mt);
  });

  // Phone icon + number label — the key info
  ctx.fillStyle = "#111827";
  ctx.font = "bold 14px 'Rajdhani', Arial";
  ctx.fillText("📞 SCAN TO CALL INSTANTLY", 200, 374);

  // Masked phone shown on sticker for reference
  const masked = phone.replace(/(\d{2})\d{6}(\d{2})/, "$1XXXXXX$2");
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#dc2626";
  ctx.fillText(masked, 200, 394);

  // Vehicle number
  ctx.fillStyle = "#374151";
  ctx.font = "bold 13px 'Rajdhani', Arial";
  ctx.fillText(`Vehicle: ${vehicleNumber}`, 200, 414);

  // Bottom strip
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(0, 428, 400, 72);
  ctx.fillStyle = "#6b7280";
  ctx.font = "10px Arial";
  ctx.fillText(`REF: ${qrId.slice(-10).toUpperCase()}`, 200, 448);
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 11px Arial";
  ctx.fillText("EMERGENCY SAFETY QRR  •  emergencysafetyqrr.in", 200, 468);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "9px Arial";
  ctx.fillText("Powered by Emergency Safety QRR — India", 200, 488);

  return c;
};

export const downloadQRAsPNG = async (phone: string, vehicleNumber: string, qrId: string) => {
  const c = await generateBrandedQRCanvas(phone, vehicleNumber, qrId);
  const a = document.createElement("a");
  a.download = `QRR_${vehicleNumber.replace(/\s/g,"_")}.png`;
  a.href     = c.toDataURL("image/png");
  a.click();
};

export const downloadQRAsPDF = async (phone: string, vehicleNumber: string, qrId: string) => {
  try {
    const c   = await generateBrandedQRCanvas(phone, vehicleNumber, qrId);
    const img = c.toDataURL("image/png");
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const iw = 100, ih = (c.height / c.width) * iw;
    pdf.setFontSize(18);
    pdf.setTextColor(220, 38, 38);
    pdf.setFont("helvetica", "bold");
    pdf.text(BRAND, pw / 2, 18, { align: "center" });
    pdf.addImage(img, "PNG", (pw - iw) / 2, 26, iw, ih);
    pdf.setFontSize(9);
    pdf.setTextColor(120);
    pdf.setFont("helvetica", "normal");
    pdf.text("Scan QR to call emergency contact directly", pw / 2, 26 + ih + 8, { align: "center" });
    pdf.text("emergencysafetyqrr.in", pw / 2, 26 + ih + 14, { align: "center" });
    pdf.save(`QRR_${vehicleNumber.replace(/\s/g,"_")}.pdf`);
  } catch {
    await downloadQRAsPNG(phone, vehicleNumber, qrId);
  }
};
