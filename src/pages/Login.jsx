import { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import '../styles/login.css';

export default function Login() {
  const { user, loading, login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (!displayName.trim()) {
        setError('Name is required');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        await signup(email, password, displayName.trim());
      } else {
        await login(email, password);
      }
    } catch (err) {
      const messages = {
        'auth/invalid-credential': 'Invalid email or password',
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/weak-password': 'Password must be at least 6 characters',
        'auth/invalid-email': 'Invalid email address',
      };
      setError(messages[err.code] || err.message);
    } finally {
      setSubmitting(false);
    }
  }, [email, password, confirmPassword, displayName, isSignUp, login, signup]);

  const toggleMode = useCallback(() => {
    setIsSignUp(v => !v);
    setError('');
  }, []);

  if (loading) {
    return (
      <div className="login-page">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-header">
          <h1 className="login-title">ExploraVist</h1>
          <p className="login-subtitle">Admin Portal</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        {isSignUp && (
          <div className="input-group">
            <label htmlFor="displayName">Full Name</label>
            <input
              id="displayName"
              type="text"
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoFocus
            />
          </div>
        )}

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus={!isSignUp}
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {isSignUp && (
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary login-btn" disabled={submitting}>
          {submitting ? <LoadingSpinner size={16} /> : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>

        <div className="login-toggle">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button type="button" className="login-toggle-btn" onClick={toggleMode}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
}
