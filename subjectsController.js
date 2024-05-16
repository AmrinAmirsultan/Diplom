// subjectsController.js
const subjectsService = require('./subjectsService');

// Контроллер для работы с предметами
exports.getSubjects = async (req, res) => {
    try {
        const { course } = req.query;
        const subjects = await subjectsService.getSubjectsByCourse(course);
        res.json(subjects);
    } catch (error) {
        console.error("Error getting subjects:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getRoomsAndTimes = async (req, res) => {
    try {
        const { subject } = req.query;
        const roomsAndTimes = await subjectsService.getRoomsAndTimesBySubject(subject);
        res.json(roomsAndTimes);
    } catch (error) {
        console.error("Error getting rooms and times:", error);
        res.status(500).json({ message: "Server error" });
    }
};
