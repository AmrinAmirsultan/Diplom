const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Подключение к MongoDB
mongoose.connect('mongodb+srv://qwerty:qwerty123@cluster0.xzyxfeu.mongodb.net/auth_roles?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// Модель данных для предметов
const Subject = mongoose.model('Subject', {
    subject: String,
    room: String,
    time: String,
    day: String,
    teacher: String, // Добавляем поле учителя
    course: String
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Роутеры
const authRouter = require('./authRouter');
app.use("/auth", authRouter);

app.post('/auth/subjects', async (req, res) => {
    const selectedSubjects = req.body;
    console.log('Selected Subjects:', selectedSubjects); // Выводим в консоль для отладки

    try {
        // Сохраняем выбранные предметы в базе данных MongoDB
        for (const subject of selectedSubjects) {
            await Subject.create({
                subject: subject.subject,
                room: subject.room,
                time: subject.time,
                day: subject.day,
                teacher: subject.teacher,
                course: subject.course // Убедитесь, что это поле правильно передается из запроса
            });
        }

        res.status(200).json({ message: 'Selected subjects saved successfully' });
    } catch (error) {
        console.error('Error saving selected subjects:', error);
        res.status(500).json({ message: 'Error saving selected subjects' });
    }
});

// Обработчик GET запроса на страницу расписания
app.get('/schedule', async (req, res) => {
    try {
        // Получаем последние три записи из базы данных
        const subjects = await Subject.find().sort({ _id: -1 }).limit(3);

        // Отправляем HTML-страницу и данные для таблицы
        res.sendFile(path.join(__dirname, 'public', 'schedule.html'));
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Error fetching subjects' });
    }
});

// Обработчик для получения данных расписания
app.get('/api/schedule', async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ _id: -1 }).limit(3);
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Error fetching subjects' });
    }
});


// Страница приветствия
app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

// Админ маршруты
app.get('/api/admin/subjects', async (req, res) => {
    try {
        // Получаем все записи
        const subjects = await Subject.find().sort({ _id: -1 }).limit(100);
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Error fetching subjects' });
    }
});

app.put('/api/admin/subject/:id', async (req, res) => {
    try {
        const subjectId = req.params.id;
        const updatedData = req.body;

        // Обновляем запись в базе данных
        const updatedSubject = await Subject.findByIdAndUpdate(subjectId, updatedData, { new: true });
        res.json(updatedSubject);
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({ message: 'Error updating subject' });
    }
});

app.delete('/api/admin/subject/:id', async (req, res) => {
    try {
        const subjectId = req.params.id;

        // Удаляем запись из базы данных
        await Subject.findByIdAndDelete(subjectId);
        res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ message: 'Error deleting subject' });
    }
});

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
