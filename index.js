const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');
const authRouter = require('./authRouter');
const User = require('./models/User');
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
const subjectSchema = new mongoose.Schema({
    subject: String,
    room: String,
    time: String,
    day: String,
    teacher: String,
    course: String,
    student: String // новое поле для хранения имени студента
});

const Subject = mongoose.model('Subject', subjectSchema);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

// Роутеры
app.use('/auth', authRouter);

app.post('/auth/subjects', (req, res) => {
    const { student, subjects } = req.body;
    saveScheduleForStudent(student, subjects)
        .then(() => res.status(200).send('Subjects submitted successfully'))
        .catch(error => {
            console.error('Error saving subjects:', error);
            res.status(500).send('Error saving subjects');
        });
});

function saveScheduleForStudent(student, subjects) {
    return new Promise(async (resolve, reject) => {
        try {
            for (const subject of subjects) {
                await Subject.create({
                    subject: subject.subject,
                    room: subject.room,
                    time: subject.time,
                    day: subject.day,
                    teacher: subject.teacher,
                    course: subject.course,
                    student: student // сохраняем имя студента
                });
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// Обработчик GET запроса на страницу расписания
app.get('/schedule', authMiddleware, async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ _id: -1 }).limit(3);
        res.sendFile(path.join(__dirname, 'public', 'schedule.html'));
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Error fetching subjects' });
    }
});

// Обработчик для получения данных расписания
app.get('/api/schedule', authMiddleware, async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ _id: -1 }).limit(3);
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Error fetching subjects' });
    }
});

// Обработчик для получения расписания студента
app.get('/admin/schedule', authMiddleware, async (req, res) => {
    const student = req.query.student;
    console.log('Fetching schedule for student:', student);

    try {
        const subjects = await Subject.find({ student: student });
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Error fetching subjects' });
    }
});

// Страница приветствия
app.get('/welcome', authMiddleware, async (req, res) => {
    const users = await User.find({ roles: 'USER' }).select('username');
    res.render('welcome', { users });
});

// Админ маршруты
app.get('/api/admin/subjects', authMiddleware, roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ _id: -1 }).limit(100);
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Error fetching subjects' });
    }
});

app.put('/api/admin/subject/:id', authMiddleware, roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        const subjectId = req.params.id;
        const updatedData = req.body;

        const updatedSubject = await Subject.findByIdAndUpdate(subjectId, updatedData, { new: true });
        res.json(updatedSubject);
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({ message: 'Error updating subject' });
    }
});

app.delete('/api/admin/subject/:id', authMiddleware, roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        const subjectId = req.params.id;

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
