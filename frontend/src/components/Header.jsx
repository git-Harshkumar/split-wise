import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export function Header({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/groups', label: 'Groups' },
    { path: '/add-expense', label: 'Add Expense' },
    { path: '/manage-expenses', label: 'Manage' },
    { path: '/settle-up', label: 'Settle Up' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--color-white)',
      borderBottom: 'var(--border-width) solid var(--color-border)',
      boxShadow: 'var(--shadow-offset)',
      height: 'var(--header-height)',
    }}>
      <div className="container" style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '0 16px',
      }}>
        {/* Left: hamburger + logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onMenuClick}
            aria-label="Open menu"
            id="mobile-menu-btn"
            style={{ display: 'none' }}
          >
            ☰
          </button>
          <Link to="/home" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--color-blue)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
          }}>
            💸 SplitWise
          </Link>
        </div>

        {/* Center: desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }} aria-label="Main navigation">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`btn btn-sm ${location.pathname === item.path ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '7px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: user info */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {user && (
            <span style={{
              fontWeight: 600,
              fontSize: '13px',
              color: 'var(--color-text)',
              maxWidth: 140,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user.user_metadata?.display_name || user.email}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}