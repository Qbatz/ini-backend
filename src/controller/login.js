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
                    return res.status(200).json({ message: "Mail Sent Successfully" });

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

    var verify_code = req.body.verify_code;

    if (!verify_code) {
        return res.status(400).json({ message: "Missing Verify Code" });
    }

    var sql1 = "SELECT * FROM user_email_verify WHERE verify_code=:verify_code";

    var sql1_response = await db.query(sql1,
        {
            replacements: { verify_code },
            type: db.QueryTypes.SELECT,
        }
    );

    if (sql1_response.length != 0) {

        var mail_details = sql1_response[0];

        if (mail_details.is_verified == 0) {

            var id = mail_details.id;

            var up_query = "UPDATE user_email_verify SET is_verified=1,updated_on=CURRENT_TIMESTAMP WHERE id=?"

            await db.query(up_query,
                {
                    replacements: { id },
                    type: db.QueryTypes.UPDATE,
                }
            );
        }

        var data = {
            verify_code: verify_code,
            email: mail_details.email,
            is_verified: 0
        }

        return res.status(200).json({ data })

    } else {
        return res.status(400).json({ message: "Invalid Verify Code" });
    }

}

exports.forgot_password = async (req, res) => {

    var { email, recaptcha } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Missing Email Id" })
    }

    if (!recaptcha) {
        return res.status(400).json({ message: "Missing Recaptcha Code" })
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
                return res.status(400).json({ message: "Error verifying reCAPTCHA", error });
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

                    return res.status(200).json({ message: "Check Your Email ID to reset password" });
                } else {
                    return res.status(400).json({ message: "Record Not Found" });
                }
            } else {
                return res.status(400).json({ message: "Failed reCAPTCHA verification" });
            }
        })

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

exports.reg_send_otp = async (req, res) => {

    var mobile = req.body.mobile;

    if (!mobile) {
        return res.status(400).json({ message: "Missing Mobile Number" })
    }

    try {

        // var check_query = "SELECT * FROM user_mobile_verify_otp WHERE mobile=:mobile ORDER BY id DESC";

        // var result = await db.query(check_query,
        //     {
        //         replacements: { mobile },
        //         type: db.QueryTypes.SELECT,
        //     }
        // );

        // if (result.length > 0) {

        //     var id = result[0].id;

        //     var up_query = "UPDATE user_mobile_verify_otp SET is_verified=2 WHERE id=:id";
        //     var up_res = await db.query(up_query,
        //         {
        //             replacements: { id },
        //             type: db.QueryTypes.UPDATE,
        //         }
        //     );
        // }

        var otp = generateOtp()

        var insert_query = "INSERT INTO user_mobile_verify_otp (mobile,otp, is_verified,created_on,updated_on,failed_attempt) VALUES (:mobile,:otp,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,0)";

        await db.query(insert_query,
            {
                replacements: { mobile, otp },
                type: db.QueryTypes.INSERT,
            }
        );

        return res.status(200).json({ message: 'OTP sent successfully!', otp: otp });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

exports.reg_verify_otp = async (req, res) => {

    var { mobile, otp } = req.body;

    if (!mobile) {
        return res.status(400).json({ message: "Missing Mobile Number" })
    }

    if (!otp) {
        return res.status(400).json({ message: "Missing OTP Value" })
    }

    var sql1 = "SELECT * FROM user_mobile_verify_otp WHERE mobile=:mobile ORDER BY id DESC";

    var sql1_response = await db.query(sql1,
        {
            replacements: { mobile },
            type: db.QueryTypes.SELECT,
        }
    );

    if (sql1_response.length != 0) {

        var otpRecord = sql1_response[0];

        var is_verified = otpRecord.is_verified;

        if (otpRecord.otp != otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (is_verified == 1) {
            return res.status(400).json({ message: "OTP Already Verified" })
        }

        var id = otpRecord.id;

        var sql2 = "UPDATE user_mobile_verify_otp SET is_verified=1,updated_on=CURRENT_TIMESTAMP WHERE id=:id";

        var sql1_response = await db.query(sql2,
            {
                replacements: { id },
                type: db.QueryTypes.SELECT,
            }
        );

        return res.status(200).json({ message: "OTP verified successfully" })

    } else {
        return res.status(400).json({ message: "Mobile number not found" })
    }
}