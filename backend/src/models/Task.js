const pool = require('../config/database');

class Task {
  static async create(taskData) {
    const { title, description, status, priority, due_date, assigned_to, created_by } = taskData;
    
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, assigned_to, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, status, priority, due_date, assigned_to, created_by]
    );
    return result.rows[0];
  }

  static async findById(id) {
    // Get task with documents
    const taskResult = await pool.query(
      `SELECT t.*, u.email as assigned_to_email 
       FROM tasks t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       WHERE t.id = $1`,
      [id]
    );
    
    if (taskResult.rows.length === 0) return null;
    
    const task = taskResult.rows[0];
    
    // Get documents for this task
    const documentsResult = await pool.query(
      'SELECT * FROM task_documents WHERE task_id = $1 ORDER BY uploaded_at DESC',
      [id]
    );
    
    task.documents = documentsResult.rows;
    return task;
  }

  static async findAll(filters = {}, page = 1, limit = 10, userId = null, userRole = 'user') {
    let query = `
      SELECT t.*, u.email as assigned_to_email,
             COUNT(*) OVER() as total_count
      FROM tasks t 
      LEFT JOIN users u ON t.assigned_to = u.id 
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    // Filter by user if not admin
    if (userRole !== 'admin' && userId) {
      query += ` AND (t.created_by = $${paramCount} OR t.assigned_to = $${paramCount})`;
      values.push(userId);
      paramCount++;
    }

    // Apply filters
    if (filters.status) {
      query += ` AND t.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.priority) {
      query += ` AND t.priority = $${paramCount}`;
      values.push(filters.priority);
      paramCount++;
    }

    if (filters.assigned_to) {
      query += ` AND t.assigned_to = $${paramCount}`;
      values.push(filters.assigned_to);
      paramCount++;
    }

    if (filters.due_date_from) {
      query += ` AND t.due_date >= $${paramCount}`;
      values.push(filters.due_date_from);
      paramCount++;
    }

    if (filters.due_date_to) {
      query += ` AND t.due_date <= $${paramCount}`;
      values.push(filters.due_date_to);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (t.title ILIKE $${paramCount} OR t.description ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    // Sorting
    const sortField = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // Pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, (page - 1) * limit);

    const result = await pool.query(query, values);
    const totalCount = result.rows[0] ? parseInt(result.rows[0].total_count) : 0;
    
    // Get documents for each task
    const tasksWithDocuments = [];
    for (const task of result.rows) {
      const docsResult = await pool.query(
        'SELECT * FROM task_documents WHERE task_id = $1 ORDER BY uploaded_at DESC',
        [task.id]
      );
      tasksWithDocuments.push({
        ...task,
        documents: docsResult.rows
      });
    }
    
    return {
      tasks: tasksWithDocuments,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  static async update(id, taskData) {
    const { title, description, status, priority, due_date, assigned_to } = taskData;
    const result = await pool.query(
      `UPDATE tasks 
       SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, assigned_to = $6, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 RETURNING *`,
      [title, description, status, priority, due_date, assigned_to, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async getStatistics(userId = null, userRole = 'user') {
    let query = `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tasks,
        COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_tasks,
        COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_tasks
      FROM tasks
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (userRole !== 'admin' && userId) {
      query += ` AND (created_by = $${paramCount} OR assigned_to = $${paramCount})`;
      values.push(userId);
      paramCount++;
    }

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = Task; 