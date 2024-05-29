// Импорт необходимых функций и объектов из библиотеки mongoose
const { Schema, model } = require('mongoose');

// Определение схемы для модели User
const User = new Schema({
    // Поле username представляет собой имя пользователя и должно быть уникальным и обязательным для заполнения
    username: { type: String, unique: true, required: true },
    // Поле password представляет собой пароль пользователя и обязательно для заполнения
    password: { type: String, required: true },
    // Поле roles представляет собой массив ролей пользователя, каждая роль ссылается на модель Role
    roles: [{ type: String, ref: 'Role' }]
});

// Экспорт модели User
module.exports = model('User', User);
