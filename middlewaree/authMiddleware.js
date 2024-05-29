// Импорт библиотеки jsonwebtoken для работы с JWT токенами и секретного ключа из конфигурации
const jwt = require('jsonwebtoken');
const { secret } = require('../config');

// Экспорт функции middleware для проверки авторизации пользователя
module.exports = function (req, res, next) {
    // Если метод запроса OPTIONS, пропустить дальнейшую обработку и перейти к следующему middleware
    if (req.method === "OPTIONS") {
        next();
    }

    try {
        // Получение токена из заголовка авторизации запроса
        const token = req.headers.authorization.split(' ')[1];
        // Если токен не передан, вернуть статус 403 и сообщение об ошибке
        if (!token) {
            return res.status(403).json({ message: "Пользователь не авторизован" });
        }
        // Верификация токена и извлечение данных пользователя из него
        const decodedData = jwt.verify(token, secret);
        // Присвоение данных пользователя к объекту запроса
        req.user = decodedData;
        // Перейти к следующему middleware
        next();
    } catch (e) {
        // В случае ошибки выводим ее в консоль и возвращаем статус 403 с сообщением об ошибке
        console.log(e);
        return res.status(403).json({ message: "Пользователь не авторизован" });
    }
};
