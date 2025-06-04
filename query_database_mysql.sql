-- Chọn cơ sở dữ liệu
USE qlsv;

-- Bảng cho thông tin sinh viên
CREATE TABLE Students (
    StudentID INT PRIMARY KEY AUTO_INCREMENT,
    FullName VARCHAR(255) NOT NULL,
    DateOfBirth DATE,
    Gender VARCHAR(10),
    Address VARCHAR(255),
    Email VARCHAR(255) UNIQUE,
    AvatarURL VARCHAR(255)
);

-- Bảng cho thông tin lớp học
CREATE TABLE Classes (
    ClassID INT PRIMARY KEY AUTO_INCREMENT,
    ClassName VARCHAR(50) NOT NULL,
    CourseID INT, -- Thêm cột CourseID
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID) ON DELETE SET NULL -- Thêm khóa ngoại
);

-- Bảng cho thông tin khóa học
CREATE TABLE Courses (
    CourseID INT PRIMARY KEY AUTO_INCREMENT,
    CourseName VARCHAR(100) NOT NULL
);

-- Bảng cho thông tin giảng viên (nếu cần thiết)
CREATE TABLE Instructors (
    InstructorID INT PRIMARY KEY AUTO_INCREMENT,
    InstructorName VARCHAR(255) NOT NULL
);

-- Bảng cho thông tin môn học
CREATE TABLE Subjects (
    SubjectID INT PRIMARY KEY AUTO_INCREMENT,
    SubjectName VARCHAR(100) NOT NULL,
    Credits INT,
    Department VARCHAR(100)
);

-- Bảng liên kết sinh viên và lớp học (nếu một sinh viên chỉ thuộc một lớp)
CREATE TABLE StudentClasses (
    StudentID INT,
    ClassID INT,
    PRIMARY KEY (StudentID, ClassID),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (ClassID) REFERENCES Classes(ClassID) ON DELETE CASCADE
);

-- Bảng liên kết lớp học với môn học và giảng viên
CREATE TABLE ClassSubjects (
    ClassID INT,
    SubjectID INT,
    InstructorID INT,
    PRIMARY KEY (ClassID, SubjectID),
    FOREIGN KEY (ClassID) REFERENCES Classes(ClassID) ON DELETE CASCADE,
    FOREIGN KEY (SubjectID) REFERENCES Subjects(SubjectID) ON DELETE CASCADE,
    FOREIGN KEY (InstructorID) REFERENCES Instructors(InstructorID) ON DELETE SET NULL
);

-- Bảng cho điểm số
CREATE TABLE Grades (
    GradeID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID INT,
    SubjectID INT,
    ProcessScore DECIMAL(3, 1),
    MidtermScore DECIMAL(3, 1),
    FinalScore DECIMAL(3, 1),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (SubjectID) REFERENCES Subjects(SubjectID) ON DELETE CASCADE
);

-- Bảng cho thông tin tài chính (học phí)
CREATE TABLE Financial (
    FinancialID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID INT,
    Amount DECIMAL(10, 2),
    PaymentStatus VARCHAR(20),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE
);

-- Bảng cho lịch sử thanh toán
CREATE TABLE PaymentHistory (
    PaymentID INT PRIMARY KEY AUTO_INCREMENT,
    FinancialID INT,
    PaymentDate DATE, -- Vẫn giữ DATE để tạo bảng, sẽ ALTER sau
    AmountPaid DECIMAL(10, 2),
    FOREIGN KEY (FinancialID) REFERENCES Financial(FinancialID) ON DELETE CASCADE
);

-- Thay đổi kiểu dữ liệu của PaymentDate thành VARCHAR(10) để lưu định dạng dd-mm-yyyy
ALTER TABLE PaymentHistory MODIFY COLUMN PaymentDate VARCHAR(10);

-- Bảng tài khoản người dùng
CREATE TABLE Accounts (
    AccountID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NULL,
    JoinDate DATE,
    AvatarURL VARCHAR(255) DEFAULT 'https://placehold.co/100x100',
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE SET NULL,
    FOREIGN KEY (InstructorID) REFERENCES Instructors(InstructorID) ON DELETE SET NULL
);

