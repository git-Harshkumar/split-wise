import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Input, Select, CheckboxGroup } from '../components/Input';
import { generateIdempotencyKey } from '../api/client';

export function AddExpensePage() {
  const { showToast } = useToast();
  const [people, setPeople] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    payerId: '',
    groupId: '',
    participantIds: [],
    expenseDate: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [peopleData, groupsData] = await Promise.all([
        api.people.list(),
        api.groups.list()
      ]);
      setPeople(peopleData);
      setGroups(groupsData);

      if (peopleData.length > 0) {
        setFormData(prev => ({
          ...prev,
          payerId: prev.payerId || peopleData[0].id,
          participantIds: prev.participantIds.length > 0 ? prev.participantIds : peopleData.map(p => p.id)
        }));
      }
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setFormData(prev => ({
        ...prev,
        groupId,
        participantIds: group.members?.map(m => m.id) || []
      }));
    } else {
      setFormData(prev => ({ ...prev, groupId: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    const amount = parseFloat(formData.amount);
    if (!formData.amount.trim()) newErrors.amount = 'Amount is required';
    else if (isNaN(amount) || amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.payerId) newErrors.payerId = 'Select who paid';
    if (formData.participantIds.length === 0) newErrors.participants = 'Select at least one participant';
    const today = new Date().toISOString().split('T')[0];
    if (formData.expenseDate > today) newErrors.expenseDate = 'Date cannot be in the future';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const idempotencyKey = await generateIdempotencyKey();
      await api.expenses.create({
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        payerId: formData.payerId,
        groupId: formData.groupId || null,
        participantIds: formData.participantIds,
        expenseDate: formData.expenseDate
      }, idempotencyKey);

      showToast('Expense added!', 'success');
      resetForm();
    } catch (err) {
      showToast(err.message || 'Failed to add expense', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      payerId: people[0]?.id || '',
      groupId: '',
      participantIds: [],
      expenseDate: new Date().toISOString().split('T')[0]
    });
    setErrors({});
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ width: 40, height: 40 }} /></div>;
  }

  const payerOptions = people.map(p => ({ value: p.id, label: p.name }));
  const groupOptions = [{ value: '', label: 'No group (personal)' }, ...groups.map(g => ({ value: g.id, label: g.name }))];
  const participantOptions = people.map(p => ({ value: p.id, label: p.name }));

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 24 }}>Add Expense</h1>

      <form onSubmit={handleSubmit} noValidate className="card" style={{ maxWidth: '600px' }}>
        <Input
          label="Description"
          value={formData.description}
          onChange={e => { setFormData({ ...formData, description: e.target.value }); setErrors({ ...errors, description: '' }); }}
          error={errors.description}
          placeholder="e.g., Dinner at restaurant"
          disabled={submitting}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={e => { setFormData({ ...formData, amount: e.target.value }); setErrors({ ...errors, amount: '' }); }}
            error={errors.amount}
            placeholder="0.00"
            disabled={submitting}
          />
          <Input
            label="Date"
            type="date"
            value={formData.expenseDate}
            onChange={e => { setFormData({ ...formData, expenseDate: e.target.value }); setErrors({ ...errors, expenseDate: '' }); }}
            error={errors.expenseDate}
            max={new Date().toISOString().split('T')[0]}
            disabled={submitting}
          />
        </div>

        <Select
          label="Group (optional)"
          value={formData.groupId}
          onChange={e => { handleGroupChange(e.target.value); setErrors({ ...errors, groupId: '' }); }}
          options={groupOptions}
          disabled={submitting}
        />

        <Select
          label="Paid By"
          value={formData.payerId}
          onChange={e => { setFormData({ ...formData, payerId: e.target.value }); setErrors({ ...errors, payerId: '' }); }}
          options={payerOptions}
          placeholder="Select who paid"
          error={errors.payerId}
          disabled={submitting}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: -4 }}>
          <span style={{ fontSize: '14px', fontWeight: 700 }}>Split Between *</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, participantIds: participantOptions.map(o => o.value) })}
              style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-blue)', textDecoration: 'underline' }}
            >
              Select All
            </button>
            <span style={{ color: 'var(--color-border)' }}>|</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, participantIds: [] })}
              style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textDecoration: 'underline' }}
            >
              Clear
            </button>
          </div>
        </div>

        <CheckboxGroup
          name="participants"
          options={participantOptions}
          value={formData.participantIds}
          onChange={ids => { setFormData({ ...formData, participantIds: ids }); setErrors({ ...errors, participants: '' }); }}
          error={errors.participants}
          required
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8, marginBottom: 16 }}>
          <Link to="/people" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-blue)', textDecoration: 'underline' }}>
            + Don't see a friend? Add them here
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
            {submitting ? <span className="loading-spinner" /> : 'Add Expense'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={submitting} style={{ flex: 1 }}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}