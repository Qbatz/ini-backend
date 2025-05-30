require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const { UserForgotPasswordOtp, UserMobileVerifyOtp } = require('../models/login');
const { UserEmailVerify, AuthUser } = require('../models/users')
const { UserCompany, UserProfile } = require('../models/register');
const { Op, fn, col, where } = require("sequelize");
const { Activity } = require('../models/activites');
const activityid = require('../components/activityid');


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

        const existingCustomer = await UserCompany.findOne({
            where: { customer_id: customerId },
            attributes: ['id'],
        });

        if (!existingCustomer) {
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
    try {
        const { email, email_verify_token, first_name, last_name, password, password2, phone, mobile, otp, otp_verified, username } = req.body;

        // Validation
        if (!email) return res.status(400).json({ message: "Missing Email Id" });
        if (!email_verify_token) return res.status(400).json({ message: "Missing Mail Verification Token" });
        if (!first_name) return res.status(400).json({ message: "Missing First Name" });
        if (!password) return res.status(400).json({ message: "Missing Password" });
        if (!password2) return res.status(400).json({ message: "Missing Confirm Password" });
        if (!phone) return res.status(400).json({ message: "Missing Phone Detail" });
        if (!mobile) return res.status(400).json({ message: "Missing Mobile Detail" });
        if (!otp_verified) return res.status(400).json({ message: "Missing OTP Verification Detail" });
        if (!username) return res.status(400).json({ message: "Missing UserName Detail" });

        if (password !== password2) {
            return res.status(400).json({ message: "Password Does Not Match" });
        }

        // Check if email is verified
        const emailRecord = await UserEmailVerify.findOne({
            where: { verify_code: email_verify_token, email }
        });

        if (!emailRecord || emailRecord.is_verified != 0) {
            return res.status(400).json({ message: "Invalid Mail or Verify Code" });
        }

        // Check if mobile is verified
        const mobileRecord = await UserMobileVerifyOtp.findOne({
            where: { mobile, otp }
        });

        if (!mobileRecord || mobileRecord.is_verified !== 1) {
            return res.status(400).json({ message: "Invalid Mobile or OTP Details" });
        }

        // Check if user already exists
        const existingUser = await AuthUser.findOne({
            where: {
                [Op.or]: [{ username }, { email }],
                is_active: true
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: "Email or Username Already Registered" });
        }

        const hashedPassword = hashPassword(password);

        const newUser = await AuthUser.create({
            password: hashedPassword,
            is_superuser: false,
            username,
            first_name,
            last_name,
            email,
            is_staff: false,
            is_active: true,
            date_joined: new Date()
        });

        const user_id = newUser.id;
        const customerId = await generateCustomerId();

        const newCompany = await UserCompany.create({
            company_name: ' ',
            gstin_vat: ' ',
            customer_id: customerId,
            created_on: new Date(),
            updated_on: new Date(),
            created_by_id: user_id,
            updated_by_id: user_id,
            user_id,
            same_address: 0,
            lock_company_info: 0
        });

        const company_id = newCompany.id;

        await UserProfile.create({
            is_owner: 1,
            gender: 0,
            phone,
            mobile,
            created_on: new Date(),
            updated_on: new Date(),
            company_id,
            created_by_id: user_id,
            updated_by_id: user_id,
            user_id
        });

        // Update verification status
        await UserEmailVerify.update(
            { is_verified: 1, updated_on: new Date() },
            { where: { id: emailRecord.id } }
        );

        const activity_id = await activityid.generateNextActivityId();

        await Activity.create({
            activity_id,
            activity_type_id: "ACT002",
            user_id,
            description: "User Registerd In",
            created_by_id: user_id
        });


        // Send email notification
        const new_url = process.env.SITE_URL;
        const htmlFilePath = path.join(__dirname, '../mail_templates', 'register_mail.html');
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

        htmlContent = htmlContent
            .replace('{{first_name}}', first_name)
            .replace('{{last_name}}', last_name)
            .replace('{{customer_id}}', customerId)
            .replace('{{username}}', username)
            .replace('{{site_url}}', new_url);

        await transport.sendMail({
            from: '"MyApp Support" <no-reply@myapp.com>',
            to: email,
            subject: "Inai Login Credentials",
            html: htmlContent,
        });

        return res.status(200).json({
            message: "<b>Mail Verified</b> Successfully, We have created a unique Client ID.<br/>Please check your registered email and log in to proceed with registration."
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
    }
};

const generateToken = (user) => {
    return jsonwebtoken.sign({ id: user.id, sub: "access" }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

exports.login = async (req, res) => {
    var { company_code, password, username } = req.body;

    if (!company_code) {
        return res.status(400).json({ message: "Missing Client Id" });
    }

    if (!username) {
        return res.status(400).json({ message: "Missing User Id" });
    }

    if (!password) {
        return res.status(400).json({ message: "Missing Password" });
    }

    try {
        // Fetch user details using Sequelize model
        const user = await AuthUser.findOne({
            attributes: ['id', 'password', 'first_name', 'last_name', 'email', 'username'],
            include: [{
                model: UserCompany,
                where: { customer_id: company_code },
                attributes: []
            }],
            where: { username, is_active: true }
        });

        if (!user) {
            return res.status(401).json({ detail: "No active account found with the given credentials" });
        }

        // Verify password
        const check_password = verifyPassword(password, user.password);
        if (!check_password) {
            return res.status(402).json({ detail: "Invalid Password" });
        }

        // Generate token
        const token = generateToken(user);
        console.log(token);
        
        const activity_id = await activityid.generateNextActivityId();

        await Activity.create({
            activity_id,
            activity_type_id: "ACT001",
            user_id: user.id,
            description: "User Logged In",
            created_by_id: user.id
        });

        // Update last login time
        await user.update({ last_login: new Date() });

        return res.status(200).json({ access: token });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};


exports.reset_password = async (req, res) => {

    var { password, password2, verify_code } = req.body;

    if (!password || !password2 || !verify_code) {
        return res.status(400).json({ message: "Missing Mandatory Fields" });
    }

    if (password !== password2) {
        return res.status(400).json({ message: "Password Does Not Match" });
    }

    try {
        const otpEntry = await UserForgotPasswordOtp.findOne({
            where: { otp: verify_code, is_active: 1 }
        });

        if (!otpEntry) {
            return res.status(400).json({ message: "Invalid Or Expired Verify Code" });
        }

        const new_password = hashPassword(password);

        await AuthUser.update(
            { password: new_password },
            { where: { id: otpEntry.user_id } }
        );

        await UserForgotPasswordOtp.update(
            { is_active: 0 },
            { where: { otp: verify_code } }
        );

        const activity_id = await activityid.generateNextActivityId();

        await Activity.create({
            activity_id,
            activity_type_id: "ACT003",
            user_id: otpEntry.user_id,
            description: "User Password Has Been Reset",
            created_by_id: otpEntry.user_id
        });

        return res.status(200).json({ message: "Password Updated Successfully" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
