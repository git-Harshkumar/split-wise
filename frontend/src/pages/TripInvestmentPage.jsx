import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Select } from '../components/Input';

export function TripInvestmentPage() {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedGroup]);

  const loadGroups = async () => {
    try {
      const groupsData = await api.groups.list();
      setGroups(groupsData);
    } catch (err) {
      showToast('Failed to load groups', 'error');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.balances.tripInvestment(selectedGroup || undefined);
      setData(result);
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const totalPaid = data.reduce((sum, p) => sum + parseFloat(p.amountPaid.replace(/[₹,]/g, '')), 0);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ width: 40, height: 40 }} /></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Trip Investment</h1>
        <Select
          value={selectedGroup}
          onChange={e => setSelectedGroup(e.target.value)}
          options={[{ value: '', label: 'All Expenses' }, ...groups.map(g => ({ value: g.id, label: g.name }))]}
          style={{ width: 'auto', minWidth: 200 }}
        />
      </div>

      {data.length === 0 || data.every(p => parseFloat(p.amountPaid.replace(/[₹,]/g, '')) === 0) ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3 className="empty-state-title">No investment data</h3>
          <p>Add expenses to see trip investment breakdown</p>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 24, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Total Trip Amount</h3>
              <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-blue)' }}>
                {formatCurrency(totalPaid)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.map((person, index) => {
              const amount = parseFloat(person.amountPaid.replace(/[₹,]/g, ''));
              const percentage = parseFloat(person.percentage);
              return (
                <InvestmentCard
                  key={person.personId}
                  person={person}
                  amount={amount}
                  percentage={percentage}
                  index={index}
                  formatCurrency={formatCurrency}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function InvestmentCard({ person, amount, percentage, index, formatCurrency }) {
  const colors = ['blue', 'green', 'yellow', 'pink', 'lavender'];
  const color = colors[index % colors.length];

  return (
    <div className="card" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center' }}>
      <div style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: `var(--color-${color}-bg)`,
        border: `3px solid var(--color-${color})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        fontWeight: 700,
        color: `var(--color-${color})`
      }}>
        {person.personName.charAt(0).toUpperCase()}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{person.personName}</h3>
          <span className={`badge badge-${color}`} style={{ fontSize: '11px' }}>{percentage}%</span>
        </div>
        <div style={{
          height: 8,
          background: 'var(--color-bg-alt)',
          border: '2px solid var(--color-border)',
          borderRadius: 9999,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${percentage}%`,
            background: `var(--color-${color})`,
            borderRadius: 9999,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
      <div style={{ textAlign: 'right', minWidth: 120 }}>
        <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
          {formatCurrency(amount)}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Paid</div>
      </div>
    </div>
  );
}