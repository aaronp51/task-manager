import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  X,
  Pencil,
  Trash2,
} from 'lucide-react';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';

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

  const [editingTaskId, setEditingTaskId] = useState(null);

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editDueDate, setEditDueDate] = useState('');

  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete
  const [deletingTaskId, setDeletingTaskId] = useState(null);

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

  async function toggleTaskCompletion(taskId) {
    const task = tasks.find(currentTask => currentTask.id === taskId);

    if (!task) return;

    const newCompletedStatus = !task.completed;

    // Update UI immediately
    setTasks(currentTasks =>
      currentTasks.map(currentTask =>
        currentTask.id === taskId
          ? { ...currentTask, completed: newCompletedStatus }
          : currentTask
      )
    );

    try {
      // Persist change to database
      await updateTask(taskId, {
        completed: newCompletedStatus,
      });
    } catch (error) {
      console.error('Failed to update task:', error);

      // Revert UI if database update failed
      setTasks(currentTasks =>
        currentTasks.map(currentTask =>
          currentTask.id === taskId
            ? { ...currentTask, completed: !newCompletedStatus }
            : currentTask
        )
      );
    }
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

  function startEditingTask(task) {
    setEditingTaskId(task.id);

    setEditTitle(task.title ?? '');
    setEditDescription(task.description ?? '');
    setEditPriority(task.priority ?? 'medium');

    if (task.dueDate) {
      setEditDueDate(task.dueDate.slice(0, 10));
    } else {
      setEditDueDate('');
    }

    setEditError('');
  }

  function cancelEditing() {
    setEditingTaskId(null);

    setEditTitle('');
    setEditDescription('');
    setEditPriority('medium');
    setEditDueDate('');
    setEditError('');
  }
  
  async function handleEditTask(event) {
    event.preventDefault();

    setEditError('');

    if (!editTitle.trim()) {
      setEditError('Title is required.');
      return;
    }

    try {
      setSavingEdit(true);

      await updateTask(editingTaskId, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        priority: editPriority,
        dueDate: editDueDate || null,
      });

      // Update the existing task locally.
      // The PATCH endpoint only returns { updatedTask: { count }, message },
      // so we don't use its response as the task object.
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title: editTitle.trim(),
                description: editDescription.trim() || null,
                priority: editPriority,
                dueDate: editDueDate || null,
              }
            : task
        )
      );

      cancelEditing();
    } catch (error) {
      console.error('Failed to update task:', error);
      setEditError('Failed to update task.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteTask(taskId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTaskId(taskId);

      await deleteTask(taskId);

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task.id !== taskId
        )
      );

      if (editingTaskId === taskId) {
        cancelEditing();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);

      setError('Failed to delete task.');
    } finally {
      setDeletingTaskId(null);
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
          filteredTasks.map((task) => {
            if (editingTaskId === task.id) {
              return (
                <form
                  key={task.id}
                  className="edit-task-form"
                  onSubmit={handleEditTask}
                >
                  <div className="edit-task-header">
                    <h2>Edit Task</h2>

                    <button
                      type="button"
                      className="close-form-button"
                      onClick={cancelEditing}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <label>
                    Title

                    <input
                      type="text"
                      value={editTitle}
                      onChange={(event) =>
                        setEditTitle(
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Description

                    <textarea
                      value={editDescription}
                      onChange={(event) =>
                        setEditDescription(
                          event.target.value
                        )
                      }
                      rows="4"
                    />
                  </label>

                  <div className="form-row">
                    <label>
                      Priority

                      <select
                        value={editPriority}
                        onChange={(event) =>
                          setEditPriority(
                            event.target.value
                          )
                        }
                      >
                        <option value="low">
                          Low
                        </option>
                        <option value="medium">
                          Medium
                        </option>
                        <option value="high">
                          High
                        </option>
                      </select>
                    </label>

                    <label>
                      Due Date

                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(event) =>
                          setEditDueDate(
                            event.target.value
                          )
                        }
                      />
                    </label>
                  </div>

                  {editError && (
                    <p className="create-task-error">
                      {editError}
                    </p>
                  )}

                  <div className="create-task-form-actions">
                    <button
                      type="button"
                      className="cancel-task-button"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="submit-task-button"
                      disabled={savingEdit}
                    >
                      {savingEdit
                        ? 'Saving...'
                        : 'Save Changes'}
                    </button>
                  </div>
                </form>
              );
            }
            return (
              <div
                className={`task-row ${
                  task.completed
                    ? 'task-completed'
                    : ''
                }`}
                key={task.id}
              >
                <button
                  className={`task-row-checkbox ${
                    task.completed
                      ? 'completed'
                      : ''
                  }`}
                  onClick={() =>
                    toggleTaskCompletion(
                      task.id
                    )
                  }
                  aria-label={
                    task.completed
                      ? 'Mark task incomplete'
                      : 'Mark task complete'
                  }
                >
                  {task.completed && (
                    <CheckCircle2 size={20} />
                  )}
                </button>

                <div className="task-row-details">
                  <h2
                    className={`task-row-title ${
                      task.completed
                        ? 'completed'
                        : ''
                    }`}
                  >
                    {task.title ?? 'Untitled Task'}
                  </h2>

                  <p className="task-row-description">
                    {task.description ?? ''}
                  </p>
                </div>

                <span
                  className={`task-priority ${
                    (
                      task.priority ??
                      'medium'
                    ).toLowerCase()
                  }`}
                >
                  {task.priority ?? 'medium'}
                </span>

                <div className="task-actions">
                  <button
                    className="task-action-button"
                    onClick={() =>
                      startEditingTask(task)
                    }
                    aria-label="Edit task"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    className="task-action-button delete"
                    onClick={() =>
                      handleDeleteTask(
                        task.id
                      )
                    }
                    disabled={
                      deletingTaskId ===
                      task.id
                    }
                    aria-label="Delete task"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            );
          })
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