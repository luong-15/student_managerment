📚 Hệ Thống Quản Lý Sinh Viên (Node.js & MySQL)
Dự án này là một Hệ Thống Quản Lý Sinh Viên được xây dựng bằng Node.js và MySQL. Nó cung cấp một giao diện web mạnh mẽ để quản lý dữ liệu sinh viên một cách an toàn, bao gồm xem, thêm và truy xuất thông tin sinh viên. Hệ thống tích hợp các tính năng thiết yếu như xác thực người dùng và quản lý phiên để đảm bảo quyền truy cập và tính toàn vẹn dữ liệu.

🌟 Tổng Quan Dự Án
Hệ thống Quản lý Sinh viên được thiết kế để cung cấp một cách thức hợp lý và hiệu quả để xử lý hồ sơ sinh viên. Tận dụng sức mạnh của Node.js cho logic backend và MySQL để lưu trữ dữ liệu, nó mang lại một ứng dụng web phản hồi nhanh. Các chức năng chính bao gồm xác thực người dùng an toàn, quản lý dữ liệu sinh viên toàn diện và giao diện người dùng trực quan để dễ dàng điều hướng và tương tác.

🚀 Các Tính Năng Chính
Xác Thực Người Dùng: Chức năng đăng nhập và đăng ký an toàn cho phép truy cập được ủy quyền.

Quản Lý Phiên: Xử lý phiên mạnh mẽ với cookie an toàn để duy trì trạng thái người dùng.

Quản Lý Dữ Liệu Sinh Viên:

Xem Sinh Viên: Hiển thị danh sách toàn diện tất cả hồ sơ sinh viên.

Thêm Sinh Viên Mới: Dễ dàng ghi danh sinh viên mới với thông tin chi tiết của họ.

Truy Xuất Thông Tin Sinh Viên: Truy cập hồ sơ chi tiết cho từng sinh viên.

Bảo Vệ Tuyến Đường (Protected Routes): Đảm bảo rằng dữ liệu và chức năng nhạy cảm chỉ có thể truy cập bởi người dùng đã xác thực.

Ghi Nhật Ký Yêu Cầu HTTP: Ghi lại tất cả các yêu cầu HTTP đến để giám sát và gỡ lỗi.

Phục Vụ Tệp Tĩnh: Phục vụ hiệu quả các tài nguyên tĩnh như tệp CSS và JavaScript.

📂 Cấu Trúc Dự Án
Dự án tuân theo mô hình MVC (Model-View-Controller) tiêu chuẩn, đảm bảo phân tách rõ ràng các mối quan tâm và nâng cao khả năng bảo trì:

student-management/
├── src/                                   # Thư mục mã nguồn
│   ├── config/                            # Các tệp cấu hình cho ứng dụng
│   │   └── database.js                    # Cấu hình kết nối cơ sở dữ liệu (MySQL)
│   ├── controllers/                       # Xử lý logic ứng dụng và các yêu cầu xử lý
│   │   ├── authController.js              # Quản lý xác thực người dùng (đăng nhập, đăng ký)
│   │   └── studentController.js           # Xử lý tất cả các hoạt động liên quan đến sinh viên (CRUD)
│   ├── models/                            # Định nghĩa cấu trúc dữ liệu và tương tác với cơ sở dữ liệu
│   │   └── Student.js                     # Model định nghĩa cấu trúc và phương thức cho dữ liệu sinh viên
│   ├── routes/                            # Định nghĩa các điểm cuối ứng dụng và ánh xạ chúng tới các controller
│   │   ├── authRoutes.js                  # Các tuyến đường cho các hoạt động xác thực
│   │   └── studentRoutes.js               # Các tuyến đường cho các hoạt động liên quan đến sinh viên
│   ├── views/                             # Các template EJS để hiển thị các trang web động
│   │   ├── auth/                          # Các view dành riêng cho xác thực
│   │   │   ├── login.ejs                  # Template trang đăng nhập
│   │   │   └── register.ejs               # Template trang đăng ký
│   │   ├── account.ejs                    # Bảng điều khiển tài khoản người dùng
│   │   ├── error.ejs                      # Template trang lỗi
│   │   ├── index.ejs                      # Trang đích chính
│   │   ├── information.ejs                # Trang thông tin chi tiết sinh viên
│   │   └── profile.ejs                    # Trang hồ sơ người dùng
│   ├── public/                            # Các tài nguyên tĩnh được phục vụ trực tiếp cho client
│   │   ├── css/                           # Các stylesheet (ví dụ: đầu ra Tailwind CSS)
│   │   └── js/                            # Các tệp JavaScript phía client
│   └── app.js                             # Điểm vào chính của ứng dụng, thiết lập máy chủ Express
├── .env                                   # Các biến môi trường (dữ liệu nhạy cảm, cấu hình)
├── package.json                           # Siêu dữ liệu dự án và danh sách phụ thuộc cho npm
├── package-lock.json                      # Ghi lại các phiên bản chính xác của các phụ thuộc
└── README.md                              # Tài liệu dự án (tệp này)

🛠️ Công Nghệ Sử Dụng
Backend:

Node.js: Môi trường chạy JavaScript.

