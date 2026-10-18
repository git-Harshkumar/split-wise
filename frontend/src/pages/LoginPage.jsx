import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/home';

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await signIn(email, password);
      showToast('Welcome back!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      showToast('Please enter your email', 'error');
      return;
    }
    setForgotLoading(true);
    try {
      const { error } = await (await import('../api/client')).supabase.auth.resetPasswordForEmail(forgotEmail);
      if (error) throw error;
      showToast('Password reset email sent!', 'success');
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (err) {
      showToast(err.message || 'Failed to send reset email', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - var(--header-height))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--color-blue)',
            marginBottom: 8
          }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Sign in to your SplitWise account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            autoFocus
            disabled={loading}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
            disabled={loading}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setForgotEmail(email); setShowForgotModal(true); }}
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: 16 }}
            disabled={loading}
          >
            {loading ? <span className="loading-spinner" /> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" state={{ from: location.state?.from }}>
            Sign up
          </Link>
        </p>
      </div>

      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Reset Password"
        size="sm"
      >
        <form onSubmit={handleForgotPassword}>
          <p style={{ marginBottom: 16, color: 'var(--color-text-muted)' }}>
            Enter your email and we'll send you a link to reset your password.
          </p>
          <Input
            label="Email"
            type="email"
            value={forgotEmail}
            onChange={e => setForgotEmail(e.target.value)}
            autoComplete="email"
            autoFocus
            disabled={forgotLoading}
          />
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForgotModal(false)} disabled={forgotLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
              {forgotLoading ? <span className="loading-spinner" /> : 'Send Reset Link'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}