const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function seedDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('🔗 Connecting to database...');
    await pool.connect();
    console.log('✅ Connected to database successfully!');

    // Read seed file
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    console.log('🌱 Running seed data...');
    await pool.query(seedSQL);
    console.log('✅ Seed data inserted successfully!');

    // Test query
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Total users created: ${result.rows[0].count}`);

    const classResult = await pool.query('SELECT COUNT(*) as count FROM classes');
    console.log(`🏫 Total classes created: ${classResult.rows[0].count}`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Admin: admin@school.edu.vn / admin123');
    console.log('Teacher: teacher1@school.edu.vn / teacher123');
    console.log('Student: student1@school.edu.vn / student123');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
