const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter');
const path = require('path');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use("/auth", authRouter);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

// Модель данных для предметов
const Subject = mongoose.model('Subject', {
    subject: String,
    room: String,
    time: String,
    day: String
});

app.post('/auth/subjects', async (req, res) => {
    const selectedSubjects = req.body;

    try {
        // Сохраняем выбранные предметы в базе данных MongoDB
        for (const subject of selectedSubjects) {
            await Subject.create(subject);
        }

        res.status(200).json({ message: 'Selected subjects saved successfully' });
    } catch (error) {
        console.error('Error saving selected subjects:', error);
        res.status(500).json({ message: 'Error saving selected subjects' });
    }
});

const start = async () => {
    try {
        await mongoose.connect('mongodb+srv://qwerty:qwerty123@cluster0.xzyxfeu.mongodb.net/auth_roles?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (e) {
        console.error('Error connecting to MongoDB:', e);
    }
};

start();
