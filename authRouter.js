const Router = require('express');
const router = new Router();
const path = require('path');
const controller = require('./authController');
const { check } = require("express-validator");
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');

router.post('/registration', [
    check('username', "Имя пользователя не может быть пустым").notEmpty(),
    check('password', "Пароль должен быть больше 4 и меньше 10 символов").isLength({ min: 4, max: 10 }),
    check('course', "Курс должен быть указан").isInt({ min: 1, max: 2 })
], controller.registration);

router.post('/login', controller.login);
router.get('/users', roleMiddleware(["ADMIN"]), controller.getUsers);

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

module.exports = router;
