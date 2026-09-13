import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import '../stylesheets/Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      if (!token) {
        setError('You are not logged in.');
        return;
      }

      const response = await axios.get(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);

      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to load your tasks.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleTaskCompletion(task) {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('You are not logged in.');
        return;
      }

      const response = await axios.patch(
        `${API_URL}/tasks/${task.id}`,
        {
          completed: !task.completed,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.updatedTask.count === 1) {
        setTasks((currentTasks) =>
          currentTasks.map((currentTask) =>
            currentTask.id === task.id
              ? {
                  ...currentTask,
                  completed: !currentTask.completed,
                }
              : currentTask
          )
        );
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update the task.');
    }
  }

  /*
   * Get the current local date in YYYY-MM-DD format.
   *
   * We use the local calendar date instead of comparing Date objects
   * directly. This avoids timezone problems with date-only values.
   */
  function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /*
   * Convert a task's due date into the same YYYY-MM-DD format.
   *
   * If the database value starts with YYYY-MM-DD, use that calendar
   * date directly instead of allowing JavaScript timezone conversion
   * to move it to the previous day.
   */
  function getTaskDate(task) {
    if (!task.dueDate) {
      return null;
    }

    const dueDateString = String(task.dueDate);

    // Handles values such as:
    // "2026-09-13"
    // "2026-09-13T00:00:00.000Z"
    if (/^\d{4}-\d{2}-\d{2}/.test(dueDateString)) {
      return dueDateString.substring(0, 10);
    }

    const dueDate = new Date(task.dueDate);

    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const day = String(dueDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function isDueToday(task) {
    return getTaskDate(task) === getTodayDate();
  }

  function isOverdue(task) {
    if (!task.dueDate || task.completed) {
      return false;
    }

    return getTaskDate(task) < getTodayDate();
  }

  /*
   * Determine the appropriate greeting from the user's local time.
   */
  function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Good morning';
    }

    if (hour < 18) {
      return 'Good afternoon';
    }

    return 'Good evening';
  }

  // -----------------------------
  // Dashboard statistics
  // -----------------------------

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => !task.completed
  ).length;

  const overdueTasks = tasks.filter(
    (task) => isOverdue(task)
  ).length;

  // -----------------------------
  // Today's tasks
  // -----------------------------

  const todayTasks = tasks
    .filter((task) => isDueToday(task))
    .sort((a, b) => {
      // Incomplete tasks first.
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // Then sort by due date.
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

  return (
    <div className="dashboard">
      {/* Dashboard header */}
      <header className="dashboard-header">
        <div>
          <h1>{getGreeting()} 👋</h1>
          <p>Here's an overview of your tasks.</p>
        </div>
      </header>

      {/* Error message */}
      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* Statistics */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Tasks</span>

            <div className="stat-card-icon">
              <ListTodo size={20} />
            </div>
          </div>

          <p className="stat-card-value">
            {loading ? '...' : totalTasks}
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">In Progress</span>

            <div className="stat-card-icon">
              <Clock size={20} />
            </div>
          </div>

          <p className="stat-card-value">
            {loading ? '...' : inProgressTasks}
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Completed</span>

            <div className="stat-card-icon">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <p className="stat-card-value">
            {loading ? '...' : completedTasks}
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Overdue</span>

            <div className="stat-card-icon">
              <AlertCircle size={20} />
            </div>
          </div>

          <p className="stat-card-value">
            {loading ? '...' : overdueTasks}
          </p>
        </div>
      </section>

      {/* Today's tasks */}
      <section className="tasks-section">
        <div className="section-header">
          <div>
            <h2>Today's Tasks</h2>
            <p>Your tasks for today.</p>
          </div>

          <Link to="/tasks" className="view-all-link">
            View All
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="dashboard-task-list">
          {loading ? (
            <div className="dashboard-empty-state">
              <p>Loading your tasks...</p>
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="dashboard-empty-state">
              <p>No tasks due today.</p>
              <Link to="/tasks">Go to Tasks</Link>
            </div>
          ) : (
            todayTasks.map((task) => (
              <div className="dashboard-task" key={task.id}>
                <button
                  className={`task-checkbox ${
                    task.completed ? 'completed' : ''
                  }`}
                  onClick={() => toggleTaskCompletion(task)}
                  aria-label={
                    task.completed
                      ? `Mark ${task.title} as incomplete`
                      : `Mark ${task.title} as complete`
                  }
                >
                  {task.completed && <CheckCircle2 size={20} />}
                </button>

                <div className="task-details">
                  <h3
                    className={
                      task.completed ? 'task-completed' : ''
                    }
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p>{task.description}</p>
                  )}
                </div>

                <span
                  className={`priority-badge ${task.priority.toLowerCase()}`}
                >
                  {task.priority}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;