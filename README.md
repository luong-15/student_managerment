# 📚 Hệ Thống Quản Lý Sinh Viên (Node.js & MySQL) / Student Management System (Node.js & MySQL)

Dự án này là một Hệ Thống Quản Lý Sinh Viên được xây dựng bằng Node.js và MySQL. Nó cung cấp một giao diện web mạnh mẽ để quản lý dữ liệu sinh viên một cách an toàn, bao gồm xem, thêm và truy xuất thông tin sinh viên. Hệ thống tích hợp các tính năng thiết yếu như xác thực người dùng và quản lý phiên để đảm bảo quyền truy cập và tính toàn vẹn dữ liệu.

This project is a Student Management System built with Node.js and MySQL. It provides a robust web interface for securely managing student data, including viewing, adding, and retrieving student information. The system incorporates essential features like user authentication and session management to ensure secure access and data integrity.

---

## 🌟 Tổng Quan Dự Án / Project Overview

Hệ thống Quản lý Sinh viên được thiết kế để cung cấp một cách thức hợp lý và hiệu quả để xử lý hồ sơ sinh viên. Tận dụng sức mạnh của Node.js cho logic backend và MySQL để lưu trữ dữ liệu, nó mang lại một ứng dụng web phản hồi nhanh. Các chức năng chính bao gồm xác thực người dùng an toàn, quản lý dữ liệu sinh viên toàn diện và giao diện người dùng trực quan để dễ dàng điều hướng và tương tác.

The Student Management System is designed to offer a streamlined and efficient way to handle student records. Leveraging the power of Node.js for backend logic and MySQL for data storage, it delivers a responsive web application. Key functionalities include secure user authentication, comprehensive student data management, and an intuitive user interface for easy navigation and interaction.

---

## 🚀 Các Tính Năng Chính / Key Features

* **Xác Thực Người Dùng / User Authentication**: Chức năng đăng nhập và đăng ký an toàn cho phép truy cập được ủy quyền. / Secure login and registration functionalities for authorized access.
* **Quản Lý Phiên / Session Management**: Xử lý phiên mạnh mẽ với cookie an toàn để duy trì trạng thái người dùng. / Robust session handling with secure cookies to maintain user state.
* **Quản Lý Dữ Liệu Sinh Viên / Student Data Management**:
    * **Xem Sinh Viên / View Students**: Hiển thị danh sách toàn diện tất cả hồ sơ sinh viên. / Display a comprehensive list of all student records.
    * **Thêm Sinh Viên Mới / Add New Students**: Dễ dàng ghi danh sinh viên mới với thông tin chi tiết của họ. / Easily enroll new students with their details.
    * **Truy Xuất Thông Tin Sinh Viên / Retrieve Student Information**: Truy cập hồ sơ chi tiết cho từng sinh viên. / Access detailed profiles for individual students.
* **Bảo Vệ Tuyến Đường (Protected Routes) / Protected Routes**: Đảm bảo rằng dữ liệu và chức năng nhạy cảm chỉ có thể truy cập bởi người dùng đã xác thực. / Ensures that sensitive data and functionalities are accessible only to authenticated users.
* **Ghi Nhật Ký Yêu Cầu HTTP / HTTP Request Logging**: Ghi lại tất cả các yêu cầu HTTP đến để giám sát và gỡ lỗi. / Logs all incoming HTTP requests for monitoring and debugging purposes.
* **Phục Vụ Tệp Tĩnh / Static File Serving**: Phục vụ hiệu quả các tài nguyên tĩnh như tệp CSS và JavaScript. / Efficiently serves static assets like CSS and JavaScript files.

---

## 📂 Cấu Trúc Dự Án / Project Structure

Dự án tuân theo mô hình MVC (Model-View-Controller) tiêu chuẩn, đảm bảo phân tách rõ ràng các mối quan tâm và nâng cao khả năng bảo trì:

