import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Modal, ConfirmModal } from '../components/Modal';
import { generateIdempotencyKey } from '../api/client';

export function SettleUpPage() {
  const { showToast } = useToast();
  const [balances, setBalances] = useState([]);
  const [simplified, setSimplified] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [settleConfirm, setSettleConfirm] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balancesData, simplifiedData, settlementsData] = await Promise.all([
        api.balances.list(),
        api.balances.simplified(),
        api.settlements.list()
      ]);
      setBalances(balancesData);
      setSimplified(simplifiedData);
      setSettlements(settlementsData);
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = (settlement) => {
    setSettleConfirm(settlement);
  };

  const confirmSettle = async () => {
    if (!settleConfirm) return;
    try {
      const idempotencyKey = await generateIdempotencyKey();
      await api.settlements.create({
        fromPersonId: settleConfirm.fromPersonId,
        toPersonId: settleConfirm.toPersonId,
        amount: parseFloat(settleConfirm.amount.replace(/[₹,]/g, ''))
      }, idempotencyKey);
      showToast('Settlement recorded!', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to record settlement', 'error');
    } finally {
      setSettleConfirm(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const parseCurrency = (str) => parseFloat(str.replace(/[₹,]/g, ''));

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ width: 40, height: 40 }} /></div>;
  }

  const hasBalances = simplified.length > 0;

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 24 }}>Settle Up</h1>

      {simplified.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚖️</div>
          <h3 className="empty-state-title">No outstanding balances</h3>
          <p>Everyone is all settled up!</p>
        </div>
      ) : (
        <>
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              💡 Suggested Payments
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {simplified.map((settlement, index) => (
                <SettlementSuggestionCard
                  key={index}
                  settlement={settlement}
                  onSettle={handleSettle}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              📊 Current Balances
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {balances.map(person => (
                <BalanceCard key={person.personId} person={person} formatCurrency={formatCurrency} />
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              📝 Settlement History
            </h2>
            {settlements.length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}>
                <p style={{ color: 'var(--color-text-muted)' }}>No settlements recorded yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {settlements.map(settlement => (
                  <SettlementHistoryCard key={settlement.id} settlement={settlement} formatCurrency={formatCurrency} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <ConfirmModal
        isOpen={!!settleConfirm}
        onClose={() => setSettleConfirm(null)}
        onConfirm={confirmSettle}
        title="Confirm Settlement"
        message={`${settleConfirm?.fromPersonName} pays ${settleConfirm?.toPersonName} ${settleConfirm?.amount}`}
        confirmText="Record Settlement"
        variant="success"
      />
    </div>
  );
}

function SettlementSuggestionCard({ settlement, onSettle, formatCurrency }) {
  return (
    <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'var(--color-pink-bg)',
          border: '3px solid var(--color-pink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--color-pink)'
        }}>
          {settlement.fromPersonName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>
            {settlement.fromPersonName} owes {settlement.toPersonName}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {settlement.toPersonName} should receive {formatCurrency(settlement.amount)}
          </div>
        </div>
        <span className="badge badge-pink" style={{ fontSize: '12px', marginLeft: 'auto' }}>
          {formatCurrency(settlement.amount)}
        </span>
      </div>
      <button
        className="btn btn-success"
        onClick={() => onSettle(settlement)}
      >
        Settle
      </button>
    </div>
  );
}

function BalanceCard({ person, formatCurrency }) {
  const balance = parseFloat(person.netBalance) || 0;
  const isPositive = balance > 0;
  const isNegative = balance < 0;

  return (
    <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: isPositive ? 'var(--color-green-bg)' : isNegative ? 'var(--color-pink-bg)' : 'var(--color-yellow-bg)',
        border: `3px solid ${isPositive ? 'var(--color-green)' : isNegative ? 'var(--color-pink)' : 'var(--color-yellow)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        fontWeight: 700,
        color: isPositive ? 'var(--color-green)' : isNegative ? 'var(--color-pink)' : 'var(--color-yellow)',
        margin: '0 auto 12px'
      }}>
        {person.personName.charAt(0).toUpperCase()}
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 8 }}>{person.personName}</h3>
      <div style={{
        fontSize: '22px',
        fontWeight: 700,
        fontFamily: 'var(--font-heading)',
        color: isPositive ? 'var(--color-green)' : isNegative ? 'var(--color-pink)' : 'var(--color-text)',
        marginBottom: 4
      }}>
        {isPositive ? '+' : ''}{formatCurrency(person.netBalance)}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
        {isPositive ? 'Gets back' : isNegative ? 'Owes' : 'Settled'}
      </div>
    </div>
  );
}

function SettlementHistoryCard({ settlement, formatCurrency }) {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'var(--color-pink-bg)',
          border: '3px solid var(--color-pink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--color-pink)'
        }}>
          {settlement.from_person?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>
            {settlement.from_person?.name} → {settlement.to_person?.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {formatDate(settlement.settlement_date)}
          </div>
        </div>
      </div>
      <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-pink)' }}>
        {formatCurrency(settlement.amount)}
      </div>
    </div>
  );
}