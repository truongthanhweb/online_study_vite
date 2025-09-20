-- Seed data for online_study database
-- Chạy sau khi đã tạo schema

-- Xóa dữ liệu cũ (nếu có)
TRUNCATE TABLE document_pages CASCADE;
TRUNCATE TABLE documents CASCADE;
TRUNCATE TABLE class_students CASCADE;
TRUNCATE TABLE classes CASCADE;
TRUNCATE TABLE users CASCADE;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE classes_id_seq RESTART WITH 1;
ALTER SEQUENCE documents_id_seq RESTART WITH 1;
ALTER SEQUENCE document_pages_id_seq RESTART WITH 1;

-- Tạo users mẫu
INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES
-- Admin user (password: admin123)
('admin', 'admin@school.edu.vn', '$2b$10$rQJ9.KvKvKvKvKvKvKvKvOeH3BjKvKvKvKvKvKvKvKvKvKvKvKvKvK', 'Quản trị viên', 'admin', true),

-- Teachers (password: teacher123)
('teacher1', 'teacher1@school.edu.vn', '$2b$10$rQJ9.KvKvKvKvKvKvKvKvOeH3BjKvKvKvKvKvKvKvKvKvKvKvKvKvK', 'Nguyễn Văn An', 'teacher', true),
('teacher2', 'teacher2@school.edu.vn', '$2b$10$rQJ9.KvKvKvKvKvKvKvKvOeH3BjKvKvKvKvKvKvKvKvKvKvKvKvKvK', 'Trần Thị Bình', 'teacher', true),
('teacher3', 'teacher3@school.edu.vn', '$2b$10$rQJ9.KvKvKvKvKvKvKvKvOeH3BjKvKvKvKvKvKvKvKvKvKvKvKvKvK', 'Lê Văn Cường', 'teacher', true),

-- Students (password: student123)
('student1', 'student1@school.edu.vn', '$2b$10$rQJ9.KvKvKvKvKvKvKvKvOeH3BjKvKvKvKvKvKvKvKvKvKvKvKvKvK', 'Phạm Thị Dung', 'student', true),
('student2', 'student2@school.edu.vn', '$2b$10$rQJ9.KvKvKvKvKvKvKvKvOeH3BjKvKvKvKvKvKvKvKvKvKvKvKvKvK', 'Hoàng Văn Em', 'student', true),
('student3', 'student3@school.edu.vn', '$2b$10$rQJ9.KvKvKvKvKvKvKvKvOeH3BjKvKvKvKvKvKvKvKvKvKvKvKvKvK', 'Vũ Thị Phương', 'student', true),
('student4', 'student4@school.edu.vn', '$2b$10$rQJ9.KvKvKvKvKvKvKvKvOeH3BjKvKvKvKvKvKvKvKvKvKvKvKvKvK', 'Đỗ Văn Giang', 'student', true),
('student5', 'student5@school.edu.vn', '$2b$10$rQJ9.KvKvKvKvKvKvKvKvOeH3BjKvKvKvKvKvKvKvKvKvKvKvKvKvK', 'Bùi Thị Hoa', 'student', true),
('student6', 'student6@school.edu.vn', '$2b$10$rQJ9.KvKvKvKvKvKvKvKvOeH3BjKvKvKvKvKvKvKvKvKvKvKvKvKvK', 'Ngô Văn Inh', 'student', true);

-- Tạo classes mẫu
INSERT INTO classes (class_name, class_code, description, teacher_id, academic_year, semester, is_active) VALUES
('Lớp 10A1', '10A1', 'Lớp 10A1 năm học 2024-2025', 2, '2024-2025', 1, true),
('Lớp 10A2', '10A2', 'Lớp 10A2 năm học 2024-2025', 3, '2024-2025', 1, true),
('Lớp 11B1', '11B1', 'Lớp 11B1 năm học 2024-2025', 4, '2024-2025', 1, true),
('Lớp 12C1', '12C1', 'Lớp 12C1 năm học 2024-2025', 2, '2024-2025', 1, true);

-- Thêm học sinh vào lớp
INSERT INTO class_students (class_id, student_id, enrollment_date, is_active) VALUES
-- Lớp 10A1
(1, 5, '2024-09-01', true),  -- Phạm Thị Dung
(1, 6, '2024-09-01', true),  -- Hoàng Văn Em
(1, 7, '2024-09-01', true),  -- Vũ Thị Phương

-- Lớp 10A2
(2, 8, '2024-09-01', true),  -- Đỗ Văn Giang
(2, 9, '2024-09-01', true),  -- Bùi Thị Hoa

