import { supabaseAdmin } from '../server.js';
import { parseINRToPaise, formatPaiseToINR } from '../validators/schemas.js';

export async function getExpenses(userId, { groupId } = {}) {
  let query = supabaseAdmin
    .from('expenses')
    .select(`
      *,
      payer:people!expenses_payer_id_fkey ( id, name ),
      participants:expense_participants (
        person_id,
        share_paise,
        person:people ( id, name )
      )
    `)
    .eq('owner_id', userId)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (groupId) {
    query = query.eq('group_id', groupId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map(expense => ({
    ...expense,
    amount: formatPaiseToINR(expense.amount_paise),
    participants: expense.participants?.map(p => ({
      ...p.person,
      share: formatPaiseToINR(p.share_paise)
    })) || []
  }));
}

export async function createExpense(userId, { description, amount, payerId, groupId, participantIds, expenseDate }) {
  const amountPaise = parseINRToPaise(amount);
  const date = expenseDate || new Date().toISOString().split('T')[0];

  const { data, error } = await supabaseAdmin.rpc('create_expense_with_participants', {
    p_owner_id: userId,
    p_description: description,
    p_amount_paise: amountPaise,
    p_payer_id: payerId,
    p_group_id: groupId,
    p_expense_date: date,
    p_participant_ids: participantIds
  });

  if (error) throw error;

  return getExpenseById(userId, data);
}

export async function getExpenseById(userId, expenseId) {
  const { data, error } = await supabaseAdmin
    .from('expenses')
    .select(`
      *,
      payer:people!expenses_payer_id_fkey ( id, name ),
      participants:expense_participants (
        person_id,
        share_paise,
        person:people ( id, name )
      )
    `)
    .eq('owner_id', userId)
    .eq('id', expenseId)
    .single();

  if (error) throw error;

  return {
    ...data,
    amount: formatPaiseToINR(data.amount_paise),
    participants: data.participants?.map(p => ({
      ...p.person,
      share: formatPaiseToINR(p.share_paise)
    })) || []
  };
}

export async function deleteExpense(userId, expenseId) {
  const { error } = await supabaseAdmin
    .from('expenses')
    .delete()
    .eq('owner_id', userId)
    .eq('id', expenseId);

  if (error) throw error;
}

export async function getExpensesForPerson(userId, personId) {
  const { data, error } = await supabaseAdmin
    .from('expenses')
    .select(`
      *,
      payer:people!expenses_payer_id_fkey ( id, name ),
      participants:expense_participants (
        person_id,
        share_paise,
        person:people ( id, name )
      )
    `)
    .eq('owner_id', userId)
    .eq('payer_id', personId)
    .order('expense_date', { ascending: false });

  if (error) throw error;

  return (data || []).map(expense => ({
    ...expense,
    amount: formatPaiseToINR(expense.amount_paise),
    participants: expense.participants?.map(p => ({
      ...p.person,
      share: formatPaiseToINR(p.share_paise)
    })) || []
  }));
}

export async function getExpensesByGroup(userId, groupId) {
  return getExpenses(userId, { groupId });
}