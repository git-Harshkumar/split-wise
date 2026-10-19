import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 769);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close drawer on route change (mobile)
  useEffect(() => {
    if (isMobile) onClose();
  }, [location.pathname]);

  const navItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/people', label: 'Friends', icon: '👤' },
    { path: '/groups', label: 'Groups', icon: '👥' },
    { path: '/add-expense', label: 'Add Expense', icon: '➕' },
    { path: '/manage-expenses', label: 'Manage Expenses', icon: '📋' },
    { path: '/settle-up', label: 'Settle Up', icon: '⚖️' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const sidebarStyle = {
    position: 'fixed',
    left: 0,
    top: 'var(--header-height)',
    bottom: 0,
    width: '260px',
    background: 'var(--color-white)',
    borderRight: 'var(--border-width) solid var(--color-border)',
    padding: '20px 16px',
    overflowY: 'auto',
    zIndex: 50,
  };

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 49,
            }}
            aria-hidden="true"
          />
        )}
        {/* Drawer */}
        <aside
          style={{
            ...sidebarStyle,
            transform: `translateX(${isOpen ? '0' : '-100%'})`,
            transition: 'transform 0.25s ease',
            boxShadow: isOpen ? 'var(--shadow-offset)' : 'none',
          }}
          aria-label="Navigation"
          aria-hidden={!isOpen}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`btn ${location.pathname === item.path ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'flex-start', gap: 12 }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside style={sidebarStyle} aria-label="Navigation">
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`btn ${location.pathname === item.path ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', gap: 12 }}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}