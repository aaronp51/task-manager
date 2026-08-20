import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getTasks() {
  const response = await axios.get(`${API_URL}/tasks`);

  return response.data;
}