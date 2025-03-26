const express = require('express');
const loginrouter = require('../controller/login');
const registerrouter = require('../controller/register');
const forgotrouter = require('../controller/forgot');

const router = express.Router();

const multer = require('multer');
const upload = multer();

router.post('/user/email_verify', loginrouter.email_verify);

router.post('/user/forgot-password', loginrouter.forgot_password);

router.post('/user/reset-password-valid-check', loginrouter.reset_password_validcheck);

router.post('/user/reg-send-otp', loginrouter.reg_send_otp);

router.post('/user/reg-verify-otp', loginrouter.reg_verify_otp);

router.post('/user/email-verify-confirm', loginrouter.email_verify_confirm);

router.post('/user/company-registration', registerrouter.company_registration);

router.post('/user/forgot-clientid', forgotrouter.forget_clientid);


module.exports = router;