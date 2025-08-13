const pool = require('../config/database');

class User {
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(userId) {
    const query = 'SELECT * FROM users WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async getAllTechnicians() {
    const query = 'SELECT * FROM users WHERE role = $1 ORDER BY name';
    const result = await pool.query(query, ['technicien']);
    return result.rows;
  }

  static async create(userData) {
    const { user_id, name, email, password, role } = userData;
    const query = `
      INSERT INTO users (user_id, name, email, password, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [user_id, name, email, password, role]);
    return result.rows[0];
  }

  static async update(userId, userData) {
    const { name, email, password, role } = userData;
    const query = `
      UPDATE users 
      SET name = $1, email = $2, password = $3, role = $4, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $5
      RETURNING *
    `;
    const result = await pool.query(query, [name, email, password, role, userId]);
    return result.rows[0];
  }

  static async delete(userId) {
    const query = 'DELETE FROM users WHERE user_id = $1 RETURNING *';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = User;
