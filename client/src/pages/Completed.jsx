import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CheckCircle2,
  Search,
  RotateCcw,
  Trash2,
  Calendar,
} from 'lucide-react';
import '../stylesheets/Completed.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Completed() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const fetchCompletedTasks = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allTasks = response.data.tasks || [];

      // Only keep completed tasks
      const completedTasks = allTasks.filter(
        (task) => task.completed === true
      );

      // Most recently updated/completed first
      completedTasks.sort((a, b) => {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);

        return dateB - dateA;
      });

      setTasks(completedTasks);
    } catch (err) {
      console.error('Error fetching completed tasks:', err);
      setError('Failed to load completed tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkIncomplete = async (task) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.patch(
        `${API_URL}/tasks/${task.id}`,
        {
          completed: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.updatedTask?.count === 1) {
        // Remove it from the completed list because it is now incomplete
        setTasks((currentTasks) =>
          currentTasks.filter((currentTask) => currentTask.id !== task.id)
        );
      }
    } catch (err) {
      console.error('Error marking task incomplete:', err);
      setError('Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this task?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // The DELETE request succeeded, so remove the task
      // from the local UI immediately.
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task.');
    }
  };

  const getTaskDate = (task) => {
    if (!task.dueDate) {
      return null;
    }

    const dateString = task.dueDate;

    // Handle ISO dates without introducing timezone shifts
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      return dateString.substring(0, 10);
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleDateString();
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return '';
    }

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredTasks = tasks.filter((task) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return true;
    }

    return (
      task.title?.toLowerCase().includes(search) ||
      task.description?.toLowerCase().includes(search) ||
      task.priority?.toLowerCase().includes(search)
    );
  });

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'priority-high';

      case 'low':
        return 'priority-low';

      case 'medium':
      default:
        return 'priority-medium';
    }
  };

  if (loading) {
    return (
      <div className="completed-page">
        <div className="completed-loading">
          <div className="loading-spinner"></div>
          <p>Loading completed tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="completed-page">
      {/* Header */}
      <div className="completed-page-header">
        <div>
          <h1>Completed</h1>
          <p>
            {tasks.length === 0
              ? 'Tasks you have completed will appear here.'
              : `${tasks.length} completed ${
                  tasks.length === 1 ? 'task' : 'tasks'
                }`}
          </p>
        </div>

        <div className="completed-header-icon">
          <CheckCircle2 size={28} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="completed-error">
          <p>{error}</p>
          <button onClick={fetchCompletedTasks}>Try Again</button>
        </div>
      )}

      {/* Search */}
      {tasks.length > 0 && (
        <div className="completed-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search completed tasks..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && !error && (
        <div className="completed-empty">
          <div className="completed-empty-icon">
            <CheckCircle2 size={42} />
          </div>

          <h2>No completed tasks</h2>

          <p>
            Once you complete a task, it will appear here.
          </p>
        </div>
      )}

      {/* No search results */}
      {tasks.length > 0 && filteredTasks.length === 0 && (
        <div className="completed-empty">
          <div className="completed-empty-icon">
            <Search size={36} />
          </div>

          <h2>No tasks found</h2>

          <p>
            No completed tasks match "{searchTerm}".
          </p>
        </div>
      )}

      {/* Task list */}
      {filteredTasks.length > 0 && (
        <div className="completed-task-list">
          {filteredTasks.map((task) => {
            const taskDate = getTaskDate(task);

            return (
              <div className="completed-task-card" key={task.id}>
                <div className="completed-task-main">
                  {/* Completion icon */}
                  <div className="completed-task-check">
                    <CheckCircle2 size={24} />
                  </div>

                  {/* Task information */}
                  <div className="completed-task-info">
                    <div className="completed-task-title-row">
                      <h2>{task.title}</h2>

                      <span
                        className={`task-priority ${getPriorityClass(
                          task.priority
                        )}`}
                      >
                        {task.priority || 'medium'}
                      </span>
                    </div>

                    {task.description && (
                      <p className="completed-task-description">
                        {task.description}
                      </p>
                    )}

                    {taskDate && (
                      <div className="completed-task-date">
                        <Calendar size={15} />
                        <span>Due {formatDate(taskDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="completed-task-actions">
                  <button
                    className="restore-task-button"
                    onClick={() => handleMarkIncomplete(task)}
                    title="Mark as incomplete"
                  >
                    <RotateCcw size={17} />
                    <span>Restore</span>
                  </button>

                  <button
                    className="delete-task-button"
                    onClick={() => handleDeleteTask(task.id)}
                    title="Delete task"
                  >
                    <Trash2 size={17} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Completed;