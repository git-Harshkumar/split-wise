import { supabaseAdmin } from '../server.js';
import { parseINRToPaise, formatPaiseToINR } from '../validators/schemas.js';

export async function getSettlements(userId) {
  const { data, error } = await supabaseAdmin
    .from('settlements')
    .select(`
      *,
      from_person:people!settlements_from_person_id_fkey ( id, name ),
      to_person:people!settlements_to_person_id_fkey ( id, name )
    `)
    .eq('owner_id', userId)
    .order('settlement_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(settlement => ({
    ...settlement,
    amount: formatPaiseToINR(settlement.amount_paise)
  }));
}

export async function createSettlement(userId, { fromPersonId, toPersonId, amount, settlementDate }) {
  const amountPaise = parseINRToPaise(amount);
  const date = settlementDate || new Date().toISOString().split('T')[0];

  const { data, error } = await supabaseAdmin
    .from('settlements')
    .insert({
      owner_id: userId,
      from_person_id: fromPersonId,
      to_person_id: toPersonId,
      amount_paise: amountPaise,
      settlement_date: date
    })
    .select(`
      *,
      from_person:people!settlements_from_person_id_fkey ( id, name ),
      to_person:people!settlements_to_person_id_fkey ( id, name )
    `)
    .single();

  if (error) throw error;

  return {
    ...data,
    amount: formatPaiseToINR(data.amount_paise)
  };
}

export async function deleteSettlement(userId, settlementId) {
  const { error } = await supabaseAdmin
    .from('settlements')
    .delete()
    .eq('owner_id', userId)
    .eq('id', settlementId);

  if (error) throw error;
}