Express.js: Framework web nhanh, không ý kiến, tối giản cho Node.js.

MySQL (mysql2): Client MySQL cho Node.js.

Frontend:

EJS (Embedded JavaScript templating): Ngôn ngữ template đơn giản để tạo HTML.

Tailwind CSS: Một framework CSS ưu tiên tiện ích để phát triển UI nhanh chóng.

Tiện Ích & Phát Triển:

dotenv: Tải các biến môi trường từ tệp .env.

express-session: Middleware phiên đơn giản cho Express.

bcrypt: Thư viện để băm mật khẩu an toàn.

nodemon: Tiện ích tự động khởi động lại ứng dụng Node.js trong quá trình phát triển.

📜 Các Lệnh (Scripts)
npm start: Khởi động ứng dụng ở chế độ sản xuất.

npm run dev: Khởi động ứng dụng với nodemon để phát triển, cho phép tự động khởi động lại máy chủ khi có thay đổi tệp.

🌐 Middleware
Ứng dụng sử dụng một số thành phần middleware của Express để xử lý các khía cạnh khác nhau của quá trình xử lý yêu cầu:

Bộ Phân Tích Body (Body Parsers):

express.json(): Phân tích các yêu cầu đến với payload JSON.

express.urlencoded({ extended: true }): Phân tích các yêu cầu đến với payload được mã hóa URL.

Ghi Nhật Ký Yêu Cầu: Middleware tùy chỉnh để ghi nhật ký các yêu cầu HTTP vào console.

Phục Vụ Tệp Tĩnh: express.static('public') để phục vụ các tài nguyên tĩnh, với các tiêu đề tùy chỉnh cho các tệp CSS.

Quản Lý Cookie & Phiên:

cookieParser(): Phân tích tiêu đề Cookie và điền vào req.cookies.

express-session: Quản lý các phiên người dùng bằng cách sử dụng các tùy chọn cookie an toàn.

Xác Thực: Middleware để kiểm tra token xác thực và bảo vệ các tuyến đường, đảm bảo chỉ người dùng đã xác thực mới có thể truy cập các tài nguyên nhất định.

Xử Lý Lỗi: Middleware chuyên dụng để xử lý các phản hồi 404 (Không tìm thấy) và 500 (Lỗi máy chủ nội bộ) một cách duyên dáng.

⚙️ Hướng Dẫn Cài Đặt và Sử Dụng
Làm theo các bước sau để thiết lập và chạy Hệ Thống Quản Lý Sinh Viên trên máy tính cục bộ của bạn.

Điều Kiện Tiên Quyết
Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các phần sau:

Node.js (Khuyến nghị phiên bản LTS)

npm (Node Package Manager, đi kèm với Node.js)

MySQL Server

Các Bước Cài Đặt
Clone Repository:

git clone <repository-url> # Thay thế <repository-url> bằng URL GitHub thực tế của bạn
cd student-management

Cài Đặt Các Phụ Thuộc:

npm install

Cấu Hình Cơ Sở Dữ Liệu:

Tạo một cơ sở dữ liệu MySQL (ví dụ: student_management_db).

Tạo một tệp .env trong thư mục gốc của dự án của bạn.

Thêm chi tiết kết nối cơ sở dữ liệu và khóa bí mật phiên của bạn vào tệp .env:

DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=student_management_db
SESSION_SECRET=a_very_secret_key_for_session_encryption # Sử dụng một chuỗi ngẫu nhiên, mạnh

Schema Cơ Sở Dữ Liệu: Bạn sẽ cần tạo các bảng cần thiết trong cơ sở dữ liệu MySQL của mình. Nếu bạn có một tệp schema SQL (ví dụ: schema.sql), hãy thực thi nó trong client MySQL của bạn.
(Ví dụ: mysql -u your_username -p student_management_db < duong/dan/den/schema.sql)

Chạy Ứng Dụng:

Để phát triển với tự động khởi động lại:

npm run dev

Để sản xuất:

npm start

Truy Cập Ứng Dụng:
Mở trình duyệt web của bạn và điều hướng đến http://localhost:3000 để truy cập Bảng Điều Khiển Quản Lý Sinh Viên.

📖 Hướng Dẫn Sử Dụng
Đăng Nhập/Đăng Ký: Truy cập các trang đăng nhập và đăng ký để xác thực hoặc tạo tài khoản người dùng mới.

Bảng Điều Khiển: Sau khi đăng nhập, bạn sẽ được chuyển hướng đến bảng điều khiển chính.

Xem Sinh Viên: Sử dụng bảng điều khiển để xem tất cả sinh viên đã đăng ký và thông tin chi tiết của họ.

Thêm Sinh Viên Mới: Nhấp vào nút "Thêm Sinh Viên Mới" (hoặc tương tự) để thêm một hồ sơ sinh viên mới vào hệ thống.

Thông Tin Chi Tiết: Nhấp vào tên sinh viên hoặc nút "Xem Chi Tiết" chuyên dụng để xem thông tin toàn diện của họ.

📄 Giấy Phép
Dự án này được cấp phép theo Giấy phép MIT. Xem tệp LICENSE trong repository để biết chi tiết đầy đủ.
