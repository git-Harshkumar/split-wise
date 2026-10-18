import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input, Modal, ConfirmModal } from '../components';

export function SettingsPage() {
  const { user, updateDisplayName } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');

  const [clearConfirm, setClearConfirm] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await api.settings.getProfile();
      setDisplayName(profile.display_name || '');
    } catch (err) {
      showToast('Failed to load profile', 'error');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setProfileLoading(true);
    try {
      await api.settings.updateProfile(displayName.trim());
      await updateDisplayName(displayName.trim());
      showToast('Display name updated!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const data = await api.settings.export();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `splitwise-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup exported!', 'success');
    } catch (err) {
      showToast('Failed to export', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importJson.trim()) {
      setImportError('Please paste JSON data');
      return;
    }

    setImportLoading(true);
    try {
      const data = JSON.parse(importJson);
      await api.settings.import(data);
      showToast('Data imported successfully!', 'success');
      setShowImportModal(false);
      setImportJson('');
      setImportError('');
      window.location.reload();
    } catch (err) {
      if (err instanceof SyntaxError) {
        setImportError('Invalid JSON format');
      } else {
        setImportError(err.message || 'Import failed');
      }
    } finally {
      setImportLoading(false);
    }
  };

  const handleClearAll = async () => {
    setClearLoading(true);
    try {
      await api.settings.deleteAllData();
      showToast('All data cleared!', 'success');
      setClearConfirm(false);
      window.location.reload();
    } catch (err) {
      showToast('Failed to clear data', 'error');
    } finally {
      setClearLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 24 }}>Settings</h1>

      <section className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          👤 Profile
        </h2>
        <form onSubmit={handleProfileUpdate}>
          <Input
            label="Display Name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your name"
            disabled={profileLoading}
          />
          <button type="submit" className="btn btn-primary" disabled={profileLoading}>
            {profileLoading ? <span className="loading-spinner" /> : 'Save Changes'}
          </button>
        </form>
      </section>

      <section className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          💾 Data Backup
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <button className="btn btn-secondary" onClick={handleExport} disabled={exportLoading}>
            {exportLoading ? <span className="loading-spinner" /> : 'Export Backup (JSON)'}
          </button>
          <button className="btn btn-secondary" onClick={() => { setImportError(''); setShowImportModal(true); }}>
            Import Backup
          </button>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Export creates a JSON file with all your people, groups, expenses, and settlements.
          Import will replace all current data with the backup data.
        </p>
      </section>

      <section className="card" style={{ borderColor: 'var(--color-danger)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-danger)' }}>
          🗑️ Danger Zone
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: 16 }}>
          This will permanently delete all your people, groups, expenses, and settlements.
          This action cannot be undone.
        </p>
        <button
          className="btn btn-danger"
          onClick={() => setClearConfirm(true)}
          disabled={clearLoading}
        >
          {clearLoading ? <span className="loading-spinner" /> : 'Clear All Data'}
        </button>
      </section>

      <Modal
        isOpen={showImportModal}
        onClose={() => { setShowImportModal(false); setImportJson(''); setImportError(''); }}
        title="Import Backup"
        size="lg"
      >
        <form onSubmit={handleImport}>
          <p style={{ marginBottom: 16, color: 'var(--color-text-muted)', fontSize: '13px' }}>
            Paste the JSON content from a previously exported backup file.
            <strong style={{ color: 'var(--color-danger)' }}> This will overwrite all current data.</strong>
          </p>
          <textarea
            className="input"
            value={importJson}
            onChange={e => { setImportJson(e.target.value); setImportError(''); }}
            placeholder='{"people":[...],"groups":[...],"expenses":[...],"settlements":[...]}'
            rows={10}
            style={{ fontFamily: 'monospace', fontSize: '12px' }}
            disabled={importLoading}
          />
          {importError && <p className="error-text">{importError}</p>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowImportModal(false)} disabled={importLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-warning" disabled={importLoading}>
              {importLoading ? <span className="loading-spinner" /> : 'Import Data'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={clearConfirm}
        onClose={() => setClearConfirm(false)}
        onConfirm={handleClearAll}
        title="Clear All Data"
        message="Are you absolutely sure? This will delete ALL your people, groups, expenses, and settlements. This cannot be undone."
        confirmText="Yes, Delete Everything"
        variant="danger"
        loading={clearLoading}
      />
    </div>
  );
}