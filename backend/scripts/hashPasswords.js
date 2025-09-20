const bcrypt = require('bcrypt');

async function hashPasswords() {
  const passwords = {
    admin123: await bcrypt.hash('admin123', 10),
    teacher123: await bcrypt.hash('teacher123', 10),
    student123: await bcrypt.hash('student123', 10)
  };

  console.log('Hashed passwords for seed data:');
  console.log('admin123 ->', passwords.admin123);
  console.log('teacher123 ->', passwords.teacher123);
  console.log('student123 ->', passwords.student123);

  // Generate SQL update statements
  console.log('\nSQL Update statements:');
  console.log(`UPDATE users SET password_hash = '${passwords.admin123}' WHERE username = 'admin';`);
  console.log(`UPDATE users SET password_hash = '${passwords.teacher123}' WHERE role = 'teacher';`);
  console.log(`UPDATE users SET password_hash = '${passwords.student123}' WHERE role = 'student';`);
}

hashPasswords().catch(console.error);
