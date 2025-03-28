const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Not Need to Token
    const openEndpoints = [
        '/user/email_verify',
        '/user/forgot-password',
        '/user/reset-password-valid-check',
        '/user/reg-send-otp',
        '/user/reg-verify-otp',
        '/user/email-verify-confirm',
        '/user/company-registration',
        '/user/forgot-clientid',
        '/auth/token',
        '/user/reset-password',
    ];

    if (openEndpoints.includes(req.originalUrl)) {
        return next();
    } else {
        if (!token) {
            res.status(206).json({ message: "Access denied. No token provided", statusCode: 206 });
        } else {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET, { expiresIn: '1h' });
                req.user_id = decoded.id

                // const currentTime = Math.floor(Date.now() / 1000);
                // const timeToExpire = decoded.exp - currentTime;

                // let newToken = null;

                // // Refresh the token
                // if (timeToExpire <= 600) {
                //     newToken = jwt.sign(
                //         { id: decoded.id, sub: "access" }, process.env.JWT_SECRET, { expiresIn: '30m' }
                //     );
                //     res.locals.refresh_token = newToken;
                // }

                // const originalJson = res.json.bind(res);

                // res.json = (body) => {
                //     if (newToken) {
                //         body.refresh_token = newToken;
                //     }
                //     originalJson(body);
                // };

                next();
            } catch (err) {
                res.status(206).json({ message: "Access denied. Invalid Token or Token Expired", statusCode: 206 });
            }
        }
    }
}