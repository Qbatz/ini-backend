require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

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



}