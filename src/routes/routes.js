const express = require('express');
const loginrouter = require('../controller/login');
const registerrouter = require('../controller/register');
const forgotrouter = require('../controller/forgot');
const vendorroute = require('../controller/vendor');
const customersroute = require('../controller/customers');

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

router.post('/auth/token', registerrouter.login);

router.post('/user/reset-password', registerrouter.reset_password);


// Vendor Routes

router.post('/usr/vendor', vendorroute.basic_info);

router.post('/usr/vendor/addBasicInfo', vendorroute.addBasicInfo);

router.post('/usr/vendor/addBankDetails', vendorroute.addBankDetails);

router.post('/usr/vendor/addAddressInfo', vendorroute.addAddressInfo);

router.patch('/usr/vendor/:vendor_id', vendorroute.updatevendor_id);

router.get('/usr/vendor', vendorroute.get_allvendors);

router.get('/usr/vendor/:vendor_id', vendorroute.particularvendor_details);

router.delete('/usr/vendor/:vendor_id', vendorroute.remove_vendor);

// Customer Routes

router.post('/usr/client', customersroute.add_customersall);

router.patch('/usr/client/:customer_id', customersroute.updatecustomer);

router.get('/usr/client', customersroute.all_customers);

router.get('/usr/client/:customer_id', customersroute.one_customer);

router.delete('/usr/client/:customer_id', customersroute.delete_customer);

router.post('/usr/client/addBasicInfo', customersroute.addBasicInfo);

router.post('/usr/client/addBankDetails', customersroute.addBankDetails);

router.post('/usr/client/addAddressInfo', customersroute.addAddressInfo);


module.exports = router;