-- Lớp 11B1
(3, 10, '2024-09-01', true), -- Ngô Văn Inh
(3, 5, '2024-09-01', true),  -- Phạm Thị Dung (học 2 lớp)

-- Lớp 12C1
(4, 6, '2024-09-01', true),  -- Hoàng Văn Em (học 2 lớp)
(4, 7, '2024-09-01', true);  -- Vũ Thị Phương (học 2 lớp)

-- Tạo một số documents mẫu (chưa có file thật)
INSERT INTO documents (title, description, file_path, original_filename, file_type, file_size, class_id, lesson_date, lesson_topic, uploaded_by, status, total_pages) VALUES
('Bài giảng Toán học - Chương 1', 'Giới thiệu về đại số', 'uploads/math_chapter1.pdf', 'toan_chuong1.pdf', '.pdf', 2048576, 1, '2024-09-20', 'Đại số cơ bản', 1, 'completed', 15),
('Bài tập Vật lý - Động học', 'Các bài tập về chuyển động', 'uploads/physics_kinematics.pdf', 'vatly_donghoC.pdf', '.pdf', 1536000, 1, '2024-09-21', 'Chuyển động thẳng', 1, 'completed', 8),
('Lý thuyết Hóa học - Nguyên tử', 'Cấu tạo nguyên tử', 'uploads/chemistry_atom.pdf', 'hoahoc_nguyentu.pdf', '.pdf', 3072000, 2, '2024-09-20', 'Cấu tạo nguyên tử', 1, 'processing', 0),
('Bài giảng Văn học - Truyện Kiều', 'Phân tích tác phẩm Truyện Kiều', 'uploads/literature_kieu.pdf', 'vanhoc_kieu.pdf', '.pdf', 4096000, 3, '2024-09-19', 'Truyện Kiều', 1, 'completed', 25);

-- Thêm một số document_pages mẫu cho documents đã completed
INSERT INTO document_pages (document_id, page_number, image_path, image_size, processing_status) VALUES
-- Document 1 (Toán học - 15 trang)
(1, 1, 'uploads/pages/math_chapter1_page_1.jpg', 204800, 'completed'),
(1, 2, 'uploads/pages/math_chapter1_page_2.jpg', 198400, 'completed'),
(1, 3, 'uploads/pages/math_chapter1_page_3.jpg', 201600, 'completed'),
(1, 4, 'uploads/pages/math_chapter1_page_4.jpg', 195200, 'completed'),
(1, 5, 'uploads/pages/math_chapter1_page_5.jpg', 203200, 'completed'),

-- Document 2 (Vật lý - 8 trang)
(2, 1, 'uploads/pages/physics_kinematics_page_1.jpg', 189440, 'completed'),
(2, 2, 'uploads/pages/physics_kinematics_page_2.jpg', 192000, 'completed'),
(2, 3, 'uploads/pages/physics_kinematics_page_3.jpg', 187520, 'completed'),
(2, 4, 'uploads/pages/physics_kinematics_page_4.jpg', 194560, 'completed'),

-- Document 4 (Văn học - 25 trang, chỉ tạo 5 trang đầu)
(4, 1, 'uploads/pages/literature_kieu_page_1.jpg', 256000, 'completed'),
(4, 2, 'uploads/pages/literature_kieu_page_2.jpg', 248000, 'completed'),
(4, 3, 'uploads/pages/literature_kieu_page_3.jpg', 252000, 'completed'),
(4, 4, 'uploads/pages/literature_kieu_page_4.jpg', 244000, 'completed'),
(4, 5, 'uploads/pages/literature_kieu_page_5.jpg', 250000, 'completed');

-- Cập nhật thống kê
UPDATE classes SET 
    student_count = (SELECT COUNT(*) FROM class_students WHERE class_id = classes.id AND is_active = true),
    document_count = (SELECT COUNT(*) FROM documents WHERE class_id = classes.id);

-- Hiển thị thông tin đã tạo
SELECT 'Seed data created successfully!' as message;
SELECT 'Users created:' as info, COUNT(*) as count FROM users;
SELECT 'Classes created:' as info, COUNT(*) as count FROM classes;
SELECT 'Documents created:' as info, COUNT(*) as count FROM documents;
SELECT 'Document pages created:' as info, COUNT(*) as count FROM document_pages;

-- Hiển thị thông tin login
SELECT 
    'Login Information:' as info,
    username,
    email,
    role,
    'Password: admin123/teacher123/student123' as password
FROM users 
ORDER BY role, id;
