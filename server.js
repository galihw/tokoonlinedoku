//require('dotenv').config();
require('dotenv').config({ path: './process.env' }); // Menggunakan process.env
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fungsi membuat Signature DOKU
function generateSignature(clientId, requestId, requestTimestamp, requestTarget, body, secretKey) {
	const digest = crypto.createHash('sha256').update(JSON.stringify(body)).digest('base64');
	const component = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;

	return 'HMACSHA256=' + crypto
		.createHmac('sha256', secretKey)
		.update(component)
		.digest('base64');
}

function generateInvoiceNumber() {
	const now = new Date();

	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');

	return `INV-${year}${month}${day}-${hours}${minutes}${seconds}`;
}
app.post('/api/checkout', async (req, res) => {
	try {
		const { item } = req.body;

		const requestId = 'REQ-' + Date.now();
		const requestTimestamp = new Date().toISOString().slice(0, 19) + 'Z';
		//const invoiceNumber = 'INV-' + Date.now();
		const invoiceNumber = generateInvoiceNumber();
		const requestTarget = '/checkout/v1/payment';
	
	
		const body = {
			order: {
				amount: item.price,
				invoice_number: invoiceNumber
			},
			item: {
				name: item.judul,
				price: item.price,
				quantity: 1
			},
			customer: {
				name: item.name,
				phone: item.phone,
				address: item.address
			},
			payment: {
				payment_due_date: 60
			}
		};
	
		const signature = generateSignature(
			process.env.DOKU_CLIENT_ID,
			requestId,
			requestTimestamp,
			requestTarget,
			body,
			process.env.DOKU_SECRET_KEY
		);

		const response = await axios.post(
			`${process.env.DOKU_URL}${requestTarget}`,
			body,
			{
				headers: {
					'Client-Id': process.env.DOKU_CLIENT_ID,
					'Request-Id': requestId,
					'Request-Timestamp': requestTimestamp,
					'Signature': signature,
					'Content-Type': 'application/json'
				}
			}
		);

	// Mengirimkan URL pembayaran DOKU ke client
	res.json({ payment_url: response.data.response.payment.url });
	} catch (error) {
		console.error(error.response ? error.response.data : error.message);
		res.status(500).json({ error: 'Gagal membuat transaksi' });
	}
});

app.listen(process.env.PORT, () => {
  console.log(`Server berjalan di http://localhost:${process.env.PORT}`);
});