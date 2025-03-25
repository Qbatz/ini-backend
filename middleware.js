const jwt = require('jsonwebtoken');
require('dotenv').config();
const connection = require('./src/config/db');

module.exports = (req, res, next) => {

    // let token = req.headers.authorization; // Token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Not Need to Token
    const openEndpoints = [
        '/api/user/login',
        '/api/user/check_mail',
        '/api/user/verify_forgot_otp',
        '/api/user/forgot_password',
        '/api/expenses/all_zoho_expenses',
        '/api/expenses/webhook_expenses',
        '/api/user/create_account'
    ];

    if (openEndpoints.includes(req.originalUrl)) {
        return next();
    } else {
        if (!token) {
            res.status(206).json({ message: "Access denied. No token provided", statusCode: 206 });
        } else {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET, { expiresIn: '1h' });
                req.user_details = decoded;

                var created_by = decoded.id;

                var sql1 = "SELECT * FROM user_accounts WHERE id=? AND status=1";
                connection.query(sql1, [created_by], function (err, data) {
                    if (err) {
                        return res.status(206).json({ message: "Unable to Get User Details", statusCode: 206 });
                    } else if (data.length != 0) {

                        const currentTime = Math.floor(Date.now() / 1000);
                        const timeToExpire = decoded.exp - currentTime;

                        let newToken = null;

                        // Refresh the token
                        if (timeToExpire <= 600) {
                            newToken = jwt.sign(
                                { id: decoded.id, user_name: decoded.user_name, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: '30m' }
                            );
                            res.locals.refresh_token = newToken;
                        }

                        const originalJson = res.json.bind(res);

                        res.json = (body) => {
                            if (newToken) {
                                body.refresh_token = newToken;
                            }
                            originalJson(body);
                        };

                        next();
                    } else {
                        return res.status(206).json({ message: "Invalid User", statusCode: 206 });
                    }
                })

            } catch (err) {
                res.status(206).json({ message: "Access denied. Invalid Token or Token Expired", statusCode: 206 });
            }
        }
    }
}