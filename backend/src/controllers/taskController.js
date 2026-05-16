const Task = require('../models/Task');
const TaskDocument = require('../models/TaskDocument');
const FileService = require('../services/fileService');
const { validationResult } = require('express-validator');

const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Create task first
    const taskData = {
      title: req.body.title,
      description: req.body.description || '',
      status: req.body.status || 'pending',
      priority: req.body.priority || 'medium',
      due_date: req.body.due_date || null,
      assigned_to: req.body.assigned_to || null,
      created_by: req.user.id
    };

    const task = await Task.create(taskData);
    console.log(`Task created with ID: ${task.id}`);
    
    // Handle file uploads if present
    const uploadedDocuments = [];
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} file(s)`);
      
      if (req.files.length > 3) {
        return res.status(400).json({ error: 'Maximum 3 documents allowed' });
      }
      
      for (const file of req.files) {
        try {
          const document = await FileService.uploadFile(file, task.id);
          uploadedDocuments.push(document);
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          // Continue with other files even if one fails
        }
      }
    }
    
    // Return task with documents
    const taskWithDocuments = await Task.findById(task.id);
    
    res.status(201).json({ 
      message: uploadedDocuments.length > 0 ? 'Task created with documents' : 'Task created successfully',
      task: taskWithDocuments
    });
    
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assigned_to,
      due_date_from,
      due_date_to,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const filters = {
      status,
      priority,
      assigned_to,
      due_date_from,
      due_date_to,
      search,
      sort_by,
      sort_order
    };

    const result = await Task.findAll(
      filters,
      parseInt(page),
      parseInt(limit),
      req.user.id,
      req.user.role
    );

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        task.created_by !== req.user.id && 
        task.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && existingTask.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const task = await Task.update(req.params.id, req.body);
    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && existingTask.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete associated documents from Cloudinary
    const documents = existingTask.documents || [];
    for (const doc of documents) {
      try {
        await FileService.deleteFile(doc.id);
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }

    await Task.delete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getTaskStatistics = async (req, res) => {
  try {
    const stats = await Task.getStatistics(req.user.id, req.user.role);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const uploadTaskDocuments = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const currentDocsCount = task.documents ? task.documents.length : 0;
    const newDocsCount = req.files.length;
    
    if (currentDocsCount + newDocsCount > 3) {
      return res.status(400).json({ error: 'Maximum 3 documents allowed per task' });
    }

    const documents = [];
    for (const file of req.files) {
      const document = await FileService.uploadFile(file, taskId);
      documents.push(document);
    }

    // Return updated task with documents
    const updatedTask = await Task.findById(taskId);
    res.json({ message: 'Documents uploaded successfully', task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const deleteTaskDocument = async (req, res) => {
  try {
    await FileService.deleteFile(req.params.documentId);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStatistics,
  uploadTaskDocuments,
  deleteTaskDocument
};