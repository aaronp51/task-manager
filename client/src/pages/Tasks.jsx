import { useEffect, useState } from 'react';
import { Search, Plus, CheckCircle2 } from 'lucide-react';

import { getTasks } from '../api/tasks';

import '../stylesheets/Tasks.css';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadTasks() {
      try {
        const taskData = await getTasks();

        setTasks(taskData);
      } catch (error) {
        console.error('Failed to load tasks:', error);

        setError('Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  function toggleTaskCompletion(taskId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'active') {
      return matchesSearch && !task.completed;
    }

    if (filter === 'completed') {
      return matchesSearch && task.completed;
    }

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="tasks-page">
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tasks-page">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      <header className="tasks-page-header">
        <div>
          <h1>My Tasks</h1>
          <p>Manage and organize all of your tasks.</p>
        </div>

        <button className="create-task-button">
          <Plus size={20} />
          New Task
        </button>
      </header>

      <section className="tasks-toolbar">
        <div className="search-container">
          <Search className="search-icon" size={20} />

          <input
            type="text"
            className="task-search"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="task-filters">
          <button
            className={`filter-button ${
              filter === 'all' ? 'active' : ''
            }`}
            onClick={() => setFilter('all')}
          >
            All
          </button>

          <button
            className={`filter-button ${
              filter === 'active' ? 'active' : ''
            }`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>

          <button
            className={`filter-button ${
              filter === 'completed' ? 'active' : ''
            }`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </section>

      <section className="tasks-list">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div className="task-row" key={task.id}>
              <button
                className={`task-row-checkbox ${
                  task.completed ? 'completed' : ''
                }`}
                onClick={() => toggleTaskCompletion(task.id)}
              >
                {task.completed && <CheckCircle2 size={20} />}
              </button>

              <div className="task-row-details">
                <h2
                  className={`task-row-title ${
                    task.completed ? 'completed' : ''
                  }`}
                >
                  {task.title}
                </h2>

                <p className="task-row-description">
                  {task.description}
                </p>
              </div>

              <span
                className={`task-priority ${task.priority.toLowerCase()}`}
              >
                {task.priority}
              </span>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No tasks found.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Tasks;