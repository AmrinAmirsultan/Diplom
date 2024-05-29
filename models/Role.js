// Импорт необходимых функций и объектов из библиотеки mongoose
const { Schema, model } = require('mongoose');

// Определение схемы для модели Role
const Role = new Schema({
    // Поле value представляет собой значение роли пользователя
    value: { type: String, unique: true, default: "USER" }
});

// Экспорт модели Role
module.exports = model('Role', Role);
