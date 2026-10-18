import { supabaseAdmin } from '../server.js';
import { formatPaiseToINR } from '../validators/schemas.js';

export async function getBalances(userId) {
  const { data, error } = await supabaseAdmin.rpc('calculate_balances', {
    p_owner_id: userId
  });

  if (error) throw error;

  return (data || []).map(b => ({
    personId: b.person_id,
    personName: b.person_name,
    totalPaid: formatPaiseToINR(b.total_paid),
    totalOwed: formatPaiseToINR(b.total_owed),
    netBalance: formatPaiseToINR(b.net_balance),
    netBalancePaise: b.net_balance
  }));
}

export async function getSimplifiedSettlements(userId) {
  const { data, error } = await supabaseAdmin.rpc('get_simplified_settlements', {
    p_owner_id: userId
  });

  if (error) throw error;

  return (data || []).map(s => ({
    fromPersonId: s.from_person_id,
    fromPersonName: s.from_person_name,
    toPersonId: s.to_person_id,
    toPersonName: s.to_person_name,
    amount: formatPaiseToINR(s.amount_paise),
    amountPaise: s.amount_paise
  }));
}

export async function getWhoPaidWhat(userId) {
  const { data: expenses, error } = await supabaseAdmin
    .from('expenses')
    .select(`
      id,
      description,
      amount_paise,
      expense_date,
      group_name_snapshot,
      payer:people!expenses_payer_id_fkey ( id, name )
    `)
    .eq('owner_id', userId)
    .order('expense_date', { ascending: false });

  if (error) throw error;

  const { data: people, error: peopleError } = await supabaseAdmin
    .from('people')
    .select('id, name')
    .eq('owner_id', userId);

  if (peopleError) throw peopleError;

  const result = (people || []).map(person => {
    const personExpenses = (expenses || []).filter(e => e.payer.id === person.id);
    return {
      personId: person.id,
      personName: person.name,
      totalPaid: formatPaiseToINR(personExpenses.reduce((sum, e) => sum + e.amount_paise, 0)),
      count: personExpenses.length,
      expenses: personExpenses.map(e => ({
        id: e.id,
        description: e.description,
        amount: formatPaiseToINR(e.amount_paise),
        date: e.expense_date,
        group: e.group_name_snapshot
      }))
    };
  });

  return result;
}

export async function getTripInvestment(userId, groupId = null) {
  let expenseQuery = supabaseAdmin
    .from('expenses')
    .select('amount_paise, payer_id')
    .eq('owner_id', userId);

  if (groupId) {
    expenseQuery = expenseQuery.eq('group_id', groupId);
  }

  const { data: expenses, error } = await expenseQuery;

  if (error) throw error;

  const { data: people, error: peopleError } = await supabaseAdmin
    .from('people')
    .select('id, name')
    .eq('owner_id', userId);

  if (peopleError) throw peopleError;

  const totalAmount = (expenses || []).reduce((sum, e) => sum + e.amount_paise, 0);

  return (people || []).map(person => {
    const personExpenses = (expenses || []).filter(e => e.payer_id === person.id);
    const amountPaid = personExpenses.reduce((sum, e) => sum + e.amount_paise, 0);
    return {
      personId: person.id,
      personName: person.name,
      amountPaid: formatPaiseToINR(amountPaid),
      percentage: totalAmount > 0 ? ((amountPaid / totalAmount) * 100).toFixed(1) : '0.0'
    };
  });
}

export async function getWhatEachPersonSpent(userId, groupId = null) {
  let query = supabaseAdmin
    .from('expense_participants')
    .select(`
      share_paise,
      person:people ( id, name ),
      expense:expenses ( id, group_id )
    `)
    .eq('expenses.owner_id', userId);

  if (groupId) {
    query = query.eq('expenses.group_id', groupId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const { data: people, error: peopleError } = await supabaseAdmin
    .from('people')
    .select('id, name')
    .eq('owner_id', userId);

  if (peopleError) throw peopleError;

  const totals = {};
  let grandTotal = 0;

  for (const ep of data || []) {
    const pid = ep.person.id;
    if (!totals[pid]) {
      totals[pid] = { personName: ep.person.name, total: 0 };
    }
    totals[pid].total += ep.share_paise;
    grandTotal += ep.share_paise;
  }

  return (people || []).map(person => {
    const t = totals[person.id] || { total: 0 };
    return {
      personId: person.id,
      personName: person.name,
      amountSpent: formatPaiseToINR(t.total),
      percentage: grandTotal > 0 ? ((t.total / grandTotal) * 100).toFixed(1) : '0.0'
    };
  });
}