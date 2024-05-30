const jwt = require('jsonwebtoken');
const { secret } = require('../config');
const User = require('../models/User');

module.exports = async function (req, res, next) {
    if (req.method === 'OPTIONS') {
        next();
    }

    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(403).json({ message: 'Пользователь не авторизован' });
        }
        const decodedData = jwt.verify(token, secret);
        req.user = decodedData;

        const user = await User.findById(decodedData.id);
        if (user.username === 'admin') {
            return res.redirect('/welcome');
        } else {
            return res.redirect('/schedule');
        }
    } catch (e) {
        console.log(e);
        return res.status(403).json({ message: 'Пользователь не авторизован' });
    }
};