ALTER TABLE Accounts ADD COLUMN auth_token VARCHAR(255) DEFAULT NULL;

-- Tạm thời vô hiệu hóa kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa dữ liệu cũ để đảm bảo tính nhất quán khi chạy lại script
TRUNCATE TABLE Grades;
TRUNCATE TABLE PaymentHistory;
TRUNCATE TABLE StudentClasses;
TRUNCATE TABLE ClassSubjects;
TRUNCATE TABLE Accounts;
TRUNCATE TABLE Financial;
TRUNCATE TABLE Students;
TRUNCATE TABLE Classes;
TRUNCATE TABLE Subjects;
TRUNCATE TABLE Instructors;
TRUNCATE TABLE Courses;

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;

-- Thêm dữ liệu vào bảng Courses (ví dụ 3 khóa học)
INSERT INTO Courses (CourseName) VALUES ('Công nghệ Thông tin'), ('Điện tử Viễn thông'), ('Quản trị Kinh doanh');

-- Thêm dữ liệu vào bảng Subjects (ví dụ 10 môn học)
INSERT INTO Subjects (SubjectName, Credits, Department) VALUES
('Cấu trúc dữ liệu và giải thuật', 3, 'CNTT'),
('Lập trình hướng đối tượng', 3, 'CNTT'),
('Cơ sở dữ liệu', 3, 'CNTT'),
('Mạng máy tính', 3, 'CNTT'),
('Giải tích 1', 3, 'Khoa học cơ bản'),
('Đại số tuyến tính', 3, 'Khoa học cơ bản'),
('Kỹ thuật điện', 3, 'Điện tử'),
('Điện tử tương tự', 3, 'Điện tử'),
('Marketing căn bản', 3, 'Kinh tế'),
('Nguyên lý kế toán', 3, 'Kinh tế');

-- Thêm dữ liệu vào bảng Instructors (ví dụ 5 giảng viên)
INSERT INTO Instructors (InstructorName) VALUES ('Nguyễn Văn Thầy'), ('Trần Thị Cô'), ('Lê Hoàng Anh'), ('Phạm Thu Hà'), ('Hoàng Minh Đức');

-- Thêm dữ liệu vào bảng Classes (ví dụ 5 lớp)
INSERT INTO Classes (ClassName) VALUES ('K60 CNTT A'), ('K60 CNTT B'), ('K60 DT A'), ('K61 CNTT A'), ('K61 DT B');

-- Cập nhật CourseID cho các lớp thuộc khóa 'Công nghệ Thông tin'
UPDATE Classes
SET CourseID = (SELECT CourseID FROM Courses WHERE CourseName = 'Công nghệ Thông tin')
WHERE ClassID IN (1, 2, 4);

-- Cập nhật CourseID cho các lớp thuộc khóa 'Điện tử Viễn thông'
UPDATE Classes
SET CourseID = (SELECT CourseID FROM Courses WHERE CourseName = 'Điện tử Viễn thông')
WHERE ClassID IN (3, 5);

