require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
console.log(__dirname)

// Mengambil variabel dari environment (Railway)
const CLIENT_ID = process.env.DOKU_CLIENT_ID;
const SECRET_KEY = process.env.DOKU_SECRET_KEY;
const IS_PRODUCTION = process.env.DOKU_IS_PRODUCTION === 'true';

const DOKU_BASE_URL = IS_PRODUCTION 
  ? 'https://api.doku.com' 
  : 'https://api-sandbox.doku.com';

// Endpoint untuk Generate DOKU Checkout URL
app.post('/api/checkout', async (req, res) => {
  try {
    const { name, price } = req.body;
    const invoiceNumber = `INV-${Date.now()}`;
    const requestTarget = '/checkout/v1/payment';
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString().slice(0, 19) + 'Z';

    const bodyPayload = {
      order: {
        amount: price,
        invoice_number: invoiceNumber,
        line_items: [
          {
            name: name,
            price: price,
            quantity: 1
          }
        ]
      },
      payment: {
        payment_due_date: 60 // Waktu kedaluwarsa payment (menit)
      }
    };

    const jsonBody = JSON.stringify(bodyPayload);
    const digest = crypto.createHash('sha256').update(jsonBody).digest('base64');

    // Pembuatan Signature DOKU HTTP Notification / API
    const signatureRaw = 
      `Client-Id:${CLIENT_ID}\n` +
      `Request-Id:${requestId}\n` +
      `Request-Timestamp:${timestamp}\n` +
      `Request-Target:${requestTarget}\n` +
      `Digest:${digest}`;

    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(signatureRaw);
    const signature = `HMACSHA256=${hmac.digest('base64')}`;

    const response = await axios.post(`${DOKU_BASE_URL}${requestTarget}`, bodyPayload, {
      headers: {
        'Client-Id': CLIENT_ID,
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        'Signature': signature,
        'Content-Type': 'application/json'
      }
    });

    // Kirim payment URL balik ke frontend
    res.json({ paymentUrl: response.data.response.payment.url });
  } catch (error) {
    console.error('DOKU Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Gagal membuat transaksi DOKU' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));