import React, { useState } from 'react';
import { X, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed. Please verify your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal-box" onClick={e => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h3 className="auth-title">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h3>
          <button className="auth-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="auth-sub">
          {mode === 'login'
            ? 'Sign in to access favorites, watch history, and support chat'
            : 'Join Movie Storm to save your favorite cinema titles across devices'}
        </p>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label>Display Name</label>
              <div className="input-wrap">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                required
                placeholder="8+ chars with uppercase, lowercase & digit"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-auth-submit">
            {isSubmitting
              ? 'Connecting...'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer-toggle">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="btn-link">
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button onClick={() => setMode('login')} className="btn-link">
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
