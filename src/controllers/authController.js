const db = require('../config/database');
const { query, pool } = require('../config/database');
const Student = require('../models/Student');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const verifyAuthToken = async (token) => {
    try {
        const [user] = await query(
            'SELECT AccountID, Email, Username, AvatarURL, Role FROM accounts WHERE AuthToken = ? LIMIT 1',
            [token]
        );
        return user || null;
    } catch (error) {
        console.error('Lỗi xác minh token:', error);
        return null;
    }
};

exports.checkAuthToken = async (req, res, next) => {
    try {
        if (req.session.user) {
            return next();
        }

        const authToken = req.cookies.auth_token;
        if (!authToken) {
            return next();
        }

        const user = await verifyAuthToken(authToken);
        if (user) {
            req.session.userId = user.AccountID;
            req.session.email = user.Email;
            req.session.username = user.Username;
            req.session.avatarURL = user.AvatarURL;
            req.session.user = {
                id: user.AccountID,
                email: user.Email,
                username: user.Username,
                avatarURL: user.AvatarURL,
                role: user.Role
            };
            console.log('Người dùng tự động đăng nhập qua auth_token:', user.Username);
        } else {
            res.clearCookie('auth_token');
        }
        next();
    } catch (error) {
        console.error('Auth token check error:', error);
        next();
    }
};

exports.getLoginPage = (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('account', {
        error: null,
        success: null,
        message: null
    });
};

exports.login = async (req, res) => {
    try {
        const { email, password, remember } = req.body;

        if (!email || !password) {
            return res.render('account', {
                error: 'Email và mật khẩu là bắt buộc',
                success: null,
                message: null
            });
        }

        const users = await query(
            'SELECT accountid, email, username, password, avatarURL, auth_token, role FROM accounts WHERE email = ? LIMIT 1',
            [email]
        );

        const user = users[0];

        if (!user || !user.password) {
            return res.render('account', {
                error: 'Email hoặc mật khẩu không đúng',
                success: null,
                message: null
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.render('account', {
                error: 'Email hoặc mật khẩu không đúng',
                success: null,
                message: null
            });
        }

        req.session.userId = user.accountid;
        req.session.email = user.email;
        req.session.username = user.username;
        req.session.avatarURL = user.avatarURL;
        req.session.user = {
            id: user.accountid,
            email: user.email,
            username: user.username,
            avatarURL: user.avatarURL,
            role: user.role
        };

        if (remember) {
            let authToken = user.auth_token;
            if (!authToken) {
                authToken = crypto.randomBytes(32).toString('hex');
                await query('UPDATE accounts SET auth_token = ? WHERE accountid = ?', [authToken, user.accountid]);
            }
            res.cookie('auth_token', authToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
            console.log(`Auth token set for user: ${user.username}`);
        } else {
            if (user.auth_token) {
                await query('UPDATE accounts SET auth_token = NULL WHERE accountid = ?', [user.accountid]);
            }
            res.clearCookie('auth_token');
        }

        res.redirect('/');

    } catch (error) {
        console.error('Login error:', error);
        res.render('account', {
            error: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.',
            success: null,
            message: null
        });
    }
};

exports.logout = async (req, res) => {
    try {
        if (req.session.userId) {
            await query('UPDATE accounts SET auth_token = NULL WHERE accountid = ?', [req.session.userId]);
        }

        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.redirect('/');
            }
            res.clearCookie('connect.sid');
            res.clearCookie('auth_token');
            res.redirect('/auth/login');
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.redirect('/');
    }
};

exports.getRegisterPage = (req, res) => {
    res.render('account', {
        error: null,
        success: null,
        message: null
    });
};

exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            return res.render('account', {
                error: 'Vui lòng điền đầy đủ tất cả các trường.',
                success: null,
                message: null
            });
        }

        const existingUser = await query(
            'SELECT accountid FROM accounts WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.render('account', {
                error: 'Email này đã được sử dụng. Vui lòng chọn email khác.',
                success: null,
                message: null
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await query(
            `INSERT INTO accounts (username, email, password, role, JoinDate, StudentID, InstructorID)
             VALUES (?, ?, ?, ?, CURDATE(), NULL, NULL)`,
            [username, email, hashedPassword, role]
        );

        res.render('account', {
            error: null,
            success: 'Đăng ký thành công! Vui lòng đăng nhập.',
            message: null
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.render('account', {
            error: 'Đăng ký thất bại. Vui lòng thử lại sau.',
            success: null,
            message: null
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.session.userId;

        const [user] = await query(
            `SELECT
                a.AccountID,
                a.Username,
                a.Email,
                a.Role,
                a.JoinDate,
                a.AvatarURL
            FROM Accounts a
            WHERE a.AccountID = ?`,
            [userId]
        );

        if (!user) {
            return res.render('error', {
                error: 'Không tìm thấy',
                message: 'Không tìm thấy thông tin hồ sơ người dùng.'
            });
        }

        res.render('profile', {
            user: {
                id: user.AccountID,
                username: user.Username,
                email: user.Email,
                role: user.Role,
                avatarUrl: user.AvatarURL,
                joinDate: user.JoinDate ? new Date(user.JoinDate).toLocaleDateString('vi-VN') : 'N/A',
            },
            error: null,
            success: null
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.render('error', {
            error: 'Lỗi',
            message: 'Đã xảy ra lỗi khi tải hồ sơ người dùng.'
        });
    }
};


exports.updateProfile = async (req, res) => {
    let connection;
    try {
        const pool = await db.createPool();
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const userId = req.session.userId;
        const { username, email } = req.body;

        if (!username || !email) {
            return res.json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        await connection.query(
            'UPDATE accounts SET username = ?, email = ? WHERE accountid = ?',
            [username, email, userId]
        );

        req.session.user.username = username;
        req.session.user.email = email;

        await connection.commit();
        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công'
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật thông tin'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ mật khẩu hiện tại và mật khẩu mới.'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 8 ký tự.'
            });
        }

        const [user] = await query(
            'SELECT password FROM accounts WHERE accountid = ?',
            [userId]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản.'
            });
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng.'
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await query(
            'UPDATE accounts SET password = ? WHERE accountid = ?',
            [hashedPassword, userId]
        );

        await query(
            'UPDATE accounts SET auth_token = NULL WHERE accountid = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công! Vui lòng đợi 2s để đăng nhập lại.',
            requireRelogin: true
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại sau.'
        });
    }
};

exports.updateAvatar = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { avatarUrl } = req.body;

        if (!avatarUrl) {
            return res.status(400).json({
                success: false,
                message: 'URL ảnh đại diện không được để trống'
            });
        }

        try {
            new URL(avatarUrl);
        } catch (e) {
            return res.status(400).json({
                success: false,
                message: 'URL ảnh đại diện không hợp lệ'
            });
        }

        await query(
            'UPDATE accounts SET AvatarURL = ? WHERE accountid = ?',
            [avatarUrl, userId]
        );

        if (req.session.user) {
            req.session.user.avatarURL = avatarUrl;
        }

        res.json({
            success: true,
            message: 'Cập nhật ảnh đại diện thành công',
            avatarUrl: avatarUrl
        });

    } catch (error) {
        console.error('Update avatar error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật ảnh đại diện'
        });
    }
};

