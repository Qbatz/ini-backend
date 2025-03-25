const express = require('express');
const loginrouter = require('../controller/login');

const router = express.Router();

const multer = require('multer');
const upload = multer();

router.post('/user/email_verify', loginrouter.email_verify);

router.post('/user/forgot-password', loginrouter.forgot_password);

router.post('/user/reg-send-otp', loginrouter.reg_send_otp);

router.post('/user/reg-verify-otp', loginrouter.reg_verify_otp);

module.exports = router;