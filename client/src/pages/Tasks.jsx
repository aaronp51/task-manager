import { useEffect, useState } from 'react';
import { Search, Plus, CheckCircle2, X } from 'lucide-react';
import { getTasks, createTask } from '../api/tasks';

import '../stylesheets/Tasks.css';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    async function loadTasks() {
      try {
        const taskData = await getTasks();

        setTasks(taskData.tasks);
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

  async function handleCreateTask(event) {
    event.preventDefault();

    setCreateError('');

    if (!title.trim()) {
      setCreateError('Title is required.');
      return;
    }

    try {
      setCreating(true);

      await createTask({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        dueDate: dueDate || null,
      });

      const updatedTasks = await getTasks();
      setTasks(updatedTasks.tasks);

      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      setCreateError('Failed to create task.');
    } finally {
      setCreating(false);
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      (task.title ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());

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

        <button
          className="create-task-button"
          onClick={() => {
            setShowCreateForm(true);
            setCreateError('');
          }}
        >
          <Plus size={20} />
          New Task
        </button>
      </header>

      {showCreateForm && (
        <section className="create-task-form-container">
          <div className="create-task-form-header">
            <h2>Create New Task</h2>

            <button
              className="close-form-button"
              onClick={() => setShowCreateForm(false)}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateTask} className="create-task-form">
            <label>
              Title
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What needs to be done?"
              />
            </label>

            <label>
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add a description..."
                rows="4"
              />
            </label>

            <div className="form-row">
              <label>
                Priority
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>

              <label>
                Due Date
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </label>
            </div>

            {createError && (
              <p className="create-task-error">{createError}</p>
            )}

            <div className="create-task-form-actions">
              <button
                type="button"
                className="cancel-task-button"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="submit-task-button"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </section>
      )}

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
                className={`task-priority ${(task.priority ?? 'medium').toLowerCase()}`}
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