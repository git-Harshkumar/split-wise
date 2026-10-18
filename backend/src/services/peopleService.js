import { supabaseAdmin } from '../server.js';

export async function getPeople(userId) {
  const { data, error } = await supabaseAdmin
    .from('people')
    .select('*')
    .eq('owner_id', userId)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createPerson(userId, name) {
  const { data, error } = await supabaseAdmin
    .from('people')
    .insert({ owner_id: userId, name })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      const err = new Error('Person with this name already exists');
      err.code = '23505';
      throw err;
    }
    throw error;
  }
  return data;
}

export async function deletePerson(userId, personId) {
  const { error } = await supabaseAdmin
    .from('people')
    .delete()
    .eq('owner_id', userId)
    .eq('id', personId);

  if (error) throw error;
}

export async function checkPersonInUse(userId, personId) {
  const { data: expenses, error: expError } = await supabaseAdmin
    .from('expenses')
    .select('id')
    .eq('owner_id', userId)
    .or(`payer_id.eq.${personId}`)
    .limit(1);

  if (expError) throw expError;
  if (expenses && expenses.length > 0) {
    const err = new Error('Cannot delete person: they appear in expenses');
    err.message = 'Cannot delete person: they appear in expenses';
    throw err;
  }

  const { data: participants, error: partError } = await supabaseAdmin
    .from('expense_participants')
    .select('expense_id')
    .eq('person_id', personId)
    .limit(1);

  if (partError) throw partError;
  if (participants && participants.length > 0) {
    const err = new Error('Cannot delete person: they appear in expenses');
    err.message = 'Cannot delete person: they appear in expenses';
    throw err;
  }

  const { data: settlements, error: setError } = await supabaseAdmin
    .from('settlements')
    .select('id')
    .eq('owner_id', userId)
    .or(`from_person_id.eq.${personId},to_person_id.eq.${personId}`)
    .limit(1);

  if (setError) throw setError;
  if (settlements && settlements.length > 0) {
    const err = new Error('Cannot delete person: they appear in settlements');
    err.message = 'Cannot delete person: they appear in settlements';
    throw err;
  }
}