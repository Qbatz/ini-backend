const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { UserEmailVerify, AuthUser } = require('../models/users')
const request = require('request');
const nodemailer = require('nodemailer');
require('dotenv').config();
const db = require('../config/db');

const generateCode = () => {
    return crypto.randomBytes(20).toString("hex"); // Generates 40-character hex string
};

function generateOtp() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
}

var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

exports.email_verify = async (req, res) => {

    var { email, recaptcha } = req.body;

    if (!email) {
        return res.json({ statusCode: 201, message: "Missing Email Id" })
    }

    if (!recaptcha) {
        return res.json({ statusCode: 201, message: "Missing Recaptcha Code" })
    }

    try {
        const email_verify = await UserEmailVerify.findOne({ where: { email } })

        if (email_verify) {
            return res.json({ statusCode: 201, message: "Email Already registered with us" });
        } else {

            const secretKey = "6LcBN_4qAAAAAK3Z-Hu2Ozx3QyG26w-1Zm_u3Luz";

            const url = "https://www.google.com/recaptcha/api/siteverify";

            const formData = {
                secret: secretKey,
                response: recaptcha
            };

            request.post({
                url: url,
                form: formData,
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }, async (error, response, body) => {
                if (error) {
                    console.log(error);
                    return res.json({ success: false, message: "Error verifying reCAPTCHA", error });
                }

                const data = JSON.parse(body);
                console.log(data);

                if (data.success) {

                    const verify_code = generateCode();
                    var url = process.env.SITE_URL
                    const htmlFilePath = path.join(__dirname, '../mail_templates', 'verify_mail.html');
                    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
                    htmlContent = htmlContent.replace('{{site_url}}', url).replace('{{verify_code}}', verify_code).replace('{{site_url}}', url).replace('{{verify_code}}', verify_code);

                    var insert_verify = await UserEmailVerify.create({ email, verify_code, is_verified: 0 })

                    await transport.sendMail({
                        from: '"MyApp Support" <no-reply@myapp.com>', // Sender email
                        to: email,
                        subject: "Verify Your Email",
                        html: htmlContent,
                    });

                    console.log("Verification email sent successfully.");
                    return res.json({ success: 200, message: "Mail Sent Successfully" });

                } else {
                    return res.json({ success: 201, message: "Failed reCAPTCHA verification" });
                }
            })
        }
    } catch (error) {
        return res.json({ statusCode: 201, message: error.message });
    }
}

exports.forgot_password = async (req, res) => {

    var { email, recaptcha } = req.body;

    if (!email) {
        return res.json({ statusCode: 201, message: "Missing Email Id" })
    }

    if (!recaptcha) {
        return res.json({ statusCode: 201, message: "Missing Recaptcha Code" })
    }

    try {

        const secretKey = "6LcBN_4qAAAAAK3Z-Hu2Ozx3QyG26w-1Zm_u3Luz";

        const url = "https://www.google.com/recaptcha/api/siteverify";

        const formData = {
            secret: secretKey,
            response: recaptcha
        };

        request.post({
            url: url,
            form: formData,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }, async (error, response, body) => {
            if (error) {
                console.log(error);
                return res.json({ success: false, message: "Error verifying reCAPTCHA", error });
            }

            const data = JSON.parse(body);

            if (data.success) {

                const email_verify = await AuthUser.findOne({ where: { email } })

                if (email_verify) {

                    const otp = generateOtp();

                    var new_url = process.env.SITE_URL;

                    var user_details = email_verify.dataValues;

                    var user_id = user_details.id;

                    const htmlFilePath = path.join(__dirname, '../mail_templates', 'otp_mail.html');

                    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
                    htmlContent = htmlContent.replace('{{site_url}}', new_url).replace('{{otp}}', otp).replace('{{first_name}}', user_details.first_name).replace('{{last_name}}', user_details.last_name);

                    var insert_query = "INSERT INTO user_forgot_password_otp (otp, user_id, is_active,created_on) VALUES (:otp, :user_id, 1,CURRENT_TIMESTAMP)";

                    await db.query(insert_query,
                        {
                            replacements: { otp, user_id },
                            type: db.QueryTypes.INSERT,
                        }
                    );

                    await transport.sendMail({
                        from: '"MyApp Support" <no-reply@myapp.com>', // Sender email
                        to: email,
                        subject: "Otp Mail for Forgot Password",
                        html: htmlContent,
                    });

                    console.log("Otp email sent successfully.");

                    return res.json({ success: 200, message: "Check Your Email ID to reset password" });
                } else {
                    return res.json({ statusCode: 400, message: "Record Not Found" });
                }
            } else {
                return res.json({ statusCode: 201, message: "Failed reCAPTCHA verification" });
            }
        })

    } catch (error) {
        return res.json({ statusCode: 400, message: error.message });
    }
}

exports.reg_send_otp = (req, res) => {

    var mobile = req.body.mobile;

    if (!mobile) {
        return res.json({ statusCode: 201, message: "Missing Mobile Number" })
    }

    

}