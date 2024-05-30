const jwt = require('jsonwebtoken');
const { secret } = require('../config');

module.exports = function (roles) {
    return function (req, res, next) {
        if (req.method === 'OPTIONS') {
            next();
        }

        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(403).json({ message: 'Пользователь не авторизован' });
            }
            const decodedData = jwt.verify(token, secret);
            let hasRole = false;
            decodedData.roles.forEach(role => {
                if (roles.includes(role)) {
                    hasRole = true;
                }
            });
            if (!hasRole) {
                return res.status(403).json({ message: 'У вас нет доступа' });
            }
            next();
        } catch (e) {
            console.log(e);
            return res.status(403).json({ message: 'Пользователь не авторизован' });
        }
    };
};
