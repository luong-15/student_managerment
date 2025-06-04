const db = require('../config/database');
const Student = require('../models/Student');

exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.findAll();
        res.render('index', {
            students: students || [],
            user: req.session.user || {}
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.render('error', {
            error: 'Error',
            message: 'Failed to fetch students'
        });
    }
};

exports.getAddStudentPage = (req, res) => {
    res.render('students/add', { error: null });
};

exports.addStudent = (req, res) => {
    res.send('Add student POST route');
};

exports.getStudent = (req, res) => {
    res.send('Get student route');
};

exports.updateStudent = (req, res) => {
    res.send('Update student POST route');
};

exports.deleteStudent = async (req, res) => {
    let connection;
    try {
        const pool = await db.createPool();
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const studentId = req.params.id;

        await connection.query('DELETE FROM Grades WHERE StudentID = ?', [studentId]);

        await connection.query('DELETE FROM PaymentHistory WHERE FinancialID IN (SELECT FinancialID FROM Financial WHERE StudentID = ?)', [studentId]);

        await connection.query('DELETE FROM Financial WHERE StudentID = ?', [studentId]);

        await connection.query('DELETE FROM StudentClasses WHERE StudentID = ?', [studentId]);

        const [result] = await connection.query('DELETE FROM Students WHERE StudentID = ?', [studentId]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sinh viên'
            });
        }

        await connection.commit();
        res.json({
            success: true,
            message: 'Xóa sinh viên thành công'
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Lỗi khi xóa sinh viên:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xóa sinh viên'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};