The project follows a standard MVC (Model-View-Controller) pattern, ensuring a clear separation of concerns and enhancing maintainability:
```bash
student-management/
├── src/                                   # Thư mục mã nguồn / Source code directory
│   ├── config/                            # Các tệp cấu hình cho ứng dụng / Configuration files for the application
│   │   └── database.js                    # Cấu hình kết nối cơ sở dữ liệu (MySQL) / Database connection configuration (MySQL)
│   ├── controllers/                       # Xử lý logic ứng dụng và các yêu cầu xử lý / Handles application logic and processes requests
│   │   ├── authController.js              # Quản lý xác thực người dùng (đăng nhập, đăng ký) / Manages user authentication (login, register)
│   │   └── studentController.js           # Xử lý tất cả các hoạt động liên quan đến sinh viên (CRUD) / Handles all student-related operations (CRUD)
│   ├── models/                            # Định nghĩa cấu trúc dữ liệu và tương tác với cơ sở dữ liệu / Defines data structures and interacts with the database
│   │   └── Student.js                     # Model định nghĩa cấu trúc và phương thức cho dữ liệu sinh viên / Model defining the structure and methods for student data
│   ├── routes/                            # Định nghĩa các điểm cuối ứng dụng và ánh xạ chúng tới các controller / Defines application endpoints and maps them to controllers
│   │   ├── authRoutes.js                  # Các tuyến đường cho các hoạt động xác thực / Routes for authentication operations
│   │   └── studentRoutes.js               # Các tuyến đường cho các hoạt động liên quan đến sinh viên / Routes for student-related operations
│   ├── views/                             # Các template EJS để hiển thị các trang web động / EJS templates for rendering dynamic web pages
│   │   ├── auth/                          # Các view dành riêng cho xác thực / Views specific to authentication
│   │   │   ├── login.ejs                  # Template trang đăng nhập / Login page template
│   │   │   └── register.ejs               # Template trang đăng ký / Registration page template
│   │   ├── account.ejs                    # Bảng điều khiển tài khoản người dùng / User account dashboard
│   │   ├── error.ejs                      # Template trang lỗi / Error page template
│   │   ├── index.ejs                      # Trang đích chính / Main landing page
│   │   ├── information.ejs                # Trang thông tin chi tiết sinh viên / Detailed student information page
│   │   └── profile.ejs                    # Trang hồ sơ người dùng / User profile page
│   ├── public/                            # Các tài nguyên tĩnh được phục vụ trực tiếp cho client / Static assets served directly to the client
│   │   ├── css/                           # Các stylesheet (ví dụ: đầu ra Tailwind CSS) / Stylesheets (e.g., Tailwind CSS output)
│   │   └── js/                            # Các tệp JavaScript phía client / Client-side JavaScript files
│   └── app.js                             # Điểm vào chính của ứng dụng, thiết lập máy chủ Express / Main application entry point, sets up Express server
├── .env                                   # Các biến môi trường (dữ liệu nhạy cảm, cấu hình) / Environment variables (sensitive data, configuration)
├── package.json                           # Siêu dữ liệu dự án và danh sách phụ thuộc cho npm / Project metadata and dependency list for npm
├── package-lock.json                      # Ghi lại các phiên bản chính xác của các phụ thuộc / Records the exact versions of dependencies
└── README.md                              # Tài liệu dự án (tệp này) / Project documentation (this file)
```
---

## 🛠️ Công Nghệ Sử Dụng / Technologies Used

**Backend:**
* **Node.js**: Môi trường chạy JavaScript. / JavaScript runtime environment.
* **Express.js**: Framework web nhanh, không ý kiến, tối giản cho Node.js. / Fast, unopinionated, minimalist web framework for Node.js.
* **MySQL (mysql2)**: Client MySQL cho Node.js. / MySQL client for Node.js.

**Frontend:**
* **EJS (Embedded JavaScript templating)**: Ngôn ngữ template đơn giản để tạo HTML. / Simple templating language for generating HTML.
* **Tailwind CSS**: Một framework CSS ưu tiên tiện ích để phát triển UI nhanh chóng. / A utility-first CSS framework for rapid UI development.

**Tiện Ích & Phát Triển / Utilities & Development:**
* **dotenv**: Tải các biến môi trường từ tệp .env. / Loads environment variables from a .env file.
* **express-session**: Middleware phiên đơn giản cho Express. / Simple session middleware for Express.
* **bcrypt**: Thư viện để băm mật khẩu an toàn. / Library for hashing passwords securely.
* **nodemon**: Tiện ích tự động khởi động lại ứng dụng Node.js trong quá trình phát triển. / Utility that automatically restarts the Node.js application during development.

---

## 📜 Các Lệnh (Scripts) / Scripts

* `npm start`: Khởi động ứng dụng ở chế độ sản xuất. / Starts the application in production mode.
* `npm run dev`: Khởi động ứng dụng với nodemon để phát triển, cho phép tự động khởi động lại máy chủ khi có thay đổi tệp. / Starts the application with nodemon for development, enabling automatic server restarts on file changes.

---

## 🌐 Middleware

Ứng dụng sử dụng một số thành phần middleware của Express để xử lý các khía cạnh khác nhau của quá trình xử lý yêu cầu:

The application utilizes several Express middleware components to handle various aspects of request processing:

* **Bộ Phân Tích Body (Body Parsers)**:
    * `express.json()`: Phân tích các yêu cầu đến với payload JSON. / Parses incoming requests with JSON payloads.
    * `express.urlencoded({ extended: true })`: Phân tích các yêu cầu đến với payload được mã hóa URL. / Parses incoming requests with URL-encoded payloads.
* **Ghi Nhật Ký Yêu Cầu / Request Logging**: Middleware tùy chỉnh để ghi nhật ký các yêu cầu HTTP vào console. / Custom middleware for logging HTTP requests to the console.
* **Phục Vụ Tệp Tĩnh / Static File Serving**: `express.static('public')` để phục vụ các tài nguyên tĩnh, với các tiêu đề tùy chỉnh cho các tệp CSS. / `express.static('public')` for serving static assets, with custom headers for CSS files.
* **Quản Lý Cookie & Phiên / Cookie & Session Management**:
    * `cookieParser()`: Phân tích tiêu đề Cookie và điền vào `req.cookies`. / Parses Cookie header and populates `req.cookies`.
    * `express-session`: Quản lý các phiên người dùng bằng cách sử dụng các tùy chọn cookie an toàn. / Manages user sessions using secure cookie options.
