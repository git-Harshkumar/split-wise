import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';

export function WhoPaidWhatPage() {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPerson, setSelectedPerson] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await api.balances.whoPaidWhat();
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ width: 40, height: 40 }} /></div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 24 }}>Who Paid What?</h1>

      {data.length === 0 || data.every(p => p.count === 0) ? (
        <div className="empty-state">
          <div className="empty-state-icon">💸</div>
          <h3 className="empty-state-title">No expenses recorded yet</h3>
          <p>Add expenses to see who paid what</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.filter(p => p.count > 0).map(person => (
            <div key={person.personId} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'var(--color-green-bg)',
                    border: '3px solid var(--color-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--color-green)'
                  }}>
                    {person.personName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{person.personName}</h3>
                    <div style={{ display: 'flex', gap: 16, fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      <span><strong>Total Paid:</strong> {formatCurrency(person.totalPaid)}</span>
                      <span><strong>Expenses:</strong> {person.count}</span>
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedPerson(person)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
        title={`What ${selectedPerson?.personName} Paid For`}
        size="lg"
      >
        {selectedPerson?.expenses.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 20 }}>No expenses found</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {selectedPerson.expenses.map(expense => (
              <div key={expense.id} className="card" style={{ marginBottom: 12, padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{expense.description}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span>{formatCurrency(expense.amount)}</span>
                      <span>{expense.date}</span>
                      {expense.group && <span>{expense.group}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}