exports.getStudentInformation = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        const studentId = req.params.id;

        const studentQuerySql = `
            SELECT
                s.StudentID AS id,
                s.FullName AS name,
                s.Email AS email,
                s.AvatarURL AS avatar,
                s.DateOfBirth,
                s.Gender,
                s.Address,
                GROUP_CONCAT(DISTINCT c.ClassName) AS classes,
                GROUP_CONCAT(DISTINCT co.CourseName) AS courses,
                GROUP_CONCAT(DISTINCT sub.SubjectName) AS subjects,
                GROUP_CONCAT(DISTINCT sub.Department) AS departments,
                GROUP_CONCAT(DISTINCT i.InstructorName) AS instructors,
                MAX(f.Amount) AS tuition_fee,
                MAX(f.PaymentStatus) AS payment_status,
                GROUP_CONCAT(DISTINCT
                    CONCAT(
                        DATE_FORMAT(ph.PaymentDate, '%Y-%m-%d'),
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
            ORDER BY s.StudentID;
        `;

        const [studentResult] = await db.query(studentQuerySql, [studentId]);

        if (!studentResult) {
            console.warn(`Student with ID ${studentId} not found.`);
            return res.status(404).render('error', {
                message: 'Không tìm thấy sinh viên.',
                error: { status: 404 }
            });
        }

        const gradesResult = await db.query(`
            SELECT
                sub.SubjectName,
                g.ProcessScore,
                g.MidtermScore,
                g.FinalScore
            FROM Grades g
            JOIN Subjects sub ON g.SubjectID = sub.SubjectID
            WHERE g.StudentID = ?
        `, [studentId]);

        const gradesMap = new Map();
        gradesResult.forEach(grade => {
            gradesMap.set(grade.SubjectName, {
                subject: grade.SubjectName,
                process: grade.ProcessScore,
                midterm: grade.MidtermScore,
                final: grade.FinalScore
            });
        });
        const formattedGrades = Array.from(gradesMap.values());

        const validGradesForAverage = formattedGrades.filter(grade =>
            grade.process !== null && grade.process !== undefined &&
            grade.midterm !== null && grade.midterm !== undefined &&
            grade.final !== null && grade.final !== undefined
        );

        let averageScore = 'N/A';
        if (validGradesForAverage.length > 0) {
            const totalWeightedScore = validGradesForAverage.reduce((sum, grade) => {
                return sum + (Number(grade.process) * 0.3) + (Number(grade.midterm) * 0.2) + (Number(grade.final) * 0.5);
            }, 0);
            averageScore = (totalWeightedScore / validGradesForAverage.length).toFixed(1);
        }

        const formattedStudent = {
            id: studentResult.id,
            name: studentResult.name || 'N/A',
            email: studentResult.email || 'N/A',
            avatar: studentResult.avatar || '/images/default-avatar.png',
            dateOfBirth: (() => {
                if (!studentResult.DateOfBirth) {
                    return null;
                }
                let dateObj;
                if (studentResult.DateOfBirth instanceof Date) {
                    dateObj = studentResult.DateOfBirth;
                } else if (typeof studentResult.DateOfBirth === 'string') {
                    dateObj = new Date(studentResult.DateOfBirth);
                } else {
                    return null;
                }
                if (isNaN(dateObj.getTime())) {
                    return null;
                }
                return dateObj.toISOString().split('T')[0];
            })(),
            gender: studentResult.Gender || 'N/A',
            address: studentResult.Address || 'N/A',
            classes: studentResult.classes ? studentResult.classes.split(',').map(c => c.trim()) : [],
            courses: studentResult.courses ? studentResult.courses.split(',').map(c => c.trim()) : [],
            subjects: studentResult.subjects
                ? Array.from(new Set(studentResult.subjects.split(',').map(s => s.trim())))
                : [],
            departments: studentResult.departments ? studentResult.departments.split(',').map(d => d.trim()) : [],
            instructors: studentResult.instructors ? Array.from(new Set(studentResult.instructors.split(',').map(i => i.trim()))) : [],

            grades: formattedGrades,

            scores: {
                average: averageScore
            },
            tuition: studentResult.tuition_fee || 0,
            payment_status: studentResult.payment_status || 'Unknown',
            payment_history: studentResult.payment_history
                ? studentResult.payment_history.split(',').map(payment => {
                    const [date, amount] = payment.split('|');
                    return { date, amount: parseFloat(amount) || 0 };
                })
                : []
        };

        res.render('information', {
            student: formattedStudent,
            user: req.session.user
        });

    } catch (error) {
        console.error('Error fetching student information:', error);
        res.status(500).render('error', {
            message: 'Đã xảy ra lỗi khi tải thông tin sinh viên.',
            error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined }
        });
    }
};


