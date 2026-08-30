import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { registerUser } from '../api/auth';

import '../stylesheets/Register.css';

function Register() {
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
    }

    try {
        setLoading(true);

        await registerUser(email, password);

        setSuccess('Account created successfully.');

        setTimeout(() => {
        navigate('/login');
        }, 1000);
    } catch (error) {
        console.error('Registration failed:', error);

        const message =
        error.response?.data?.message ||
        'Unable to create account. Please try again.';

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
          <h1>Create your account</h1>
          <p>Get started with your Task Manager.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            {error && (
            <div className="auth-error">
                {error}
            </div>
            )}

            {success && (
            <div className="auth-success">
                {success}
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
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">
              Confirm Password
            </label>

            <input
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;