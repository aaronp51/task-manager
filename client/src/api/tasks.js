import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getTasks() {
  const token = localStorage.getItem('token');

  const response = await axios.get(`${API_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function createTask(taskData) {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API_URL}/tasks`,
    taskData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function updateTask(taskId, taskData) {
  const token = localStorage.getItem('token');

  const response = await axios.patch(
    `${API_URL}/tasks/${taskId}`,
    taskData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function deleteTask(taskId) {
  const token = localStorage.getItem('token');

  const response = await axios.delete(
    `${API_URL}/tasks/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}