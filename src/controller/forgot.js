require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const request = require('request');
const { AuthUser } = require('../models/users')
const { UserCompany } = require('../models/register');

var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

exports.forget_clientid = async (req, res) => {
    const { email, captcha } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Missing Email Id" });
    }

    if (!captcha) {
        return res.status(400).json({ message: "Missing Recaptcha Code" });
    }

    try {
        
        var secretKey = process.env.SECRET_KEY;

        const url = "https://www.google.com/recaptcha/api/siteverify";

        request.post({
            url,
            form: { secret: secretKey, response: captcha },
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }, async (error, response, body) => {
            if (error) {
                console.error(error);
                return res.status(400).json({ message: "Error verifying reCAPTCHA", error });
            }

            const data = JSON.parse(body);

            if (data.success) {
                // Fetch user details using Sequelize models
                const user = await AuthUser.findOne({
                    where: { email, is_active: true },
                    attributes: ['id', 'first_name', 'last_name', 'username'],
                    include: [
                        {
                            model: UserCompany,
                            attributes: ['customer_id'],
                            required: true, // Ensures there is a matching user_company record
                        }
                    ]
                });

                if (!user) {
                    return res.status(400).json({ message: "Record Not Found" });
                }

                // Extract details
                const { username, first_name, last_name } = user;
                const clientid = user.UserCompany.customer_id;

                const new_url = process.env.SITE_URL;
                const htmlFilePath = path.join(__dirname, '../mail_templates', 'forgot_client.html');

                let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
                htmlContent = htmlContent
                    .replace('{{site_url}}', new_url)
                    .replace('{{username}}', username)
                    .replace('{{first_name}}', first_name)
                    .replace('{{last_name}}', last_name)
                    .replace('{{customer_id}}', clientid);

                // Send email
                await transport.sendMail({
                    from: '"MyApp Support" <no-reply@myapp.com>',
                    to: email,
                    subject: "Mail for Forgot Login Details",
                    html: htmlContent,
                });

                console.log("Forgot email sent successfully.");
                return res.status(200).json({ message: "Your Client ID has been sent to your email address" });
            } else {
                return res.status(400).json({ message: "Failed reCAPTCHA verification" });
            }
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};