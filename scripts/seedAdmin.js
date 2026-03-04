require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcrypt');
const db = require('../config/db');

const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@taskflow.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const name = 'Admin';

    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      console.log('Admin already exists:', email);
      process.exit(0);
    }

    const hash = await bcrypt.hash(password, 12);
    await db.query(
      `INSERT INTO users (id, name, email, password_hash, role)
       VALUES (gen_random_uuid(), $1, $2, $3, 'admin')`,
      [name, email, hash]
    );

    console.log('✅ Admin created successfully');
    console.log('   Email   :', email);
    console.log('   Password:', password);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seedAdmin();