exports.updateStudent = async (req, res) => {
    let connection;
    try {
        const pool = await db.createPool();
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const { personalInfo, academicInfo, scores, financial } = req.body;
        const studentId = req.params.id;

        const dateOfBirth = personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth) : null;

        await connection.query(
            `UPDATE Students
             SET FullName = ?,
                 Email = ?,
                 DateOfBirth = ?,
                 Gender = ?,
                 Address = ?,
                 AvatarURL = ?
             WHERE StudentID = ?`,
            [
                personalInfo.name,
                personalInfo.email,
                dateOfBirth,
                personalInfo.gender,
                personalInfo.address || null,
                personalInfo.avatar || null,
                studentId
            ]
        );

        await connection.query(
            `DELETE FROM StudentClasses WHERE StudentID = ?`,
            [studentId]
        );
        if (academicInfo.classId) {
            await connection.query(
                `INSERT INTO StudentClasses (StudentID, ClassID)
                 VALUES (?, ?)`,
                [studentId, academicInfo.classId]
            );
        }

        if (scores.grades && Object.keys(scores.grades).length > 0) {
            await connection.query(
                `DELETE FROM Grades WHERE StudentID = ?`,
                [studentId]
            );

            for (const [subjectName, scoreDetails] of Object.entries(scores.grades)) {
                const processScore = parseFloat(scoreDetails.process_score) || null;
                const midtermScore = parseFloat(scoreDetails.midterm_score) || null;
                const finalScore = parseFloat(scoreDetails.final_score) || null;

                const [subjectRow] = await connection.query(
                    'SELECT SubjectID FROM Subjects WHERE SubjectName = ?',
                    [subjectName]
                );

                if (subjectRow && subjectRow.length > 0) {
                    const subjectId = subjectRow[0].SubjectID;
                    await connection.query(
                        `INSERT INTO Grades (StudentID, SubjectID, ProcessScore, MidtermScore, FinalScore)
                         VALUES (?, ?, ?, ?, ?)`,
                        [studentId, subjectId, processScore, midtermScore, finalScore]
                    );
                } else {
                    console.warn(`Môn học với tên '${subjectName}' không tìm thấy trong cơ sở dữ liệu. Bỏ qua việc cập nhật điểm cho môn này.`);
                }
            }
        } else {
            await connection.query(
                `DELETE FROM Grades WHERE StudentID = ?`,
                [studentId]
            );
        }


        const [existingFinancial] = await connection.query(
            `SELECT FinancialID FROM Financial WHERE StudentID = ?`,
            [studentId]
        );

        const tuitionAmount = parseFloat(String(financial.tuition).replace(/[^0-9.]/g, '')) || 0;

        if (existingFinancial.length > 0) {
            await connection.query(
                `UPDATE Financial
                 SET Amount = ?, PaymentStatus = ?
                 WHERE StudentID = ?`,
                [
                    tuitionAmount,
                    financial.paymentStatus,
                    studentId
                ]
            );
        } else {
            await connection.query(
                `INSERT INTO Financial (StudentID, Amount, PaymentStatus)
                 VALUES (?, ?, ?)`,
                [
                    studentId,
                    tuitionAmount,
                    financial.paymentStatus
                ]
            );
        }

        await connection.commit();
        res.json({
            success: true,
            message: 'Cập nhật thông tin sinh viên thành công'
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật sinh viên: ' + error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};


exports.createStudent = async (req, res) => {
    let connection;
    try {
        const pool = await db.createPool();
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const {
            personalInfo,
            academicInfo,
            scores,
            financial
        } = req.body;

        if (!personalInfo || !personalInfo.name || !personalInfo.email || !academicInfo.classId) {
            throw new Error('Thiếu thông tin bắt buộc: Họ và tên, Email và Mã lớp.');
        }

        const [studentResult] = await connection.query(
            `INSERT INTO Students (
                FullName, Email, DateOfBirth, Gender, Address, AvatarURL
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                personalInfo.name,
                personalInfo.email,
                personalInfo.dateOfBirth || null,
                personalInfo.gender || null,
                personalInfo.address || null,
                personalInfo.avatar || 'https://placehold.co/100x100'
            ]
        );
        const studentId = studentResult.insertId;

        await connection.query(
            'INSERT INTO StudentClasses (StudentID, ClassID) VALUES (?, ?)',
            [studentId, academicInfo.classId]
        );

        if (scores.subjectScores && Object.keys(scores.subjectScores).length > 0) {
            for (const [subjectId, subjectScores] of Object.entries(scores.subjectScores)) {
                const processScore = parseFloat(subjectScores.process_score) || null;
                const midtermScore = parseFloat(subjectScores.midterm_score) || null;
                const finalScore = parseFloat(subjectScores.final_score) || null;

                const [existingSubject] = await connection.query(
                    'SELECT SubjectID FROM Subjects WHERE SubjectID = ?',
                    [subjectId]
                );

                if (existingSubject.length > 0) {
                    await connection.query(
                        `INSERT INTO Grades (
                            StudentID, SubjectID, ProcessScore, MidtermScore, FinalScore
                        ) VALUES (?, ?, ?, ?, ?)`,
                        [
                            studentId,
                            subjectId,
                            processScore,
                            midtermScore,
                            finalScore
                        ]
                    );
                } else {
                    console.warn(`Môn học với ID '${subjectId}' không tìm thấy trong cơ sở dữ liệu. Bỏ qua việc chèn điểm cho môn này.`);
                }
            }
        }

        const tuitionAmount = parseFloat(String(financial.tuition).replace(/[^0-9.]/g, '')) || 0;
        await connection.query(
            `INSERT INTO Financial (
                StudentID, Amount, PaymentStatus
            ) VALUES (?, ?, ?)`,
            [studentId, tuitionAmount, financial.paymentStatus || 'Chưa thanh toán']
        );

        await connection.commit();
        res.json({
            success: true,
            message: 'Thêm sinh viên thành công',
            studentId
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error creating student:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm sinh viên: ' + error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập địa chỉ email.'
            });
        }

        const [user] = await query('SELECT AccountID, Email FROM accounts WHERE Email = ?', [email]);

        if (!user) {
            return res.json({
                success: true,
                message: 'Nếu địa chỉ email của bạn tồn tại trong hệ thống, một liên kết đặt lại mật khẩu đã được gửi đến email đó.'
            });
        }

        const resetToken = require('crypto').randomBytes(32).toString('hex');
        const resetLink = `http://yourdomain.com/auth/reset-password?token=${resetToken}&email=${email}`;

        console.log(`Password reset link for ${email}: ${resetLink}`);

        res.json({
            success: true,
            message: 'Nếu địa chỉ email của bạn tồn tại trong hệ thống, một liên kết đặt lại mật khẩu đã được gửi đến email đó.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.'
        });
    }
};
