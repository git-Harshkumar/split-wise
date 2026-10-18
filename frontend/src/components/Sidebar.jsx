import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/people', label: 'Friends', icon: '👤' },
    { path: '/groups', label: 'Groups', icon: '👥' },
    { path: '/add-expense', label: 'Add Expense', icon: '➕' },
    { path: '/manage-expenses', label: 'Manage Expenses', icon: '📋' },
    { path: '/settle-up', label: 'Settle Up', icon: '⚖️' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div
            className="modal-overlay"
            onClick={onClose}
            style={{ background: 'transparent', zIndex: 40 }}
            aria-hidden="true"
          />
        )}
        <aside
          className={`sidebar ${isOpen ? 'open' : ''}`}
          style={{
            position: 'fixed',
            left: 0,
            top: 'var(--header-height)',
            bottom: 0,
            width: 'var(--sidebar-width)',
            maxWidth: '300px',
            background: 'var(--color-white)',
            borderRight: 'var(--border-width) solid var(--color-border)',
            boxShadow: 'var(--shadow-offset)',
            zIndex: 50,
            transform: `translateX(${isOpen ? '0' : '-100%'})`,
            transition: 'transform 0.2s ease',
            overflowY: 'auto',
            padding: '20px 16px'
          }}
          aria-label="Navigation"
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`btn ${location.pathname === item.path ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  justifyContent: 'flex-start',
                  gap: 12,
                  textAlign: 'left'
                }}
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

  return (
    <aside
      className="sidebar"
      style={{
        position: 'fixed',
        left: 0,
        top: 'var(--header-height)',
        bottom: 0,
        width: 'var(--sidebar-width)',
        background: 'var(--color-white)',
        borderRight: 'var(--border-width) solid var(--color-border)',
        padding: '20px 16px',
        overflowY: 'auto'
      }}
      aria-label="Navigation"
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`btn ${location.pathname === item.path ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              justifyContent: 'flex-start',
              gap: 12,
              textAlign: 'left'
            }}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}