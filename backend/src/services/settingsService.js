import { supabaseAdmin } from '../server.js';

export async function getProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    await supabaseAdmin.from('profiles').upsert({ id: userId, display_name: 'You' });
    return { display_name: 'You' };
  }
  return data;
}

export async function updateProfile(userId, displayName) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAllUserData(userId) {
  const { error } = await supabaseAdmin.rpc('delete_all_user_data', {
    p_owner_id: userId
  });

  if (error) throw error;
}

export async function exportAllData(userId) {
  const [
    { data: people },
    { data: groups },
    { data: expenses },
    { data: settlements }
  ] = await Promise.all([
    supabaseAdmin.from('people').select('name').eq('owner_id', userId),
    supabaseAdmin.from('groups').select('name, icon').eq('owner_id', userId),
    supabaseAdmin.from('expenses').select('description, amount_paise, payer_id, group_id, expense_date').eq('owner_id', userId),
    supabaseAdmin.from('settlements').select('from_person_id, to_person_id, amount_paise, settlement_date').eq('owner_id', userId)
  ]);

  const { data: groupMembers } = await supabaseAdmin
    .from('group_members')
    .select('group_id, person_id')
    .in('group_id', (groups || []).map(g => g.id));

  const { data: expenseParticipants } = await supabaseAdmin
    .from('expense_participants')
    .select('expense_id, person_id')
    .in('expense_id', (expenses || []).map(e => e.id));

  const peopleMap = new Map((people || []).map((p, i) => [p.name, { id: i, name: p.name }]));
  const groupsMap = new Map((groups || []).map((g, i) => [g.name, { id: i, ...g, memberNames: [] }]));

  for (const gm of groupMembers || []) {
    const group = groupsMap.get(groups.find(g => g.id === gm.group_id)?.name);
    const person = people.find(p => p.id === gm.person_id);
    if (group && person) {
      group.memberNames.push(person.name);
    }
  }

  const expensesExport = (expenses || []).map(e => {
    const payer = people.find(p => p.id === e.payer_id);
    const group = groups.find(g => g.id === e.group_id);
    const participants = (expenseParticipants || [])
      .filter(ep => ep.expense_id === e.id)
      .map(ep => people.find(p => p.id === ep.person_id)?.name)
      .filter(Boolean);

    return {
      description: e.description,
      amount: e.amount_paise / 100,
      payerName: payer?.name,
      groupName: group?.name || null,
      participantNames: participants,
      expenseDate: e.expense_date
    };
  });

  const settlementsExport = (settlements || []).map(s => {
    const from = people.find(p => p.id === s.from_person_id);
    const to = people.find(p => p.id === s.to_person_id);
    return {
      fromPersonName: from?.name,
      toPersonName: to?.name,
      amount: s.amount_paise / 100,
      settlementDate: s.settlement_date
    };
  });

  return {
    people: (people || []).map(p => ({ name: p.name })),
    groups: Array.from(groupsMap.values()).map(g => ({
      name: g.name,
      icon: g.icon,
      memberNames: g.memberNames
    })),
    expenses: expensesExport,
    settlements: settlementsExport
  };
}

export async function importAllData(userId, importData) {
  await supabaseAdmin.rpc('delete_all_user_data', { p_owner_id: userId });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .single();

  const defaultPersonName = profile?.display_name || 'You';

  const createdPeople = new Map();
  for (const p of importData.people || []) {
    const { data } = await supabaseAdmin
      .from('people')
      .insert({ owner_id: userId, name: p.name })
      .select()
      .single();
    if (data) createdPeople.set(p.name, data.id);
  }

  if (!createdPeople.has(defaultPersonName)) {
    const { data } = await supabaseAdmin
      .from('people')
      .insert({ owner_id: userId, name: defaultPersonName })
      .select()
      .single();
    if (data) createdPeople.set(defaultPersonName, data.id);
  }

  const createdGroups = new Map();
  for (const g of importData.groups || []) {
    const { data } = await supabaseAdmin
      .from('groups')
      .insert({ owner_id: userId, name: g.name, icon: g.icon || '👥' })
      .select()
      .single();
    if (data) createdGroups.set(g.name, data.id);
  }

  for (const g of importData.groups || []) {
    const groupId = createdGroups.get(g.name);
    if (!groupId) continue;

    for (const memberName of g.memberNames || []) {
      const personId = createdPeople.get(memberName);
      if (personId) {
        await supabaseAdmin
          .from('group_members')
          .insert({ group_id: groupId, person_id: personId });
      }
    }
  }

  for (const e of importData.expenses || []) {
    const payerId = createdPeople.get(e.payerName);
    const groupId = e.groupName ? createdGroups.get(e.groupName) : null;
    const participantIds = (e.participantNames || [])
      .map(name => createdPeople.get(name))
      .filter(Boolean);

    if (!payerId || participantIds.length === 0) continue;

    await supabaseAdmin.rpc('create_expense_with_participants', {
      p_owner_id: userId,
      p_description: e.description,
      p_amount_paise: Math.round(e.amount * 100),
      p_payer_id: payerId,
      p_group_id: groupId,
      p_expense_date: e.expenseDate,
      p_participant_ids: participantIds
    });
  }

  for (const s of importData.settlements || []) {
    const fromId = createdPeople.get(s.fromPersonName);
    const toId = createdPeople.get(s.toPersonName);

    if (fromId && toId && fromId !== toId) {
      await supabaseAdmin
        .from('settlements')
        .insert({
          owner_id: userId,
          from_person_id: fromId,
          to_person_id: toId,
          amount_paise: Math.round(s.amount * 100),
          settlement_date: s.settlementDate
        });
    }
  }

  return { success: true };
}