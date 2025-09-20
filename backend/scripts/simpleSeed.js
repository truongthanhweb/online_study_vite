const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function createSampleData() {
  // Thử kết nối trực tiếp với thông tin cụ thể
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'online_study',
    user: 'postgres',
    password: 'NgxTA99@#',
    ssl: false,
  });

  try {
    console.log('🔗 Connecting to PostgreSQL 17...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');

    // Hash passwords
    const adminHash = await bcrypt.hash('admin123', 10);
    const teacherHash = await bcrypt.hash('teacher123', 10);
    const studentHash = await bcrypt.hash('student123', 10);

    // Clear existing data
    await client.query('TRUNCATE TABLE document_pages CASCADE');
    await client.query('TRUNCATE TABLE documents CASCADE');
    await client.query('TRUNCATE TABLE class_students CASCADE');
    await client.query('TRUNCATE TABLE classes CASCADE');
    await client.query('TRUNCATE TABLE users CASCADE');

    console.log('🧹 Cleared existing data');

    // Create admin user
    const adminResult = await client.query(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `, ['admin', 'admin@school.edu.vn', adminHash, 'Quản trị viên', 'admin', true]);

    console.log('👤 Created admin user:', adminResult.rows[0].id);

    // Create teacher
    const teacherResult = await client.query(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `, ['teacher1', 'teacher1@school.edu.vn', teacherHash, 'Nguyễn Văn An', 'teacher', true]);

    console.log('👨‍🏫 Created teacher:', teacherResult.rows[0].id);

    // Create student
    const studentResult = await client.query(`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `, ['student1', 'student1@school.edu.vn', studentHash, 'Phạm Thị Dung', 'student', true]);

    console.log('👨‍🎓 Created student:', studentResult.rows[0].id);

    // Create class
    const classResult = await client.query(`
      INSERT INTO classes (class_name, class_code, description, teacher_id, academic_year, semester, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `, ['Lớp 10A1', '10A1', 'Lớp 10A1 năm học 2024-2025', teacherResult.rows[0].id, '2024-2025', 1, true]);

    console.log('🏫 Created class:', classResult.rows[0].id);

    // Add student to class
    await client.query(`
      INSERT INTO class_students (class_id, student_id, enrollment_date, is_active) 
      VALUES ($1, $2, $3, $4)
    `, [classResult.rows[0].id, studentResult.rows[0].id, '2024-09-01', true]);

    console.log('📝 Added student to class');

    client.release();
    console.log('\n🎉 Sample data created successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Admin: admin@school.edu.vn / admin123');
    console.log('Teacher: teacher1@school.edu.vn / teacher123');
    console.log('Student: student1@school.edu.vn / student123');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

createSampleData();