-- Thêm 50 dữ liệu sinh viên với đầy đủ các trường vào bảng Students
INSERT INTO Students (FullName, DateOfBirth, Gender, Address, Email, AvatarURL)
VALUES
('Nguyễn Văn A', '2002-05-15', 'Nam', 'Số 10 Đường Trần Phú, Hà Nội', 'nva@example.com', 'https://placehold.co/100x100'),
('Trần Thị B', '2001-12-20', 'Nữ', 'Số 25 Đường Lê Lợi, TP.HCM', 'ttb@example.com', 'https://placehold.co/100x100'),
('Lê Văn C', '2003-03-10', 'Nam', 'Số 5 Đường 3 Tháng 2, Đà Nẵng', 'lvc@example.com', 'https://placehold.co/100x100'),
('Phạm Thị D', '2002-08-01', 'Nữ', 'Số 1 Nguyễn Huệ, Cần Thơ', 'ptd@example.com', 'https://placehold.co/100x100'),
('Hoàng Văn E', '2001-06-22', 'Nam', 'Số 30 Đường Quang Trung, Hải Phòng', 'hve@example.com', 'https://placehold.co/100x100'),
('Vũ Thị F', '2003-11-05', 'Nữ', 'Số 15 Đường Hùng Vương, Huế', 'vtf@example.com', 'https://placehold.co/100x100'),
('Bùi Văn G', '2002-01-28', 'Nam', 'Số 8 Đường Nguyễn Trãi, Hà Nội', 'bvg@example.com', 'https://placehold.co/100x100'),
('Đỗ Thị H', '2001-09-12', 'Nữ', 'Số 22 Đường Cách Mạng Tháng 8, TP.HCM', 'dth@example.com', 'https://placehold.co/100x100'),
('Cao Văn I', '2003-07-03', 'Nam', 'Số 7 Đường Điện Biên Phủ, Đà Nẵng', 'cvi@example.com', 'https://placehold.co/100x100'),
('Mai Thị K', '2002-04-18', 'Nữ', 'Số 18 Đường Trần Hưng Đạo, Cần Thơ', 'mtk@example.com', 'https://placehold.co/100x100'),
('Phan Văn L', '2001-10-25', 'Nam', 'Số 28 Đường Lê Thánh Tông, Hải Phòng', 'pvl@example.com', 'https://placehold.co/100x100'),
('Trịnh Thị M', '2003-02-14', 'Nữ', 'Số 12 Đường Bà Triệu, Huế', 'ttm@example.com', 'https://placehold.co/100x100'),
('Ngô Văn N', '2002-09-07', 'Nam', 'Số 35 Đường Tây Sơn, Hà Nội', 'nvn@example.com', 'https://placehold.co/100x100'),
('Võ Thị O', '2001-11-30', 'Nữ', 'Số 9 Đường Nguyễn Văn Trỗi, TP.HCM', 'vto@example.com', 'https://placehold.co/100x100'),
('Đinh Văn P', '2003-05-20', 'Nam', 'Số 2 Đường Nguyễn Thị Minh Khai, Đà Nẵng', 'dvp@example.com', 'https://placehold.co/100x100'),
('Lưu Thị Q', '2002-07-10', 'Nữ', 'Số 21 Đường 30 Tháng 4, Cần Thơ', 'ltq@example.com', 'https://placehold.co/100x100'),
('Tạ Văn R', '2001-08-05', 'Nam', 'Số 17 Đường Tô Hiệu, Hải Phòng', 'tvr@example.com', 'https://placehold.co/100x100'),
('Hà Thị S', '2003-01-15', 'Nữ', 'Số 6 Đường Trần Cao Vân, Huế', 'hts@example.com', 'https://placehold.co/100x100'),
('Quách Văn T', '2002-06-01', 'Nam', 'Số 29 Đường Giải Phóng, Hà Nội', 'qvt@example.com', 'https://placehold.co/100x100'),
('Bạch Thị U', '2001-12-28', 'Nữ', 'Số 11 Đường Nguyễn Đình Chiểu, TP.HCM', 'btu@example.com', 'https://placehold.co/100x100'),
('Chu Văn V', '2003-04-22', 'Nam', 'Số 4 Đường Hoàng Diệu, Đà Nẵng', 'cvv@example.com', 'https://placehold.co/100x100'),
('Từ Thị X', '2002-09-18', 'Nữ', 'Số 24 Đường 2 Tháng 9, Cần Thơ', 'ttx@example.com', 'https://placehold.co/100x100'),
('Yên Văn Y', '2001-11-10', 'Nam', 'Số 19 Đường Lạch Tray, Hải Phòng', 'yvy@example.com', 'https://placehold.co/100x100'),
('Sầm Thị Z', '2003-03-05', 'Nữ', 'Số 14 Đường Phan Bội Châu, Huế', 'stz@example.com', 'https://placehold.co/100x100'),
('Âu Văn AA', '2002-07-25', 'Nam', 'Số 32 Đường Trường Chinh, Hà Nội', 'ava@example.com', 'https://placehold.co/100x100'),
('Trương Thị BB', '2001-08-20', 'Nữ', 'Số 7 Đường Sư Vạn Hạnh, TP.HCM', 'ttbb@example.com', 'https://placehold.co/100x100'),
('Mai Văn CC', '2003-01-03', 'Nam', 'Số 1 Đường Nguyễn Văn Linh, Đà Nẵng', 'mvc@example.com', 'https://placehold.co/100x100'),
('Đặng Thị DD', '2002-05-10', 'Nữ', 'Số 26 Đường Trần Quý Cáp, Cần Thơ', 'dtd@example.com', 'https://placehold.co/100x100'),
('Hồ Văn EE', '2001-09-25', 'Nam', 'Số 13 Đường Lê Hồng Phong, Hải Phòng', 'hev@example.com', 'https://placehold.co/100x100'),
('Lâm Thị FF', '2003-02-18', 'Nữ', 'Số 8 Đường Hai Bà Trưng, Huế', 'ltf@example.com', 'https://placehold.co/100x100'),
('Phùng Văn GG', '2002-10-01', 'Nam', 'Số 38 Đường Nguyễn Thái Học, Hà Nội', 'fvg@example.com', 'https://placehold.co/100x100'),
('Nguyễn Thị HH', '2001-11-15', 'Nữ', 'Số 5 Đường 3 Tháng 2, Quận 10, TP.HCM', 'nth@example.com', 'https://placehold.co/100x100'),
('Hoàng Văn II', '2003-06-05', 'Nam', 'Số 3 Đường Phan Chu Trinh, Đà Nẵng', 'hvii@example.com', 'https://placehold.co/100x100'),
('Vũ Thị KK', '2002-08-22', 'Nữ', 'Số 20 Đường Nguyễn Văn Cừ, Cần Thơ', 'vtk@example.com', 'https://placehold.co/100x100'),
('Bùi Văn LL', '2001-07-12', 'Nam', 'Số 23 Đường Trần Phú, Hải Phòng', 'bvl@example.com', 'https://placehold.co/100x100'),
('Đỗ Thị MM', '2003-04-01', 'Nữ', 'Số 16 Đường Lê Duẩn, Huế', 'dtm@example.com', 'https://placehold.co/100x100'),
('Cao Văn NN', '2002-12-10', 'Nam', 'Số 31 Đường Láng Hạ, Hà Nội', 'cvn@example.com', 'https://placehold.co/100x100'),
('Mai Thị OO', '2001-09-05', 'Nữ', 'Số 10 Đường CMT8, Quận 3, TP.HCM', 'mto@example.com', 'https://placehold.co/100x100'),
('Phan Văn PP', '2003-02-28', 'Nam', 'Số 6 Đường Ngô Quyền, Đà Nẵng', 'pvp@example.com', 'https://placehold.co/100x100'),
('Trịnh Thị QQ', '2002-11-20', 'Nữ', 'Số 27 Đường 30/4, Cần Thơ', 'ttqq@example.com', 'https://placehold.co/100x100'),
('Ngô Văn RR', '2001-10-15', 'Nam', 'Số 18 Đường Trần Hưng Đạo, Hải Phòng', 'nvr@example.com', 'https://placehold.co/100x100'),
('Võ Thị SS', '2003-05-01', 'Nữ', 'Số 11 Đường Hùng Vương, Huế', 'vts@example.com', 'https://placehold.co/100x100'),
('Đinh Văn TT', '2002-01-20', 'Nam', 'Số 36 Đường Tây Sơn, Hà Nội', 'dvtt@example.com', 'https://placehold.co/100x100'),
('Lưu Thị UU', '2001-12-05', 'Nữ', 'Số 9 Đường Nguyễn Văn Trỗi, Phú Nhuận, TP.HCM', 'ltu@example.com', 'https://placehold.co/100x100'),
('Tạ Văn VV', '2003-07-15', 'Nam', 'Số 2 Đường Nguyễn Thị Minh Khai, Hải Châu, Đà Nẵng', 'tvv@example.com', 'https://placehold.co/100x100'),
('Hà Thị XX', '2002-04-20', 'Nữ', 'Số 22 Đường 30 Tháng 4, Ninh Kiều, Cần Thơ', 'htx@example.com', 'https://placehold.co/100x100'),
('Quách Văn YY', '2001-08-10', 'Nam', 'Số 17 Đường Tô Hiệu, Lê Chân, Hải Phòng', 'qvy@example.com', 'https://placehold.co/100x100'),
('Bạch Thị ZZ', '2003-03-25', 'Nữ', 'Số 6 Đường Trần Cao Vân, Vĩnh Ninh, Huế', 'btz@example.com', 'https://placehold.co/100x100')
;

