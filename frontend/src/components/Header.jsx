import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export function Header({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/groups', label: 'Groups' },
    { path: '/add-expense', label: 'Add Expense' },
    { path: '/manage-expenses', label: 'Manage Expenses' },
    { path: '/settle-up', label: 'Settle Up' },
    { path: '/settings', label: 'Settings' }
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--color-white)',
      borderBottom: 'var(--border-width) solid var(--color-border)',
      boxShadow: 'var(--shadow-offset)',
      height: 'var(--header-height)'
    }}>
      <div className="container" style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onMenuClick}
            aria-label="Toggle menu"
            style={{ display: 'none' }}
            id="mobile-menu-btn"
          >
            ☰
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to="/home" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--color-blue)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              💸 SplitWise
            </Link>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Fair Splits. Friendlier Moments.
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }} aria-label="Main navigation">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`btn btn-sm ${location.pathname === item.path ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <span style={{
              fontWeight: 600,
              fontSize: '14px',
              color: 'var(--color-text)'
            }}>
              {user.user_metadata?.display_name || user.email}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}