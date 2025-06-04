const db = require('../config/database');

class Student {
    static async findAll() {
        try {
            const studentsQueryResult = await db.query(`
                SELECT
                    s.StudentID AS id,
                    s.FullName AS fullname,
                    s.Email AS email,
                    s.AvatarURL AS avatar,
                    s.DateOfBirth,
                    s.Gender,
                    s.Address,
                    GROUP_CONCAT(DISTINCT c.ClassName) AS class_names,
                    GROUP_CONCAT(DISTINCT co.CourseName) AS courses,
                    GROUP_CONCAT(DISTINCT sub.SubjectName) AS subjects,
                    GROUP_CONCAT(DISTINCT sub.Department) AS departments,
                    GROUP_CONCAT(DISTINCT i.InstructorName) AS instructors,
                    MAX(f.Amount) AS tuition_fee,
                    MAX(f.PaymentStatus) AS payment_status
                FROM Students s
                LEFT JOIN StudentClasses sc ON s.StudentID = sc.StudentID
                LEFT JOIN Classes c ON sc.ClassID = c.ClassID
                LEFT JOIN Courses co ON c.CourseID = co.CourseID
                LEFT JOIN ClassSubjects cs ON c.ClassID = cs.ClassID
                LEFT JOIN Subjects sub ON cs.SubjectID = sub.SubjectID
                LEFT JOIN Instructors i ON cs.InstructorID = i.InstructorID
                LEFT JOIN (
                    SELECT StudentID, Amount, PaymentStatus
                    FROM Financial
                    WHERE FinancialID IN (
                        SELECT MAX(FinancialID)
                        FROM Financial
                        GROUP BY StudentID
                    )
                ) f ON s.StudentID = f.StudentID
                GROUP BY
                    s.StudentID,
                    s.FullName,
                    s.Email,
                    s.AvatarURL,
                    s.DateOfBirth,
                    s.Gender,
                    s.Address
                ORDER BY s.StudentID;
            `);

            if (!studentsQueryResult || studentsQueryResult.length === 0) {
                return [];
            }

            const gradesQueryResult = await db.query(`
                SELECT
                    g.StudentID,
                    s.SubjectName,
                    g.ProcessScore,
                    g.MidtermScore,
                    g.FinalScore
                FROM Grades g
                JOIN Subjects s ON g.SubjectID = s.SubjectID
            `);

            const gradesByStudent = gradesQueryResult.reduce((acc, grade) => {
                if (!acc[grade.StudentID]) {
                    acc[grade.StudentID] = [];
                }
                acc[grade.StudentID].push({
                    subject: grade.SubjectName,
                    process: grade.ProcessScore,
                    midterm: grade.MidtermScore,
                    final: grade.FinalScore
                });
                return acc;
            }, {});

            return studentsQueryResult.map(student => {
                const studentGrades = gradesByStudent[student.id] || [];
                const totalWeightedScores = studentGrades.reduce((sum, grade) => {
                    const processScore = Number(grade.process) || 0;
                    const midtermScore = Number(grade.midterm) || 0;
                    const finalScore = Number(grade.final) || 0;
                    const weightedScore = processScore * 0.3 + midtermScore * 0.2 + finalScore * 0.5;
                    return sum + weightedScore;
                }, 0);
                const averageScore = studentGrades.length > 0 ? (totalWeightedScores / studentGrades.length).toFixed(1) : 'N/A';

                return {
                    id: student.id,
                    name: student.fullname || 'N/A',
                    email: student.email,
                    avatar: student.avatar || '/images/default-avatar.png',
                    dateOfBirth: student.DateOfBirth,
                    gender: student.Gender,
                    address: student.Address,
                    class: student.class_names || 'Chưa phân lớp',
                    courses: student.courses ? student.courses.split(',').map(c => c.trim()) : [],
                    subjects: student.subjects ? student.subjects.split(',').map(s => s.trim()) : [],
                    departments: student.departments ? student.departments.split(',').map(d => d.trim()) : [],
                    instructors: student.instructors ? student.instructors.split(',').map(i => i.trim()) : [],
                    grades: studentGrades,
                    scores: {
                        average: averageScore
                    },
                    tuition: student.tuition_fee || 0,
                    payment_status: student.payment_status || 'Pending'
                };
            });
        } catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [studentResult] = await db.query(`
                SELECT
                    s.*,
                    GROUP_CONCAT(DISTINCT c.ClassName) AS classes,
                    GROUP_CONCAT(DISTINCT co.CourseName) AS courses,
                    GROUP_CONCAT(DISTINCT sub.SubjectName) AS subjects,
                    GROUP_CONCAT(DISTINCT sub.Department) AS departments,
                    GROUP_CONCAT(DISTINCT i.InstructorName) AS instructors,
                    MAX(f.Amount) AS tuition_fee,
                    MAX(f.PaymentStatus) AS payment_status,
                    GROUP_CONCAT(DISTINCT
                        CONCAT(
                            ph.PaymentDate, -- Đã bỏ DATE_FORMAT vì PaymentDate đã là VARCHAR(10) dạng dd-mm-yyyy
                            '|',
                            ph.AmountPaid
                        )
                    ) AS payment_history
                FROM Students s
                LEFT JOIN StudentClasses sc ON s.StudentID = sc.StudentID
                LEFT JOIN Classes c ON sc.ClassID = c.ClassID
                LEFT JOIN Courses co ON c.CourseID = co.CourseID
                LEFT JOIN ClassSubjects cs ON c.ClassID = cs.ClassID
                LEFT JOIN Subjects sub ON cs.SubjectID = sub.SubjectID
                LEFT JOIN Instructors i ON cs.InstructorID = i.InstructorID
                LEFT JOIN Financial f ON s.StudentID = f.StudentID
                LEFT JOIN PaymentHistory ph ON f.FinancialID = ph.FinancialID
                WHERE s.StudentID = ?
                GROUP BY
                    s.StudentID,
                    s.FullName,
                    s.Email,
                    s.AvatarURL,
                    s.DateOfBirth,
                    s.Gender,
                    s.Address
                `, [id]);

            if (!studentResult) {
                return null;
            }

            const gradesResult = await db.query(`
                SELECT
                    s.SubjectName,
                    g.ProcessScore,
                    g.MidtermScore,
                    g.FinalScore
                FROM Grades g
                JOIN Subjects s ON g.SubjectID = s.SubjectID
                WHERE g.StudentID = ?
            `, [id]);

            const validGrades = gradesResult.filter(grade => grade.FinalScore !== null && grade.FinalScore !== undefined);

            const averageScore = validGrades.length > 0
                ? (validGrades.reduce((sum, grade) => {
                    const processScore = Number(grade.ProcessScore) || 0;
                    const midtermScore = Number(grade.MidtermScore) || 0;
                    const finalScore = Number(grade.FinalScore) || 0;
                    return sum + (processScore * 0.3 + midtermScore * 0.2 + finalScore * 0.5);
                }, 0) / validGrades.length).toFixed(1)
                : 'N/A';

            const paymentHistory = studentResult.payment_history
                ? studentResult.payment_history.split(',').map(payment => {
                    const [date, amount] = payment.split('|');
                    return { date, amount: parseFloat(amount) };
                })
                : [];

            return {
                id: studentResult.StudentID,
                name: studentResult.FullName,
                email: studentResult.Email,
                avatar: studentResult.AvatarURL,
                dateOfBirth: studentResult.DateOfBirth,
                gender: studentResult.Gender,
                address: studentResult.Address,
                class: studentResult.classes,
                courses: studentResult.courses ? studentResult.courses.split(',').map(c => c.trim()) : [],
                subjects: studentResult.subjects ? studentResult.subjects.split(',').map(s => s.trim()) : [],
                departments: studentResult.departments ? studentResult.departments.split(',').map(d => d.trim()) : [],
                instructors: studentResult.instructors ? studentResult.instructors.split(',').map(i => i.trim()) : [],
                grades: gradesResult.map(grade => ({
                    subject: grade.SubjectName,
                    process: grade.ProcessScore,
                    midterm: grade.MidtermScore,
                    final: grade.FinalScore
                })),
                scores: {
                    average: averageScore
                },
                tuitionFee: studentResult.tuition_fee || 0,
                paymentStatus: studentResult.payment_status || 'Pending',
                paymentHistory
            };
        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    }
}

module.exports = Student;