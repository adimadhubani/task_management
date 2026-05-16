const express = require('express');
const { body } = require('express-validator');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStatistics,
  uploadTaskDocuments,
  deleteTaskDocument
} = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/',
  upload.array('documents', 3),
  [
    body('title').notEmpty().trim(),
    body('description').optional().trim(),
    body('status').optional().isIn(['pending', 'in_progress', 'completed']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('due_date').optional().isDate(),
    body('assigned_to').optional().isInt()
  ],
  createTask
);

router.get('/', getTasks);
router.get('/statistics', getTaskStatistics);
router.get('/:id', getTaskById);
router.put(
  '/:id',
  [
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('status').optional().isIn(['pending', 'in_progress', 'completed']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('due_date').optional().isDate(),
    body('assigned_to').optional().isInt()
  ],
  updateTask
);
router.delete('/:id', deleteTask);
router.post('/:id/documents', upload.array('documents', 3), uploadTaskDocuments);
router.delete('/documents/:documentId', deleteTaskDocument);

module.exports = router;