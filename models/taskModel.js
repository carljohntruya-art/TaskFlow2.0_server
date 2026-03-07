const db = require('../config/db');

class Task {
  static async create(userId, title, description, status, priority, dueDate, imageUrl) {
    const query = `
      INSERT INTO tasks (id, user_id, title, description, status, priority, due_date, image_url, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;
    const values = [userId, title, description, status || 'todo', priority || 'medium', dueDate || null, imageUrl || null];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findAllByUser(userId) {
    const query = `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`;
    const { rows } = await db.query(query, [userId]);
    return rows;
  }

  static async findById(id) {
    const query = `SELECT * FROM tasks WHERE id = $1`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async update(id, userId, updates) {
    const { title, description, status, priority, dueDate, imageUrl } = updates;
    
    // Allow partial updates
    const query = `
      UPDATE tasks
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        due_date = COALESCE($5, due_date),
        image_url = COALESCE($6, image_url),
        updated_at = NOW()
      WHERE id = $7 AND user_id = $8
      RETURNING *
    `;
    // Coerce undefined → null so PostgreSQL never receives an undefined binding
    const values = [
      title        !== undefined ? title       : null,
      description  !== undefined ? description : null,
      status       !== undefined ? status      : null,
      priority     !== undefined ? priority    : null,
      dueDate      !== undefined ? dueDate     : null,
      imageUrl     !== undefined ? imageUrl    : null,
      id,
      userId
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id, userId) {
    const query = `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id`;
    const { rows } = await db.query(query, [id, userId]);
    return rows[0];
  }

  static async ensureTableExists() {
    const query = `
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        due_date DATE,
        image_url TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await db.query(query);
  }
}

module.exports = Task;
