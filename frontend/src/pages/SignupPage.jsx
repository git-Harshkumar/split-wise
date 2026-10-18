import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/Input';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/home';

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!displayName.trim()) newErrors.displayName = 'Display name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await signUp(email, password, displayName);
      showToast('Account created! Please check your email to verify.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      showToast(err.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
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
            Create Account
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Join SplitWise and split expenses fairly</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Display Name"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            error={errors.displayName}
            autoComplete="name"
            autoFocus
            placeholder="Your name"
            disabled={loading}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
            disabled={loading}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            disabled={loading}
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
            disabled={loading}
          />

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: 16 }}
            disabled={loading}
          >
            {loading ? <span className="loading-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" state={{ from: location.state?.from }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}