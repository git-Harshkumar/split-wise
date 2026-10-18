import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Input, Modal, ConfirmModal } from '../components';

export function PeoplePage() {
  const { showToast } = useToast();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    try {
      const data = await api.people.list();
      setPeople(data);
    } catch (err) {
      showToast('Failed to load people', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setNameError('Name is required');
      return;
    }

    setSubmitting(true);
    try {
      const idempotencyKey = await (await import('../api/client')).generateIdempotencyKey();
      await api.people.create(trimmed, idempotencyKey);
      showToast('Friend added!', 'success');
      setShowAddModal(false);
      setNewName('');
      setNameError('');
      loadPeople();
    } catch (err) {
      if (err.message.includes('duplicate') || err.message.includes('already exists')) {
        setNameError('This name already exists');
      } else {
        showToast(err.message || 'Failed to add friend', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (person) => {
    setDeleteConfirm(person);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.people.delete(deleteConfirm.id);
      showToast('Friend removed', 'success');
      loadPeople();
    } catch (err) {
      if (err.status === 409) {
        showToast(err.message, 'error');
      } else {
        showToast('Failed to remove friend', 'error');
      }
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ width: 40, height: 40 }} /></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Friends</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add Friend
        </button>
      </div>

      {people.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3 className="empty-state-title">No friends yet</h3>
          <p style={{ marginBottom: 16 }}>Add friends to start splitting expenses</p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Add First Friend</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {people.map(person => (
            <div key={person.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--color-blue-bg)',
                  border: '3px solid var(--color-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--color-blue)'
                }}>
                  {person.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px' }}>{person.name}</div>
                  {person.name === 'You' && (
                    <span className="badge badge-blue" style={{ fontSize: '11px' }}>You</span>
                  )}
                </div>
              </div>
              {person.name !== 'You' && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(person)}
                  aria-label={`Remove ${person.name}`}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setNewName(''); setNameError(''); }}
        title="Add Friend"
        size="sm"
      >
        <form onSubmit={handleAdd}>
          <Input
            label="Name"
            value={newName}
            onChange={e => { setNewName(e.target.value); setNameError(''); }}
            error={nameError}
            placeholder="Enter friend's name"
            autoFocus
            disabled={submitting}
          />
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="loading-spinner" /> : 'Add Friend'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Remove Friend"
        message={`Are you sure you want to remove "${deleteConfirm?.name}"? This cannot be undone.`}
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
}