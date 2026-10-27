// The actual UPI ID is kept on the server (TRAVEL_GO_UPI_ID), never entered by a customer.
let activePayment = null;

const paymentStyles = document.createElement('style');
paymentStyles.textContent = `
  #payment-dialog{width:min(480px,calc(100% - 30px));padding:34px;background:#fff}#payment-dialog h2{font:700 34px/1.08 'Playfair Display';margin:0 0 8px}.payment-card{margin:21px 0;padding:20px;background:#f7f1e7;text-align:center}.payment-amount{font:700 38px/1 'Playfair Display';color:var(--ink);margin:4px 0 7px}.payment-route{color:var(--muted);font-size:13px;line-height:1.45}.payment-qr{display:block;width:220px;height:220px;max-width:100%;margin:17px auto 13px;background:#fff;border:8px solid #fff;box-shadow:0 7px 20px #183b3017}.payment-upi{font:700 13px 'DM Sans';word-break:break-all}.payment-warning{padding:13px;background:#fff0e8;border-left:3px solid var(--coral);font-size:13px;line-height:1.45}.payment-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0}.payment-actions .button{display:grid;place-items:center;text-align:center;text-decoration:none}.payment-actions .secondary{background:#173d33;color:#fff}.payment-proof{border-top:1px solid #e4ddd2;padding-top:15px;margin-top:17px}.payment-proof label{font-size:12px}.payment-note{font-size:11px;color:var(--muted);margin:13px 0 0;line-height:1.45}@media(max-width:480px){#payment-dialog{padding:28px 20px}.payment-actions{grid-template-columns:1fr}.payment-qr{width:200px;height:200px}}
`;
document.head.append(paymentStyles);

document.body.insertAdjacentHTML('beforeend', `
  <dialog id="payment-dialog">
    <button class="close" aria-label="Close">×</button>
    <p class="eyebrow">Secure UPI payment</p>
    <h2>Complete your booking</h2>
    <p class="dialog-subtitle" id="payment-description">Preparing your payment QR…</p>
    <div class="payment-card" id="payment-card" hidden>
      <p class="payment-amount" id="payment-amount"></p>
      <p class="payment-route" id="payment-reference"></p>
      <img class="payment-qr" id="payment-qr" alt="UPI payment QR code">
      <p class="payment-upi" id="payment-upi"></p>
    </div>
    <div class="payment-warning" id="payment-warning" hidden></div>
    <div class="payment-actions" id="payment-actions" hidden>
      <a class="button" id="open-upi-app">Pay in UPI app</a>
      <button type="button" class="button secondary" id="copy-upi-id">Copy UPI ID</button>
    </div>
    <form class="payment-proof" id="payment-proof" hidden>
      <label>UPI reference / UTR number (after you pay)<input name="paymentReference" required placeholder="12-digit UTR number"></label>
      <button class="button">Download payment receipt PDF →</button>
    </form>
    <p class="payment-note">After payment, enter the UTR number to download your private PDF receipt. This PDF is not shared automatically.</p>
  </dialog>`);

const paymentDialog = document.querySelector('#payment-dialog');
const paymentCard = document.querySelector('#payment-card');
const paymentWarning = document.querySelector('#payment-warning');
const paymentActions = document.querySelector('#payment-actions');
const paymentProof = document.querySelector('#payment-proof');

