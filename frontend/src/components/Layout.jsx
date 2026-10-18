import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

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
            padding: '24px 16px'
          }}
          role="main"
        >
          <div className="container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}