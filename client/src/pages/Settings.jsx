import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Mail,
  Lock,
  Trash2,
  LogOut,
  User,
  CalendarDays,
} from 'lucide-react';

import '../stylesheets/Settings.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [deletePassword, setDeletePassword] = useState('');

  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [deleteError, setDeleteError] = useState('');

  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      setLoading(true);

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data.user);
      setEmail(response.data.user.email);
    }
    catch (error) {
      console.error('Failed to fetch account:', error);
    }
    finally {
      setLoading(false);
    }
  }

  async function handleEmailChange(event) {
    event.preventDefault();

    setEmailMessage('');
    setEmailError('');

    if (!emailPassword) {
      setEmailError('Enter your current password.');
      return;
    }

    try {
      setUpdatingEmail(true);

      const response = await axios.patch(
        `${API_URL}/users/me/email`,
        {
          newEmail: email,
          password: emailPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data.user);
      setEmailPassword('');
      setEmailMessage('Email updated successfully.');
    }
    catch (error) {
      setEmailError(
        error.response?.data ||
          'Failed to update your email.'
      );
    }
    finally {
      setUpdatingEmail(false);
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();

    setPasswordMessage('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        'New password must be at least 8 characters.'
      );
      return;
    }

    try {
      setUpdatingPassword(true);

      const response = await axios.patch(
        `${API_URL}/users/me/password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setPasswordMessage(
        response.data.message || 'Password updated successfully.'
      );
    }
    catch (error) {
      setPasswordError(
        error.response?.data ||
          'Failed to update your password.'
      );
    }
    finally {
      setUpdatingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError('');

    if (!deletePassword) {
      setDeleteError('Enter your current password.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your account? This will also delete all of your tasks. This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAccount(true);

      await axios.delete(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          password: deletePassword,
        },
      });

      localStorage.removeItem('token');

      window.location.href = '/login';
    }
    catch (error) {
      setDeleteError(
        error.response?.data ||
          'Failed to delete your account.'
      );
    }
    finally {
      setDeletingAccount(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  function formatDate(date) {
    if (!date) {
      return '';
    }

    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          Loading settings...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="settings-page">
        <div className="settings-card">
          <p>Please log in to view your account settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* Header */}
      <header className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and preferences.</p>
        </div>
      </header>

      {/* Account information */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <User size={20} />
          </div>

          <div>
            <h2>Account Information</h2>
            <p>Your account details.</p>
          </div>
        </div>

        <div className="account-info">
          <div className="account-info-item">
            <Mail size={18} />

            <div>
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>
          </div>

          <div className="account-info-item">
            <CalendarDays size={18} />

            <div>
              <span>Member since</span>
              <strong>{formatDate(user.createdAt)}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Change email */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <Mail size={20} />
          </div>

          <div>
            <h2>Email Address</h2>
            <p>Update the email associated with your account.</p>
          </div>
        </div>

        <form onSubmit={handleEmailChange} className="settings-form">
          <div className="form-group">
            <label htmlFor="email">
              New email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email-password">
              Current password
            </label>

            <input
              id="email-password"
              type="password"
              value={emailPassword}
              onChange={(event) =>
                setEmailPassword(event.target.value)
              }
              placeholder="Enter your current password"
              required
            />
          </div>

          {emailError && (
            <p className="settings-error">
              {emailError}
            </p>
          )}

          {emailMessage && (
            <p className="settings-success">
              {emailMessage}
            </p>
          )}

          <button
            type="submit"
            className="settings-primary-button"
            disabled={updatingEmail}
          >
            {updatingEmail
              ? 'Updating...'
              : 'Update email'}
          </button>
        </form>
      </section>

      {/* Change password */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <Lock size={20} />
          </div>

          <div>
            <h2>Password</h2>
            <p>Change your account password.</p>
          </div>
        </div>

        <form
          onSubmit={handlePasswordChange}
          className="settings-form"
        >
          <div className="form-group">
            <label htmlFor="current-password">
              Current password
            </label>

            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-password">
              New password
            </label>

            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              minLength={8}
              required
            />

            <small>
              Password must be at least 8 characters.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">
              Confirm new password
            </label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              minLength={8}
              required
            />
          </div>

          {passwordError && (
            <p className="settings-error">
              {passwordError}
            </p>
          )}

          {passwordMessage && (
            <p className="settings-success">
              {passwordMessage}
            </p>
          )}

          <button
            type="submit"
            className="settings-primary-button"
            disabled={updatingPassword}
          >
            {updatingPassword
              ? 'Updating...'
              : 'Change password'}
          </button>
        </form>
      </section>

      {/* Session */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <LogOut size={20} />
          </div>

          <div>
            <h2>Session</h2>
            <p>Manage your current session.</p>
          </div>
        </div>

        <button
          type="button"
          className="settings-secondary-button"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Log out
        </button>
      </section>

      {/* Danger zone */}
      <section className="settings-card danger-zone">
        <div className="settings-card-header">
          <div className="settings-card-icon danger-icon">
            <Trash2 size={20} />
          </div>

          <div>
            <h2>Delete Account</h2>
            <p>
              Permanently delete your account and all associated
              tasks.
            </p>
          </div>
        </div>

        <div className="danger-warning">
          <strong>This action cannot be undone.</strong>
          <span>
            Deleting your account will permanently remove your
            account and all of your tasks.
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="delete-password">
            Current password
          </label>

          <input
            id="delete-password"
            type="password"
            value={deletePassword}
            onChange={(event) =>
              setDeletePassword(event.target.value)
            }
            placeholder="Enter your current password"
          />
        </div>

        {deleteError && (
          <p className="settings-error">
            {deleteError}
          </p>
        )}

        <button
          type="button"
          className="delete-account-button"
          onClick={handleDeleteAccount}
          disabled={deletingAccount}
        >
          <Trash2 size={17} />

          {deletingAccount
            ? 'Deleting account...'
            : 'Delete account'}
        </button>
      </section>
    </div>
  );
}

export default Settings;