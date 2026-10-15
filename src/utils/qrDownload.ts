/**
 * Utility to download Paynet QR Code as a high-quality PNG image
 * Generates the exact card format (Paynet logo, QR Code, instructions, and Card Number)
 */
export const downloadPaynetQrImage = async ({
  qrImageUrl,
  cardNumber,
  cardHolder = 'Sellnex Bosh Administratsiyasi',
  bankName = 'Milliy Bank / Uzcard Humo',
  fileName = 'paynet-qr-code.png',
}: {
  qrImageUrl: string;
  cardNumber: string;
  cardHolder?: string;
  bankName?: string;
  fileName?: string;
}): Promise<boolean> => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    // High resolution dimensions (width: 720px, height: 960px)
    canvas.width = 720;
    canvas.height = 980;

    // 1. Draw smooth white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw outer subtle border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    // 3. Draw Paynet Logo (Green circle + "paynet" text)
    const logoY = 90;
    // Green dot
    ctx.fillStyle = '#00C853';
    ctx.beginPath();
    ctx.arc(260, logoY - 12, 16, 0, Math.PI * 2);
    ctx.fill();

    // "paynet" text
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 52px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('paynet', 290, logoY + 4);

    // 4. Load & draw QR code image
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load QR image'));
      img.src = qrImageUrl;
    });

    // Draw white container with soft border for QR
    const qrBoxSize = 440;
    const qrBoxX = (canvas.width - qrBoxSize) / 2;
    const qrBoxY = 150;

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(qrBoxX - 20, qrBoxY - 20, qrBoxSize + 40, qrBoxSize + 40, 24);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw QR image
    ctx.drawImage(img, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

    // 5. Draw Instruction Text
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Kartaga pul o'tkazish uchun", canvas.width / 2, 680);

    ctx.fillStyle = '#475569';
    ctx.font = '600 24px system-ui, -apple-system, sans-serif';
    ctx.fillText('QR-ni skanerlang', canvas.width / 2, 720);

    // 6. Draw Card Box Underneath
    const cardBoxWidth = 560;
    const cardBoxHeight = 170;
    const cardBoxX = (canvas.width - cardBoxWidth) / 2;
    const cardBoxY = 760;

    // Dark card background
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.roundRect(cardBoxX, cardBoxY, cardBoxWidth, cardBoxHeight, 20);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Card Header label
    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 18px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('💳 TO‘LOV KARTASI (UZCARD / HUMO)', cardBoxX + 24, cardBoxY + 36);

    // Card Number in Monospace Gold
    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 36px monospace, Courier, sans-serif';
    ctx.fillText(cardNumber || '8600 3141 7549 7736', cardBoxX + 24, cardBoxY + 90);

    // Cardholder & Bank
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '700 18px system-ui, -apple-system, sans-serif';
    ctx.fillText(cardHolder, cardBoxX + 24, cardBoxY + 130);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(bankName, cardBoxX + cardBoxWidth - 24, cardBoxY + 130);

    // 7. Trigger browser download
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return true;
  } catch (err) {
    console.error('Failed to download QR image:', err);
    // Fallback: download raw image URL
    try {
      const a = document.createElement('a');
      a.href = qrImageUrl;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } catch {
      return false;
    }
  }
};
