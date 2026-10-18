import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Input, Modal, ConfirmModal } from '../components';

const GROUP_ICONS = ['👥', '🏠', '✈️', '🍕', '🎮', '🎉', '🏖️', '🛍️', '🎓', '💼', '🏥', '🐕'];

export function GroupsPage() {
  const { showToast } = useToast();
  const [groups, setGroups] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const [formData, setFormData] = useState({ name: '', icon: '👥', memberIds: [] });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [groupsData, peopleData] = await Promise.all([
        api.groups.list(),
        api.people.list()
      ]);
      setGroups(groupsData);
      setPeople(peopleData);
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Group name is required';
    if (formData.memberIds.length === 0) newErrors.members = 'Select at least one member';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const idempotencyKey = await (await import('../api/client')).generateIdempotencyKey();
      if (editingGroup) {
        await api.groups.update(editingGroup.id, { ...formData, memberIds: formData.memberIds });
        showToast('Group updated!', 'success');
      } else {
        await api.groups.create(formData, idempotencyKey);
        showToast('Group created!', 'success');
      }
      closeModals();
      loadData();
    } catch (err) {
      if (err.message.includes('duplicate') || err.message.includes('already exists')) {
        setErrors({ name: 'A group with this name already exists' });
      } else {
        showToast(err.message || 'Failed to save group', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({ name: group.name, icon: group.icon, memberIds: group.members?.map(m => m.id) || [] });
    setErrors({});
    setShowEditModal(true);
  };

  const handleDelete = (group) => {
    setDeleteConfirm(group);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.groups.delete(deleteConfirm.id);
      showToast('Group deleted', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to delete group', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingGroup(null);
    setFormData({ name: '', icon: '👥', memberIds: [] });
    setErrors({});
  };

  const toggleExpand = (groupId) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ width: 40, height: 40 }} /></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Groups</h1>
        <button className="btn btn-primary" onClick={() => { setEditingGroup(null); setFormData({ name: '', icon: '👥', memberIds: [] }); setErrors({}); setShowAddModal(true); }}>
          + New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3 className="empty-state-title">No groups yet</h3>
          <p style={{ marginBottom: 16 }}>Create your first group to track shared expenses</p>
          <button className="btn btn-primary" onClick={() => { setEditingGroup(null); setFormData({ name: '', icon: '👥', memberIds: [] }); setErrors({}); setShowAddModal(true); }}>Create Group</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {groups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              expanded={expandedGroup === group.id}
              onToggleExpand={() => toggleExpand(group.id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              people={people}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={closeModals}
        title={editingGroup ? 'Edit Group' : 'New Group'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Group Name"
            value={formData.name}
            onChange={e => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
            error={errors.name}
            placeholder="e.g., Goa Trip"
            autoFocus
            disabled={submitting}
          />
          <div className="form-group">
            <label className="label">Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {GROUP_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  style={{
                    width: 44,
                    height: 44,
                    border: `3px solid ${formData.icon === icon ? 'var(--color-blue)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--border-radius)',
                    background: formData.icon === icon ? 'var(--color-blue-bg)' : 'var(--color-white)',
                    fontSize: '20px',
                    cursor: 'pointer',
                    boxShadow: formData.icon === icon ? 'var(--shadow-offset)' : 'var(--shadow-offset-sm)',
                    transition: 'all var(--transition-fast)'
                  }}
                  aria-pressed={formData.icon === icon}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <fieldset className="form-group" style={{ border: 'none', padding: 0 }}>
            <legend className="label">Members</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {people.map(person => (
                <label
                  key={person.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    border: '3px solid var(--color-border)',
                    borderRadius: 'var(--border-radius)',
                    background: formData.memberIds.includes(person.id) ? 'var(--color-blue-bg)' : 'var(--color-white)',
                    borderColor: formData.memberIds.includes(person.id) ? 'var(--color-blue)' : 'var(--color-border)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    boxShadow: 'var(--shadow-offset-sm)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.memberIds.includes(person.id)}
                    onChange={e => {
                      const newIds = e.target.checked
                        ? [...formData.memberIds, person.id]
                        : formData.memberIds.filter(id => id !== person.id);
                      setFormData({ ...formData, memberIds: newIds });
                      setErrors({ ...errors, members: '' });
                    }}
                    style={{ width: 18, height: 18, accentColor: 'var(--color-blue)' }}
                  />
                  <span style={{ fontWeight: 500 }}>{person.name}</span>
                </label>
              ))}
            </div>
            {errors.members && <p className="error-text">{errors.members}</p>}
            <p style={{ marginTop: 8, fontSize: '13px' }}>
              Want to add more people first? <Link to="/people" style={{ color: 'var(--color-blue)', fontWeight: 600, textDecoration: 'underline' }}>Manage Friends</Link>
            </p>
          </fieldset>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModals} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="loading-spinner" /> : (editingGroup ? 'Save Changes' : 'Create Group')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Group"
        message={`Delete "${deleteConfirm?.name}"? Expenses in this group will keep the group name but won't belong to any group.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

function GroupCard({ group, expanded, onToggleExpand, onEdit, onDelete, people }) {
  const memberNames = group.members?.map(m => m.name).join(', ') || 'No members';
  const displayMembers = expanded && group.members?.length ? group.members : group.members?.slice(0, 3);

  return (
    <div className="card card-hover">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--border-radius)',
            background: 'var(--color-blue-bg)',
            border: '3px solid var(--color-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            {group.icon}
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{group.name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              {group.members?.length || 0} member{group.members?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(group)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(group)}>Delete</button>
        </div>
      </div>

      <button
        className="btn btn-ghost btn-sm"
        onClick={onToggleExpand}
        style={{ width: '100%', justifyContent: 'space-between', padding: '8px 12px' }}
        aria-expanded={expanded}
      >
        <span>{expanded ? 'Hide' : 'Show'} members</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '2px solid var(--color-border)' }}>
          {group.members?.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No members yet</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {group.members.map(member => (
                <span key={member.id} className="badge badge-blue" style={{ fontSize: '12px' }}>
                  {member.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}