-- Liên kết sinh viên với lớp học (ví dụ mỗi sinh viên thuộc một lớp nào đó)
INSERT INTO StudentClasses (StudentID, ClassID)
SELECT StudentID, (FLOOR(RAND() * 5) + 1) FROM Students; -- Gán ngẫu nhiên 1 trong 5 lớp

-- Liên kết lớp học với môn học và giảng viên
-- Thêm các môn chuyên ngành đã có
INSERT INTO ClassSubjects (ClassID, SubjectID, InstructorID)
VALUES
(1, 1, 1), (1, 2, 2), (1, 3, 3), -- Class 1 (K60 CNTT A) -> CNTT subjects
(2, 1, 2), (2, 3, 1), (2, 4, 4), -- Class 2 (K60 CNTT B) -> CNTT subjects
(3, 7, 3), (3, 8, 5),             -- Class 3 (K60 DT A) -> Điện tử subjects
(4, 1, 4), (4, 2, 1), (4, 3, 2), -- Class 4 (K61 CNTT A) -> CNTT subjects
(5, 7, 5), (5, 8, 3);

-- Thêm các môn Khoa học cơ bản (SubjectID 5: 'Giải tích 1', 6: 'Đại số tuyến tính') cho tất cả các lớp đã tồn tại
INSERT INTO ClassSubjects (ClassID, SubjectID, InstructorID)
SELECT
    c.ClassID,
    s.SubjectID,
    (SELECT InstructorID FROM Instructors ORDER BY RAND() LIMIT 1)
