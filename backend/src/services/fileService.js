const cloudinary = require('../config/cloudinary');
const TaskDocument = require('../models/TaskDocument');
const stream = require('stream');

class FileService {
  static async uploadFile(file, taskId) {
    try {
      console.log(`Uploading file: ${file.originalname} for task ${taskId}`);
      
      // Upload to Cloudinary using buffer
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `task-management/tasks/${taskId}`,
            resource_type: 'auto',
            allowed_formats: ['pdf'],
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        
        // Create readable stream from buffer and pipe to Cloudinary
        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);
        bufferStream.pipe(uploadStream);
      });
      
      console.log('Upload successful:', result.secure_url);
      
      // Save to database
      const document = await TaskDocument.create({
        task_id: taskId,
        file_name: file.originalname,
        file_url: result.secure_url,
        file_size: file.size,
        mime_type: file.mimetype,
        public_id: result.public_id
      });
      
      return document;
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  static async deleteFile(documentId) {
    try {
      const document = await TaskDocument.findById(documentId);
      if (document && document.public_id) {
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(document.public_id, { resource_type: 'raw' });
        // Delete from database
        await TaskDocument.delete(documentId);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }
}

module.exports = FileService;