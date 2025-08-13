const pool = require('../config/database');

class Inventory {
  static async getAll() {
    const query = 'SELECT * FROM inventory ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(itemId) {
    const query = 'SELECT * FROM inventory WHERE item_id = $1';
    const result = await pool.query(query, [itemId]);
    return result.rows[0];
  }

  static async getByStatus(status) {
    const query = 'SELECT * FROM inventory WHERE status = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [status]);
    return result.rows;
  }

  static async create(itemData) {
    const { item_id, name, type, status, condition } = itemData;
    const query = `
      INSERT INTO inventory (item_id, name, type, status, condition)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [item_id, name, type, status, condition]);
    return result.rows[0];
  }

  static async update(itemId, itemData) {
    const { name, type, status, condition, assigned_to } = itemData;
    const query = `
      UPDATE inventory 
      SET name = $1, type = $2, status = $3, condition = $4, assigned_to = $5, updated_at = CURRENT_TIMESTAMP
      WHERE item_id = $6
      RETURNING *
    `;
    const result = await pool.query(query, [name, type, status, condition, assigned_to, itemId]);
    return result.rows[0];
  }

  static async assignToUser(itemId, userId) {
    const query = `
      UPDATE inventory 
      SET assigned_to = $1, status = 'Assigné', updated_at = CURRENT_TIMESTAMP
      WHERE item_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [userId, itemId]);
    return result.rows[0];
  }

  static async unassign(itemId) {
    const query = `
      UPDATE inventory 
      SET assigned_to = NULL, status = 'Disponible', updated_at = CURRENT_TIMESTAMP
      WHERE item_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [itemId]);
    return result.rows[0];
  }

  static async delete(itemId) {
    const query = 'DELETE FROM inventory WHERE item_id = $1 RETURNING *';
    const result = await pool.query(query, [itemId]);
    return result.rows[0];
  }

  static async getNextItemId() {
    const query = 'SELECT COALESCE(MAX(CAST(SUBSTRING(item_id FROM 4) AS INTEGER)), 0) + 1 as next_id FROM inventory';
    const result = await pool.query(query);
    return `inv${String(result.rows[0].next_id).padStart(3, '0')}`;
  }
}

module.exports = Inventory;
