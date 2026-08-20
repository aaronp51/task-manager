import { useState } from 'react';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import '../stylesheets/Dashboard.css';

function Dashboard() {
  const [todayTasks, setTodayTasks] = useState([
    {
      id: 1,
      title: 'Finish task-manager backend',
      description: 'Complete the remaining API routes.',
      priority: 'High',
      completed: false,
    },
    {
      id: 2,
      title: 'Study AWS SAA',
      description: 'Review VPC networking and storage.',
      priority: 'Medium',
      completed: false,
    },
    {
      id: 3,
      title: 'Design dashboard UI',
      description: 'Finish the dashboard layout and styling.',
      priority: 'Low',
      completed: true,
    },
  ]);

  function toggleTaskCompletion(taskId) {
    setTodayTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  return (
    <div className="dashboard">
      {/* Dashboard header */}
      <header className="dashboard-header">
        <div>
          <h1>Good evening, John 👋</h1>
          <p>Here's an overview of your tasks.</p>
        </div>
      </header>

      {/* Statistics */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Tasks</span>

            <div className="stat-card-icon">
              <ListTodo size={20} />
            </div>
          </div>

          <p className="stat-card-value">12</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">In Progress</span>

            <div className="stat-card-icon">
              <Clock size={20} />
            </div>
          </div>

          <p className="stat-card-value">5</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Completed</span>

            <div className="stat-card-icon">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <p className="stat-card-value">7</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Overdue</span>

            <div className="stat-card-icon">
              <AlertCircle size={20} />
            </div>
          </div>

          <p className="stat-card-value">2</p>
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
          {todayTasks.map((task) => (
            <div className="dashboard-task" key={task.id}>
              <button
                className={`task-checkbox ${
                  task.completed ? 'completed' : ''
                }`}
              >
                {task.completed && <CheckCircle2 size={20} />}
              </button>

              <div className="task-details">
                <h3 className={task.completed ? 'task-completed' : ''}>
                  {task.title}
                </h3>

                <p>{task.description}</p>
              </div>

              <span
                className={`priority-badge ${task.priority.toLowerCase()}`}
              >
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;