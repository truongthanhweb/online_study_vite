-- Database: online_study_system
-- Tạo database (chạy trong pgAdmin hoặc psql)
-- CREATE DATABASE online_study_system;

-- Sử dụng database
-- \c online_study_system;

-- Tạo enum cho user roles
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');

-- Tạo enum cho document status
CREATE TYPE document_status AS ENUM ('processing', 'completed', 'failed');

-- Bảng users (người dùng)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng classes (lớp học)
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    class_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester INTEGER NOT NULL CHECK (semester IN (1, 2, 3)),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng class_students (học sinh trong lớp)
CREATE TABLE class_students (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, student_id)
);

-- Bảng documents (tài liệu)
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    lesson_date DATE NOT NULL,
    lesson_topic VARCHAR(255),
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status document_status DEFAULT 'processing',
    total_pages INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng document_pages (các trang của tài liệu PDF đã convert)
CREATE TABLE document_pages (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    image_width INTEGER,
    image_height INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, page_number)
);

-- Bảng document_access_logs (log truy cập tài liệu)
CREATE TABLE document_access_logs (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('view', 'download')),
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Tạo indexes để tối ưu hiệu suất
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_active ON classes(is_active);
CREATE INDEX idx_documents_class_date ON documents(class_id, lesson_date);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_document_pages_document ON document_pages(document_id);
CREATE INDEX idx_class_students_class ON class_students(class_id);
CREATE INDEX idx_class_students_student ON class_students(student_id);
CREATE INDEX idx_document_access_logs_document ON document_access_logs(document_id);
CREATE INDEX idx_document_access_logs_user ON document_access_logs(user_id);

-- Tạo trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tạo dữ liệu mẫu
-- Admin user (password: admin123)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@school.edu.vn', '$2b$10$rOzJKKJKJKJKJKJKJKJKJu7QqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'Quản trị viên', 'admin');

-- Teacher users (password: teacher123)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('teacher1', 'teacher1@school.edu.vn', '$2b$10$rOzJKKJKJKJKJKJKJKJKJu7QqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'Nguyễn Văn A', 'teacher'),
('teacher2', 'teacher2@school.edu.vn', '$2b$10$rOzJKKJKJKJKJKJKJKJKJu7QqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'Trần Thị B', 'teacher');

-- Student users (password: student123)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('student1', 'student1@school.edu.vn', '$2b$10$rOzJKKJKJKJKJKJKJKJKJu7QqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'Lê Văn C', 'student'),
('student2', 'student2@school.edu.vn', '$2b$10$rOzJKKJKJKJKJKJKJKJKJu7QqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'Phạm Thị D', 'student'),
('student3', 'student3@school.edu.vn', '$2b$10$rOzJKKJKJKJKJKJKJKJKJu7QqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'Hoàng Văn E', 'student');

-- Classes
INSERT INTO classes (class_name, class_code, description, teacher_id, academic_year, semester) VALUES
('Lớp 12A1', '12A1', 'Lớp 12A1 năm học 2024-2025', 2, '2024-2025', 1),
('Lớp 12A2', '12A2', 'Lớp 12A2 năm học 2024-2025', 3, '2024-2025', 1);

-- Class students
INSERT INTO class_students (class_id, student_id) VALUES
(1, 4), (1, 5),
(2, 5), (2, 6);

-- Tạo thư mục uploads nếu chưa có
-- mkdir -p uploads/documents
-- mkdir -p uploads/pages