* **Xác Thực / Authentication**: Middleware để kiểm tra token xác thực và bảo vệ các tuyến đường, đảm bảo chỉ người dùng đã xác thực mới có thể truy cập các tài nguyên nhất định. / Middleware to check authentication tokens and protect routes, ensuring only authenticated users can access certain resources.
* **Xử Lý Lỗi / Error Handling**: Middleware chuyên dụng để xử lý các phản hồi 404 (Không tìm thấy) và 500 (Lỗi máy chủ nội bộ) một cách duyên dáng. / Dedicated middleware for handling 404 (Not Found) and 500 (Internal Server Error) responses gracefully.

---

## ⚙️ Hướng Dẫn Cài Đặt và Sử Dụng / Setup Instructions and Usage

Làm theo các bước sau để thiết lập và chạy Hệ Thống Quản Lý Sinh Viên trên máy tính cục bộ của bạn.

Follow these steps to get the Student Management System up and running on your local machine.

### Điều Kiện Tiên Quyết / Prerequisites

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các phần sau:

Before you begin, ensure you have the following installed:

* **Node.js** (Khuyến nghị phiên bản LTS) / (LTS version recommended)
* **npm** (Node Package Manager, đi kèm với Node.js) / (Node Package Manager, comes with Node.js)
* **MySQL Server**

### Các Bước Cài Đặt / Installation Steps

1.  **Clone Repository:**

    ```bash
    git clone <repository-url> # Thay thế <repository-url> bằng URL GitHub thực tế của bạn / Replace <repository-url> with your actual GitHub URL
    cd student-management
    ```

2.  **Cài Đặt Các Phụ Thuộc / Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Cấu Hình Cơ Sở Dữ Liệu / Configure the Database:**
    * Tạo một cơ sở dữ liệu MySQL (ví dụ: `student_management_db`). / Create a MySQL database (e.g., `student_management_db`).
    * Tạo một tệp `.env` trong thư mục gốc của dự án của bạn. / Create a `.env` file in the root directory of your project.
    * Thêm chi tiết kết nối cơ sở dữ liệu và khóa bí mật phiên của bạn vào tệp `.env`: / Add your database connection details and a session secret to the `.env` file:

        ```dotenv
        DB_HOST=localhost
        DB_USER=your_mysql_username
        DB_PASSWORD=your_mysql_password
        DB_NAME=student_management_db
        SESSION_SECRET=a_very_secret_key_for_session_encryption # Sử dụng một chuỗi ngẫu nhiên, mạnh / Use a strong, random string
        ```

    * **Schema Cơ Sở Dữ Liệu / Database Schema**: Bạn sẽ cần tạo các bảng cần thiết trong cơ sở dữ liệu MySQL của mình. Nếu bạn có một tệp schema SQL (ví dụ: `schema.sql`), hãy thực thi nó trong client MySQL của bạn. / You will need to create the necessary tables in your MySQL database. If you have an SQL schema file (e.g., `schema.sql`), execute it in your MySQL client. (Ví dụ: `mysql -u your_username -p student_management_db < duong/dan/den/schema.sql`) / (Example: `mysql -u your_username -p student_management_db < path/to/your/schema.sql`)

4.  **Chạy Ứng Dụng / Run the Application:**
    * Để phát triển với tự động khởi động lại: / For development with auto-restarts:

        ```bash
        npm run dev
        ```

    * Để sản xuất: / For production:

        ```bash
        npm start
        ```

5.  **Truy Cập Ứng Dụng / Access the Application:**
    * Mở trình duyệt web của bạn và điều hướng đến **http://localhost:3000** để truy cập Bảng Điều Khiển Quản Lý Sinh Viên. / Open your web browser and navigate to **http://localhost:3000** to access the Student Management Dashboard.

---

## 📖 Hướng Dẫn Sử Dụng / Usage Guide

* **Đăng Nhập/Đăng Ký / Login/Register**: Truy cập các trang đăng nhập và đăng ký để xác thực hoặc tạo tài khoản người dùng mới. / Access the login and registration pages to authenticate or create a new user account.
* **Bảng Điều Khiển / Dashboard**: Sau khi đăng nhập, bạn sẽ được chuyển hướng đến bảng điều khiển chính. / After logging in, you will be directed to the main dashboard.
* **Xem Sinh Viên / View Students**: Sử dụng bảng điều khiển để xem tất cả sinh viên đã đăng ký và thông tin chi tiết của họ. / Use the dashboard to view all registered students and their details.
* **Thêm Sinh Viên Mới / Add New Student**: Nhấp vào nút "Thêm Sinh Viên Mới" (hoặc tương tự) để thêm một hồ sơ sinh viên mới vào hệ thống. / Click on the "Add New Student" button (or similar) to add a new student record to the system.
* **Thông Tin Chi Tiết / Detailed Information**: Nhấp vào tên sinh viên hoặc nút "Xem Chi Tiết" chuyên dụng để xem thông tin toàn diện của họ. / Click on a student's name or a dedicated "View Details" button to see their comprehensive information.
