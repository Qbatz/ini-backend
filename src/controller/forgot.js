require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const request = require('request');

const db = require('../config/db');

var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

exports.forget_clientid = async (req, res) => {

    var { email, captcha } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Missing Email Id" })
    }

    if (!captcha) {
        return res.status(400).json({ message: "Missing Recaptcha Code" })
    }

    try {

        const secretKey = "6LcBN_4qAAAAAK3Z-Hu2Ozx3QyG26w-1Zm_u3Luz";

        const url = "https://www.google.com/recaptcha/api/siteverify";

        const formData = {
            secret: secretKey,
            response: captcha
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

                var sql1 = "SELECT au.id,au.first_name,au.last_name,au.username,uc.customer_id FROM auth_user AS au JOIN user_company AS uc ON au.id=uc.user_id WHERE au.email=? AND au.is_active=true";
                var sql1_response = await db.query(sql1, {
                    replacements: [email],
                    type: db.QueryTypes.SELECT
                })

                if (sql1_response.length != 0) {

                    var username = sql1_response[0].username;
                    var first_name = sql1_response[0].first_name;
                    var last_name = sql1_response[0].last_name;
                    var clientid = sql1_response[0].customer_id;

                    var new_url = process.env.SITE_URL;
                    const htmlFilePath = path.join(__dirname, '../mail_templates', 'forgot_client.html');

                    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
                    htmlContent = htmlContent.replace('{{site_url}}', new_url).replace('{{username}}', username).replace('{{first_name}}', first_name).replace('{{last_name}}', last_name).replace('{{customer_id}}', clientid);

                    await transport.sendMail({
                        from: '"MyApp Support" <no-reply@myapp.com>',
                        to: email,
                        subject: "Mail for Forgot Login Details",
                        html: htmlContent,
                    });

                    console.log("Forgot email sent successfully.");
                    return res.status(200).json({ message: "Your Client ID has been sent to email address" })
                } else {
                    return res.status(400).json({ message: "Record Not Found" })
                }
            } else {
                return res.status(400).json({ message: "Failed reCAPTCHA verification" });
            }
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}