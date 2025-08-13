const pool = require('../config/database');

class Incident {
  static async create(incidentData) {
    const { 
      ticket_id, nom, prenom, departement, poste, 
      description_souci, categorie, priorite 
    } = incidentData;
    
    const query = `
      INSERT INTO incidents (ticket_id, nom, prenom, departement, poste, description_souci, categorie, priorite)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      ticket_id, nom, prenom, departement, poste, 
      description_souci, categorie, priorite
    ]);
    
    return result.rows[0];
  }

  static async getAll() {
    const query = 'SELECT * FROM incidents ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(ticketId) {
    const query = 'SELECT * FROM incidents WHERE ticket_id = $1';
    const result = await pool.query(query, [ticketId]);
    return result.rows[0];
  }

  static async getByStatus(status) {
    const query = 'SELECT * FROM incidents WHERE etat = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [status]);
    return result.rows;
  }

  static async assignToTechnician(ticketId, technicianId) {
    const query = `
      UPDATE incidents 
      SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP
      WHERE ticket_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [technicianId, ticketId]);
    return result.rows[0];
  }

  static async updateStatus(ticketId, status) {
    const query = `
      UPDATE incidents 
      SET etat = $1, updated_at = CURRENT_TIMESTAMP
      WHERE ticket_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, ticketId]);
    return result.rows[0];
  }

  static async getNextTicketId() {
    const query = 'SELECT COALESCE(MAX(ticket_id), 1000) + 1 as next_id FROM incidents';
    const result = await pool.query(query);
    return result.rows[0].next_id;
  }

  static async getTicketsForTracking() {
    const query = `
      SELECT 
        ticket_id,
        nom,
        prenom,
        departement,
        poste,
        description_souci,
        categorie,
        priorite,
        etat,
        assigned_to,
        created_at
      FROM incidents 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async delete(ticketId) {
    const query = 'DELETE FROM incidents WHERE ticket_id = $1 RETURNING *';
    const result = await pool.query(query, [ticketId]);
    return result.rows[0];
  }
}

module.exports = Incident;
