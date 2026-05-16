const pool = require('../config/database');

class TaskDocument {
  static async create(documentData) {
    const { task_id, file_name, file_url, file_size, mime_type, public_id } = documentData;
    
    const result = await pool.query(
      `INSERT INTO task_documents (task_id, file_name, file_url, file_size, mime_type, public_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [task_id, file_name, file_url, file_size, mime_type, public_id]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM task_documents WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByTaskId(taskId) {
    const result = await pool.query(
      'SELECT * FROM task_documents WHERE task_id = $1 ORDER BY uploaded_at DESC',
      [taskId]
    );
    return result.rows;
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM task_documents WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async deleteByTaskId(taskId) {
    const result = await pool.query('DELETE FROM task_documents WHERE task_id = $1 RETURNING id', [taskId]);
    return result.rows;
  }

  static async countByTaskId(taskId) {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM task_documents WHERE task_id = $1',
      [taskId]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = TaskDocument;