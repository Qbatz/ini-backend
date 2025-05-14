const express = require('express');
const invoiceroute = require('../controller/invoice');

const router = express.Router();
const multer = require('multer');

const upload = multer({
    limits: {
        fileSize: 25 * 1024 * 1024
    }
});

router.get('/invoice/invoice-type', invoiceroute.invoice_type);

router.get('/ports', invoiceroute.all_ports);

router.post('/ports', invoiceroute.add_port);

router.get('/payments/payment-terms', invoiceroute.allpayment_terms);

router.get('/payments/delivery-terms', invoiceroute.delivery_terms);

module.exports = router;