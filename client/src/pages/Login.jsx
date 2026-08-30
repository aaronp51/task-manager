import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { loginUser } from '../api/auth';

import '../stylesheets/Login.css';

function Login() {
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');

    try {
        setLoading(true);

        const data = await loginUser(email, password);

        console.log('Login successful:', data);

        localStorage.setItem('token', data.token);

        navigate('/dashboard');
    } catch (error) {
        console.error('Login failed:', error);

        const message =
        error.response?.data?.message ||
        error.response?.data ||
        'Invalid email or password.';

        setError(message);
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          ✓
        </div>

        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Log in to your Task Manager account.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            {error && (
            <div className="auth-error">
                {error}
            </div>
            )}
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div className="password-label">
              <label htmlFor="password">Password</label>
            </div>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
            >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;