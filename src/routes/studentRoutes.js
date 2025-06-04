const db = require('../config/database');
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/', studentController.getAllStudents);
router.get('/add', studentController.getAddStudentPage);
router.delete('/api/students/:id', studentController.deleteStudent);

router.get('/api/courses', async (req, res) => {
    try {
        const courses = await db.query(`
            SELECT 
                CourseID as id,
                CourseName as name
            FROM Courses
            ORDER BY CourseID
        `);
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/classes', async (req, res) => {
    try {
        const { courseId } = req.query;
        const classes = await db.query(`
            SELECT 
                c.ClassID as id,
                c.ClassName as name
            FROM Classes c
            WHERE c.CourseID = ?
            ORDER BY c.ClassName
        `, [courseId]);
        res.json(classes);
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/subjects', async (req, res) => {
    try {
        const { classId } = req.query;
        const subjects = await db.query(`
            SELECT 
                s.SubjectID as id,
                s.SubjectName as name,
                s.Department as department,
                GROUP_CONCAT(i.InstructorName) as instructors
            FROM Subjects s
            LEFT JOIN ClassSubjects cs ON s.SubjectID = cs.SubjectID
            LEFT JOIN Instructors i ON cs.InstructorID = i.InstructorID
            WHERE cs.ClassID = ?
            GROUP BY s.SubjectID, s.SubjectName, s.Department
            ORDER BY s.SubjectName
        `, [classId]);
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/subjects/:id/details', async (req, res) => {
    try {
        const subjectId = req.params.id;
        const details = await db.query(`
            SELECT
                s.Department as department,
                GROUP_CONCAT(i.InstructorName SEPARATOR ', ') as instructors
            FROM Subjects s
            LEFT JOIN ClassSubjects cs ON s.SubjectID = cs.SubjectID
            LEFT JOIN Instructors i ON cs.InstructorID = i.InstructorID
            WHERE s.SubjectID = ?
            GROUP BY s.SubjectID, s.Department
        `, [subjectId]);

        const result = details[0] || {};
        res.json({
            department: result.department || '',
            instructors: result.instructors ? result.instructors.split(', ') : []
        });
    } catch (error) {
        console.error('Error fetching subject details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/grades', async (req, res) => {
    try {
        const { classId, studentId } = req.query;
        
        if (!classId || !studentId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: classId or studentId'
            });
        }

        const gradesQuery = `
            SELECT
                g.GradeID,
                sub.SubjectName,
                g.ProcessScore,
                g.MidtermScore,
                g.FinalScore
            FROM Grades g
            JOIN Subjects sub ON g.SubjectID = sub.SubjectID
            JOIN ClassSubjects cs ON g.SubjectID = cs.SubjectID
            WHERE g.StudentID = ?
            AND cs.ClassID = ?
            ORDER BY sub.SubjectName ASC
        `;

        const grades = await db.query(gradesQuery, [studentId, classId]);

        const formattedGrades = grades.map(grade => ({
            gradeId: grade.GradeID,
            subjectName: grade.SubjectName,
            processScore: grade.ProcessScore,
            midtermScore: grade.MidtermScore,
            finalScore: grade.FinalScore
        }));

        res.json({
            success: true,
            data: formattedGrades,
            message: 'Lấy điểm số thành công'
        });

    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy điểm số'
        });
    }
});

module.exports = router;
