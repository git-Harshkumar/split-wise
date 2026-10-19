import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const BOTTOM_NAV = [
  { path: '/home', label: 'Home', icon: '🏠' },
  { path: '/people', label: 'Friends', icon: '👤' },
  { path: '/add-expense', label: 'Add', icon: '➕' },
  { path: '/settle-up', label: 'Settle', icon: '⚖️' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main
          style={{
            flex: 1,
            marginLeft: 'var(--sidebar-width)',
            minHeight: 'calc(100vh - var(--header-height))',
            padding: '24px 16px',
          }}
          role="main"
        >
          <div className="container">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {BOTTOM_NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}