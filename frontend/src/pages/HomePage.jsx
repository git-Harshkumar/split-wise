import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    people: 0,
    groups: 0,
    expenses: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [people, groups, expenses, balances] = await Promise.all([
        api.people.list(),
        api.groups.list(),
        api.expenses.list(),
        api.balances.list()
      ]);

      const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

      setStats({
        people: people.length,
        groups: groups.length,
        expenses: expenses.length,
        totalAmount
      });
    } catch (err) {
      showToast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="loading-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  const displayName = user?.user_metadata?.display_name || user?.email || 'Friend';

  return (
    <div>
      <section style={{ marginBottom: 32 }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, var(--color-blue-bg) 0%, var(--color-lavender-bg) 100%)',
          borderColor: 'var(--color-blue)',
          textAlign: 'center',
          padding: '40px 24px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--color-blue)',
            marginBottom: 12
          }}>
            Track. Split. Be Fair.
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'var(--color-text)',
            maxWidth: '500px',
            margin: '0 auto 24px',
            lineHeight: 1.6
          }}>
            Hey {displayName}! Split expenses with friends, track who paid what, and settle up effortlessly.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/people" className="btn btn-primary btn-lg">
              👤 Add Friend
            </Link>
            <Link to="/groups" className="btn btn-secondary btn-lg">
              👥 Create Group
            </Link>
            <Link to="/add-expense" className="btn btn-secondary btn-lg">
              ➕ Add Expense
            </Link>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 700,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          📊 Quick Stats
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16
        }}>
          <Link to="/people" style={{ textDecoration: 'none', color: 'inherit' }}>
            <StatCard icon="👥" label="Friends (Manage)" value={stats.people} color="blue" />
          </Link>
          <Link to="/groups" style={{ textDecoration: 'none', color: 'inherit' }}>
            <StatCard icon="👨‍👩‍👧‍👦" label="Groups" value={stats.groups} color="green" />
          </Link>
          <Link to="/manage-expenses" style={{ textDecoration: 'none', color: 'inherit' }}>
            <StatCard icon="🧾" label="Expenses" value={stats.expenses} color="yellow" />
          </Link>
          <StatCard icon="💰" label="Total Tracked" value={formatCurrency(stats.totalAmount)} color="pink" />
        </div>
      </section>

      <section>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 700,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          🚀 Quick Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16
        }}>
          <ActionCard
            icon="👤"
            title="Friends"
            description="Add and manage friends to split with"
            to="/people"
            color="blue"
          />
          <ActionCard
            icon="➕"
            title="Add Expense"
            description="Record a new expense and split it"
            to="/add-expense"
            color="yellow"
          />
          <ActionCard
            icon="👥"
            title="Manage Groups"
            description="Create and manage your groups"
            to="/groups"
            color="green"
          />
          <ActionCard
            icon="📋"
            title="View Expenses"
            description="See all recorded expenses"
            to="/manage-expenses"
            color="purple"
          />
          <ActionCard
            icon="⚖️"
            title="Settle Up"
            description="View balances and settle debts"
            to="/settle-up"
            color="pink"
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card card-hover" style={{ textAlign: 'center', padding: '24px 16px' }}>
      <div style={{ fontSize: '32px', marginBottom: 8 }}>{icon}</div>
      <div style={{
        fontSize: '28px',
        fontWeight: 700,
        fontFamily: 'var(--font-heading)',
        color: `var(--color-${color})`,
        marginBottom: 4
      }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

function ActionCard({ icon, title, description, to, color }) {
  return (
    <Link to={to} className="card card-hover" style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ fontSize: '28px', marginBottom: 12 }}>{icon}</div>
      <h3 style={{
        fontSize: '16px',
        fontWeight: 700,
        color: `var(--color-${color})`,
        marginBottom: 6
      }}>
        {title}
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
        {description}
      </p>
    </Link>
  );
}