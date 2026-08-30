import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function registerUser(email, password) {
  const response = await axios.post(`${API_URL}/users/register`, {
    email,
    password,
  });

  return response.data;
}

export async function loginUser(email, password) {
  const response = await axios.post(`${API_URL}/users/login`, {
    email,
    password,
  });

  return response.data;
}