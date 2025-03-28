require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');

const db = require('../config/db');

function hashPassword(password, salt = null, iterations = 260000, keyLength = 32) {
    if (!salt) {
        salt = crypto.randomBytes(16).toString('base64'); // Generate a random salt
    }

    const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256').toString('base64');
    return `pbkdf2_sha256$${iterations}$${salt}$${hash}`;
}

function verifyPassword(password, storedHash) {
    const parts = storedHash.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2_sha256') {
        throw new Error('Invalid hash format');
    }

    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const storedKey = parts[3];

    const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('base64');
    return derivedKey === storedKey;
}

const generateCustomerId = async () => {

    let isUnique = false;
    let customerId;

    while (!isUnique) {
        // Generate a random 8-digit number
        customerId = Math.floor(10000000 + Math.random() * 90000000);

        // Check if the customer ID already exists in the database
        const result = await db.query("SELECT id FROM user_company WHERE customer_id = ?", {
            replacements: [customerId],
            type: db.QueryTypes.SELECT
        });

        if (result.length === 0) {
            isUnique = true;
        }
    }

    return customerId;
};

var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

exports.company_registration = async (req, res) => {

    var { email, email_verify_token, first_name, last_name, password, password2, phone, mobile, otp, sent_otp, otp_verified, username } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Missing Email Id" })
    }

    if (!email_verify_token) {
        return res.status(400).json({ message: "Missing Mail Verification Token" })
    }

    if (!first_name) {
        return res.status(400).json({ message: "Missing FirstName" })
    }

    if (!password) {
        return res.status(400).json({ message: "Missing Password" })
    }

    if (!password2) {
        return res.status(400).json({ message: "Missing Confirm Password" })
    }

    if (!phone) {
        return res.status(400).json({ message: "Missing Phone Detail" })
    }

    if (!mobile) {
        return res.status(400).json({ message: "Missing Mobile Detail" })
    }

    if (!otp_verified) {
        return res.status(400).json({ message: "Missing Mobile Detail" })
    }

    if (!username) {
        return res.status(400).json({ message: "Missing UserName Detail" })
    }

    if (password == password2) {

        // Check email verified or not ??
        var sql1 = "SELECT * FROM user_email_verify WHERE verify_code=? AND email=?";
        var sql1_response = await db.query(sql1,
            {
                replacements: [email_verify_token, email],
                type: db.QueryTypes.SELECT,
            }
        )

        if (sql1_response.length != 0) {

            var mail_verify = sql1_response[0].is_verified;

            if (mail_verify == 1) {

                // Check Phone Number Verified or not
                var sql2 = "SELECT * FROM user_mobile_verify_otp WHERE mobile=? AND otp=?";
                var sql2_response = await db.query(sql2,
                    {
                        replacements: [mobile, otp],
                        type: db.QueryTypes.SELECT,
                    }
                )

                if (sql2_response.length != 0) {

                    var mob_verify = sql2_response[0].is_verified;

                    if (mob_verify == 1) {

                        const hashedPassword = hashPassword(password);

                        var insert_authtable = "INSERT INTO auth_user (password,is_superuser,username,first_name,last_name,email,is_staff,is_active,date_joined) VALUES (?,false,?,?,?,?,false,true,CURRENT_TIMESTAMP) RETURNING id";
                        var insert_authtable_response = await db.query(insert_authtable,
                            {
                                replacements: [hashedPassword, username, first_name, last_name, email],
                                type: db.QueryTypes.INSERT,
                            }
                        )
                        var user_id = insert_authtable_response[0][0].id;
                        const customerId = await generateCustomerId();

                        var inser_usercompany = "INSERT INTO user_company (company_name,gstin_vat,customer_id,created_on,updated_on,created_by_id,updated_by_id,user_id,same_address,lock_company_info) VALUES (' ',' ',?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,?,?,?,0,0) RETURNING id";
                        var usercompany_response = await db.query(inser_usercompany,
                            {
                                replacements: [customerId, user_id, user_id, user_id],
                                type: db.QueryTypes.INSERT,
                            }
                        )
                        var company_id = usercompany_response[0][0].id;

                        var insert_userprofile = "INSERT INTO user_profile (is_owner,gender,phone,mobile,created_on,updated_on,company_id,created_by_id,updated_by_id,user_id) VALUES (1,0,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,?,?,?,?)";
                        var usercompany_response = await db.query(insert_userprofile,
                            {
                                replacements: [phone, mobile, company_id, user_id, user_id, user_id],
                                type: db.QueryTypes.INSERT,
                            }
                        )

                        var new_url = process.env.SITE_URL;
                        const htmlFilePath = path.join(__dirname, '../mail_templates', 'register_mail.html');

                        let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
                        htmlContent = htmlContent.replace('{{first_name}}', first_name).replace('{{last_name}}', last_name).replace('{{customer_id}}', customerId).replace('{{username}}', username).replace('{{site_url}}', new_url);

                        await transport.sendMail({
                            from: '"MyApp Support" <no-reply@myapp.com>', // Sender email
                            to: email,
                            subject: "Inai Login Credentials",
                            html: htmlContent,
                        });

                        return res.status(200).json({ message: "<b>Mail Verified</b> Successfully, We have created a unique Client ID.<br/>Please check your registered email and log in to proceed with registration" })

                    } else {
                        return res.status(400).json({ message: "Mobile Number Not Verified" })
                    }
                } else {
                    return res.status(400).json({ message: "Invalid Mobile or Otp Details" })
                }
            } else {
                return res.status(400).json({ message: "Mail Not Verified" })
            }
        } else {
            return res.status(400).json({ message: "Invalid Mail or Verify Code" })
        }

    } else {
        return res.status(400).json({ message: "Password Does Not Matched" })
    }
}

const generateToken = (user) => {
    return jsonwebtoken.sign({ id: user.id, sub: "access" }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

exports.login = async (req, res) => {

    var { company_code, password, username } = req.body;

    if (!company_code) {
        return res.status(400).json({ message: "Missing Client Id" })
    }

    if (!username) {
        return res.status(400).json({ message: "Missing User Id" })
    }

    if (!password) {
        return res.status(400).json({ message: "Missing Password" })
    }

    try {

        var sql1 = "SELECT au.id,au.password,au.first_name,au.last_name,au.email,au.username FROM auth_user AS au JOIN user_company AS uc ON au.id=uc.user_id WHERE uc.customer_id=? AND au.username=? AND au.is_active=true";
        var sql1_response = await db.query(sql1,
            {
                replacements: [company_code, username],
                type: db.QueryTypes.SELECT,
            }
        )

        if (sql1_response.length != 0) {

            var db_password = sql1_response[0].password;
            var check_password = verifyPassword(password, db_password);

            if (check_password == true) {

                var user_id = sql1_response[0].id;

                var token = generateToken(sql1_response[0])

                var sql2 = "UPDATE auth_user SET last_login=CURRENT_TIMESTAMP WHERE id=?";
                await db.query(sql2,
                    {
                        replacements: [user_id],
                        type: db.QueryTypes.UPDATE,
                    }
                )

                return res.status(200).json({ access: token })

            } else {
                return res.status(402).json({ detail: "Invalid Password" })
            }
        } else {
            return res.status(401).json({ detail: "No active account found with the given credentials" })
        }

    } catch (error) {
        return res.status(200).json({ message: error.message })
    }
}