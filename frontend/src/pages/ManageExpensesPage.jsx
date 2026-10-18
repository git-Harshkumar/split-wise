import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Modal, ConfirmModal } from '../components/Modal';
import { Select } from '../components/Input';

export function ManageExpensesPage() {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadData();
  }, [filterGroup]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expensesData, groupsData] = await Promise.all([
        api.expenses.list(filterGroup || undefined),
        api.groups.list()
      ]);
      setExpenses(expensesData);
      setGroups(groupsData);
    } catch (err) {
      showToast('Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (expense) => {
    setDeleteConfirm(expense);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.expenses.delete(deleteConfirm.id);
      showToast('Expense deleted', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to delete expense', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Manage Expenses</h1>
        <Select
          value={filterGroup}
          onChange={e => setFilterGroup(e.target.value)}
          options={[{ value: '', label: 'All Groups' }, ...groups.map(g => ({ value: g.id, label: g.name }))]}
          style={{ width: 'auto', minWidth: 200 }}
        />
      </div>

      {expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧾</div>
          <h3 className="empty-state-title">No expenses recorded yet</h3>
          <p style={{ marginBottom: 16 }}>Add your first expense to get started</p>
          <a href="/add-expense" className="btn btn-primary">Add Expense</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {expenses.map(expense => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onDelete={handleDelete}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message={`Delete "${deleteConfirm?.description}" (${deleteConfirm?.amount})? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

function ExpenseCard({ expense, onDelete, formatDate, formatCurrency }) {
  const participantNames = expense.participants?.map(p => p.name).join(', ') || '—';

  return (
    <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{expense.description}</h3>
          <span className="badge badge-blue" style={{ fontSize: '11px' }}>{formatCurrency(expense.amount)}</span>
          {expense.group_name_snapshot && (
            <span className="badge badge-green" style={{ fontSize: '11px' }}>{expense.group_name_snapshot}</span>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '13px', color: 'var(--color-text-muted)' }}>
          <span><strong>Paid by:</strong> {expense.payer?.name}</span>
          <span><strong>Date:</strong> {formatDate(expense.expense_date)}</span>
          <span><strong>Split between:</strong> {participantNames}</span>
        </div>
        {expense.participants && expense.participants.length > 0 && (
          <div style={{ marginTop: 8, fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Shares: {expense.participants.map(p => `${p.name}: ${formatCurrency(p.share)}`).join(', ')}
          </div>
        )}
      </div>
      <button
        className="btn btn-danger btn-sm"
        onClick={() => onDelete(expense)}
        style={{ height: 'fit-content' }}
      >
        Delete
      </button>
    </div>
  );
}