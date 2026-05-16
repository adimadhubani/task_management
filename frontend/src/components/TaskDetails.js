import React from 'react';
import { DocumentIcon } from '@heroicons/react/24/outline';

const TaskDetails = ({ task }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-500">Title</h4>
        <p className="mt-1 text-gray-900">{task.title}</p>
      </div>

      {task.description && (
        <div>
          <h4 className="text-sm font-medium text-gray-500">Description</h4>
          <p className="mt-1 text-gray-900">{task.description}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Status</h4>
          <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
            {task.status?.replace('_', ' ')}
          </span>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Priority</h4>
          <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
          <p className="mt-1 text-gray-900">
            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Assigned To</h4>
          <p className="mt-1 text-gray-900">{task.assigned_to_email || 'Unassigned'}</p>
        </div>
      </div>

      {task.documents && task.documents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Attached Documents</h4>
          <div className="space-y-2">
            {task.documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-2 border rounded-lg hover:bg-gray-50"
              >
                <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-primary-600">{doc.file_name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;