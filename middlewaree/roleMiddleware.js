// Импорт библиотеки jsonwebtoken для работы с JWT токенами и секретного ключа из конфигурации
const jwt = require('jsonwebtoken');
const { secret } = require('../config');

// Экспорт функции middleware, принимающей роли пользователей
module.exports = function (roles) {
    // Возвращение функции middleware для обработки запросов
    return function (req, res, next) {
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
            // Проверка токена и извлечение ролей пользователя из него
            const { roles: userRoles } = jwt.verify(token, secret);
            // Проверка наличия необходимых ролей у пользователя
            let hasRole = false;
            userRoles.forEach(role => {
                if (roles.includes(role)) {
                    hasRole = true;
                }
            });
            // Если у пользователя нет необходимых ролей, вернуть статус 403 и сообщение об ошибке
            if (!hasRole) {
                return res.status(403).json({ message: "У вас нет доступа" });
            }
            // Перейти к следующему middleware
            next();
        } catch (e) {
            // В случае ошибки выводим ее в консоль и возвращаем статус 403 с сообщением об ошибке
            console.log(e);
            return res.status(403).json({ message: "Пользователь не авторизован" });
        }
    };
};