function rupees(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

async function getPaymentConfig() {
  const response = await fetch('/api/payment-config');
  if (!response.ok) throw new Error('Payment settings are unavailable.');
  return response.json();
}

async function openTravelGoPayment({ amount, description, bookingId, phone }) {
  const payableAmount = Math.round(Number(amount));
  activePayment = { amount: payableAmount, description, bookingId, phone };
  paymentDialog.showModal();
  paymentCard.hidden = true;
  paymentActions.hidden = true;
  paymentProof.hidden = true;
  paymentWarning.hidden = true;
  document.querySelector('#payment-description').textContent = 'Preparing your payment QR…';

  if (!Number.isFinite(payableAmount) || payableAmount <= 0) {
    paymentWarning.textContent = 'The booking amount could not be calculated. Please contact Travel Go for the payment link.';
    paymentWarning.hidden = false;
    return;
  }

  try {
    const config = await getPaymentConfig();
    if (!config.enabled) {
      document.querySelector('#payment-description').textContent = 'Your booking request is saved.';
      paymentWarning.innerHTML = 'UPI payment is not configured yet. The Travel Go owner must add their UPI ID in <b>START-TRAVEL-GO.bat</b> and restart the server. No payment can be made to a random account.';
      paymentWarning.hidden = false;
      return;
    }
    const paymentNote = `Travel Go ${bookingId}`.slice(0, 80);
    const upiParams = new URLSearchParams({ pa: config.upiId, pn: config.merchantName || 'Travel Go', am: payableAmount.toFixed(2), cu: 'INR', tn: paymentNote });
    const upiUrl = `upi://pay?${upiParams.toString()}`;
    document.querySelector('#payment-description').textContent = 'Scan the QR code with any UPI app, or open it directly on your phone.';
    document.querySelector('#payment-amount').textContent = rupees(payableAmount);
    document.querySelector('#payment-reference').textContent = description;
    document.querySelector('#payment-upi').textContent = `Paying to: ${config.upiId}`;
    const qr = document.querySelector('#payment-qr');
    qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&data=${encodeURIComponent(upiUrl)}`;
    qr.onerror = () => { paymentWarning.textContent = 'QR image could not load. Use “Pay in UPI app” below.'; paymentWarning.hidden = false; };
    document.querySelector('#open-upi-app').href = upiUrl;
    document.querySelector('#copy-upi-id').onclick = async () => {
      try { await navigator.clipboard.writeText(config.upiId); notify('UPI ID copied.'); }
      catch { notify(`UPI ID: ${config.upiId}`); }
    };
    paymentCard.hidden = false;
    paymentActions.hidden = false;
    paymentProof.hidden = false;
  } catch (error) {
    document.querySelector('#payment-description').textContent = 'Your booking request is saved.';
    paymentWarning.textContent = error.message || 'Payment QR could not be created.';
    paymentWarning.hidden = false;
  }
}

function pdfText(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '?');
}

function createReceiptPdf(payment, reference) {
  const lines = [
    ['/F1 22 Tf', 'TRAVEL GO'],
    ['/F1 13 Tf', 'Payment booking receipt'],
    ['/F1 11 Tf', 'Booking ID: ' + payment.bookingId],
    ['/F1 11 Tf', 'Service: ' + payment.description],
    ['/F1 11 Tf', 'Amount: INR ' + Number(payment.amount).toLocaleString('en-IN')],
    ['/F1 11 Tf', 'Customer phone: ' + (payment.phone || 'Not provided')],
    ['/F1 11 Tf', 'UPI reference / UTR: ' + reference],
    ['/F1 11 Tf', 'Generated: ' + new Date().toLocaleString('en-IN')],
    ['/F1 11 Tf', 'Payment status: reference submitted by customer'],
    ['/F1 10 Tf', 'Keep this receipt for your booking reference.'],
    ['/F1 10 Tf', 'This PDF is generated privately in your browser and is not shared automatically.'],
    ['/F1 10 Tf', 'Travel Go support: +91 860 400 6112']
  ];
  const content = ['BT', '50 790 Td'];
  lines.forEach(([font, text], index) => {
    content.push(font, '(' + pdfText(text) + ') Tj', '0 ' + (index === 0 ? '-30' : '-24') + ' Td');
  });
  content.push('ET');
  const stream = content.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += (index + 1) + ' 0 obj\n' + object + '\nendobj\n';
  });
  const xrefOffset = pdf.length;
  pdf += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
  offsets.slice(1).forEach(offset => { pdf += String(offset).padStart(10, '0') + ' 00000 n \n'; });
  pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';
  return new Blob([pdf], { type: 'application/pdf' });
}

function downloadPaymentReceipt(payment, reference) {
  const url = URL.createObjectURL(createReceiptPdf(payment, reference));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Travel-Go-receipt-' + String(payment.bookingId).replace(/[^a-z0-9-]/gi, '') + '.pdf';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

paymentProof.onsubmit = event => {
  event.preventDefault();
  if (!activePayment) return;
  const reference = new FormData(paymentProof).get('paymentReference').trim();
  downloadPaymentReceipt(activePayment, reference);
  document.querySelector('#payment-description').textContent = 'Your payment receipt PDF has downloaded.';
  notify('PDF receipt downloaded.');
};

paymentDialog.querySelector('.close').onclick = () => paymentDialog.close();
window.openTravelGoPayment = openTravelGoPayment;