FROM Classes c
CROSS JOIN Subjects s
WHERE s.Department = 'Khoa học cơ bản'
ON DUPLICATE KEY UPDATE InstructorID = VALUES(InstructorID);

-- Thêm điểm số ngẫu nhiên cho sinh viên ở các môn học mà họ đang học trong lớp
INSERT INTO Grades (StudentID, SubjectID, ProcessScore, MidtermScore, FinalScore)
SELECT
    sc.StudentID,
    cs.SubjectID,
    ROUND(RAND() * 5 + 5, 1), -- Điểm quá trình từ 5 đến 10
    ROUND(RAND() * 5 + 5, 1), -- Điểm giữa kỳ từ 5 đến 10
    ROUND(RAND() * 5 + 5, 1)  -- Điểm cuối kỳ từ 5 đến 10
FROM StudentClasses sc
JOIN ClassSubjects cs ON sc.ClassID = cs.ClassID
WHERE RAND() < 0.7; -- Chỉ thêm điểm cho một phần sinh viên và môn học để có dữ liệu

-- Thêm dữ liệu vào bảng Financial
INSERT INTO Financial (StudentID, Amount, PaymentStatus)
SELECT
    StudentID,
    ROUND(RAND() * 5000000 + 1000000, 2), -- Số tiền học phí từ 1,000,000 đến 6,000,000
    CASE
        WHEN RAND() < 0.7 THEN 'Đã thanh toán' -- Khoảng 70% sinh viên được gán trạng thái 'Đã thanh toán'
        ELSE 'Chưa thanh toán'                -- 30% còn lại là 'Chưa thanh toán'
    END
FROM Students
ORDER BY StudentID
LIMIT 48; -- Tạo bản ghi tài chính cho 40 sinh viên đầu tiên

-- Thêm dữ liệu vào bảng PaymentHistory
-- Chỉ tạo bản ghi thanh toán cho những giao dịch có trạng thái 'Đã thanh toán' trong bảng Financial
INSERT INTO PaymentHistory (FinancialID, PaymentDate, AmountPaid)
SELECT
    FinancialID,
    DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL FLOOR(RAND() * 365) DAY), '%d-%m-%Y'), -- Ngày thanh toán ngẫu nhiên định dạng dd-mm-yyyy
    Amount -- Số tiền đã thanh toán bằng với số tiền học phí nếu trạng thái là 'Đã thanh toán'
FROM Financial
WHERE PaymentStatus = 'Đã thanh toán';
