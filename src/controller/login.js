const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { UserEmailVerify, AuthUser } = require('../models/users')
const request = require('request');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { UserForgotPasswordOtp, UserMobileVerifyOtp } = require('../models/login');

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
        return res.status(400).json({ message: "Missing Email Id" })
    }

    if (!recaptcha) {
        return res.status(400).json({ message: "Missing Recaptcha Code" })
    }

    try {
        const email_verify = await UserEmailVerify.findOne({ where: { email } })

        if (email_verify) {
            return res.status(400).json({ message: "Email Already registered with us" });
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
                    return res.status(400).json({ message: "Error verifying reCAPTCHA", error });
                }

                const data = JSON.parse(body);

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
                    return res.status(200).json({ message: "Mail Sent Successfully", email: email });

                } else {
                    return res.status(400).json({ message: "Failed reCAPTCHA verification" });
                }
            })
        }
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

exports.email_verify_confirm = async (req, res) => {
    try {
        const { verify_code } = req.body;

        if (!verify_code) {
            return res.status(400).json({ message: "Missing Verify Code" });
        }

        // Fetch user verification details
        const mail_details = await UserEmailVerify.findOne({
            where: { verify_code }
        });

        if (!mail_details) {
            return res.status(400).json({ message: "Invalid Verify Code" });
        }

        if (mail_details.is_verified === 1) {
            return res.status(200).json({
                data: {
                    verify_code,
                    email: mail_details.email,
                    is_verified: 1
                }
            });
        }

        const expire_time = new Date(mail_details.created_on);
        const current_time = new Date();
        const hours_diff = (current_time - expire_time) / (1000 * 60 * 60);

        if (hours_diff > 24) {
            return res.status(400).json({ message: "Verification link expired. Please request a new one." });
        }

        // Update verification status
        await UserEmailVerify.update(
            { is_verified: 1, updated_on: new Date() },
            { where: { id: mail_details.id } }
        );

        return res.status(200).json({
            data: {
                verify_code,
                email: mail_details.email,
                is_verified: 0
            }
        });
    } catch (error) {
        console.error("Error in email verification:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.forgot_password = async (req, res) => {
    try {
        const { email, recaptcha } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Missing Email Id" });
        }

        if (!recaptcha) {
            return res.status(400).json({ message: "Missing Recaptcha Code" });
        }

        const secretKey = "6LcBN_4qAAAAAK3Z-Hu2Ozx3QyG26w-1Zm_u3Luz";
        const url = "https://www.google.com/recaptcha/api/siteverify";

        request.post({
            url,
            form: { secret: secretKey, response: recaptcha },
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }, async (error, response, body) => {
            if (error) {
                console.log(error);
                return res.status(400).json({ message: "Error verifying reCAPTCHA", error });
            }

            const data = JSON.parse(body);

            if (!data.success) {
                return res.status(400).json({ message: "Failed reCAPTCHA verification" });
            }

            // Check if email exists
            const email_verify = await AuthUser.findOne({ where: { email } });

            if (!email_verify) {
                return res.status(400).json({ message: "Record Not Found" });
            }

            const otp = generateOtp();
            const new_url = process.env.SITE_URL;

            const { id: user_id, first_name, last_name } = email_verify;

            // Read email template
            const htmlFilePath = path.join(__dirname, '../mail_templates', 'otp_mail.html');
            let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
            htmlContent = htmlContent
                .replace('{{site_url}}', new_url)
                .replace('{{otp}}', otp)
                .replace('{{first_name}}', first_name)
                .replace('{{last_name}}', last_name);

            await UserForgotPasswordOtp.create({
                otp,
                user_id,
                is_active: 1,
                created_on: new Date()
            });

            // Send OTP email
            await transport.sendMail({
                from: '"MyApp Support" <no-reply@myapp.com>',
                to: email,
                subject: "OTP Mail for Forgot Password",
                html: htmlContent,
            });

            console.log("OTP email sent successfully.");
            return res.status(200).json({ message: "Check Your Email ID to reset password" });
        });
    } catch (error) {
        console.error("Error in forgot password:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.reset_password_validcheck = async (req, res) => {

    var { verify_code } = req.body;

    if (!verify_code) {
        return res.status(400).json({ message: "Missing Verify Code" });
    }

    try {
        // Find the OTP record
        const otpRecord = await UserForgotPasswordOtp.findOne({
            where: { otp: verify_code }
        });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid Verify Code" });
        }

        if (otpRecord.is_active === 0) {
            return res.status(400).json({ message: "Already Code Verified" });
        }

        var expire_time = new Date(otpRecord.created_on);
        var current_time = new Date();

        var time_diff = current_time - expire_time;
        var hours_diff = time_diff / (1000 * 60 * 60);

        if (hours_diff > 24) {
            return res.status(400).json({ message: "Code expired. Please request a new one." });
        }

        // Update OTP status
        await UserForgotPasswordOtp.update(
            { is_active: 0 },
            { where: { id: otpRecord.id } }
        );

        return res.status(200).json({ message: "Token Verified" });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

exports.reg_send_otp = async (req, res) => {
    var { mobile } = req.body;

    if (!mobile) {
        return res.status(400).json({ message: "Missing Mobile Number" });
    }

    try {
        var otp = generateOtp();

        await UserMobileVerifyOtp.create({
            mobile: mobile,
            otp: otp,
            is_verified: 0,
            created_on: new Date(),
            updated_on: new Date(),
            failed_attempt: 0
        });

        return res.status(200).json({ message: "OTP sent successfully!", otp: otp });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};


exports.reg_verify_otp = async (req, res) => {

    var { mobile, otp } = req.body;

    if (!mobile) {
        return res.status(400).json({ message: "Missing Mobile Number" });
    }

    if (!otp) {
        return res.status(400).json({ message: "Missing OTP Value" });
    }

    try {
        const otpRecord = await UserMobileVerifyOtp.findOne({
            where: { mobile },
            order: [['id', 'DESC']]
        });

        if (!otpRecord) {
            return res.status(400).json({ message: "Mobile number not found" });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (otpRecord.is_verified === 1) {
            return res.status(400).json({ message: "OTP Already Verified" });
        }

        var expire_time = new Date(otpRecord.created_on);
        var current_time = new Date();
        var time_diff = current_time - expire_time;
        var hours_diff = time_diff / (1000 * 60 * 60);

        if (hours_diff > 24) {
            return res.status(400).json({ message: "OTP expired. Please request a new one." });
        }

        await UserMobileVerifyOtp.update(
            { is_verified: 1, updated_on: new Date() },
            { where: { id: otpRecord.id } }
        );

        return res.status(200).json({ message: "OTP verified successfully" });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
