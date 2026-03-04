const db = require('../config/db');

class User {
  static async create(name, email, passwordHash) {
    const query = `
      INSERT INTO users (id, name, email, password_hash, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, NOW())
      RETURNING id, name, email, role, created_at
    `;
    const { rows } = await db.query(query, [name, email, passwordHash]);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1`;
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = `SELECT id, name, email, role, created_at FROM users WHERE id = $1`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async findAll() {
    const query = `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`;
    const { rows } = await db.query(query);
    return rows;
  }

  static async updateProfile(id, name) {
    const query = `
      UPDATE users SET name = $1 
      WHERE id = $2 RETURNING id, name, email, role, created_at
    `;
    const { rows } = await db.query(query, [name, id]);
    return rows[0];
  }

  static async ensureTableExists() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await db.query(query);
  }
}

module.exports = User;
