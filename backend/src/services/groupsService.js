import { supabaseAdmin } from '../server.js';

export async function getGroups(userId) {
  const { data, error } = await supabaseAdmin
    .from('groups')
    .select(`
      *,
      group_members (
        person_id,
        people ( id, name )
      )
    `)
    .eq('owner_id', userId)
    .order('name');

  if (error) throw error;

  return (data || []).map(group => ({
    ...group,
    members: group.group_members?.map(gm => gm.people).filter(Boolean) || []
  }));
}

export async function createGroup(userId, { name, icon, memberIds }) {
  const { data: group, error: groupError } = await supabaseAdmin
    .from('groups')
    .insert({ owner_id: userId, name, icon })
    .select()
    .single();

  if (groupError) {
    if (groupError.code === '23505') {
      const err = new Error('Group with this name already exists');
      err.code = '23505';
      throw err;
    }
    throw groupError;
  }

  if (memberIds.length > 0) {
    const members = memberIds.map(personId => ({
      group_id: group.id,
      person_id: personId
    }));

    const { error: memberError } = await supabaseAdmin
      .from('group_members')
      .insert(members);

    if (memberError) throw memberError;
  }

  return { ...group, members: memberIds };
}

export async function updateGroup(userId, groupId, updates) {
  const { name, icon, memberIds } = updates;

  if (name || icon) {
    const { error } = await supabaseAdmin
      .from('groups')
      .update({ name, icon })
      .eq('owner_id', userId)
      .eq('id', groupId);

    if (error) {
      if (error.code === '23505') {
        const err = new Error('Group with this name already exists');
        err.code = '23505';
        throw err;
      }
      throw error;
    }
  }

  if (memberIds !== undefined) {
    const { error: deleteError } = await supabaseAdmin
      .from('group_members')
      .delete()
      .eq('group_id', groupId);

    if (deleteError) throw deleteError;

    if (memberIds.length > 0) {
      const members = memberIds.map(personId => ({
        group_id: groupId,
        person_id: personId
      }));

      const { error: insertError } = await supabaseAdmin
        .from('group_members')
        .insert(members);

      if (insertError) throw insertError;
    }
  }

  return getGroupById(userId, groupId);
}

export async function getGroupById(userId, groupId) {
  const { data, error } = await supabaseAdmin
    .from('groups')
    .select(`
      *,
      group_members (
        person_id,
        people ( id, name )
      )
    `)
    .eq('owner_id', userId)
    .eq('id', groupId)
    .single();

  if (error) throw error;

  return {
    ...data,
    members: data.group_members?.map(gm => gm.people).filter(Boolean) || []
  };
}

export async function deleteGroup(userId, groupId) {
  const { error } = await supabaseAdmin
    .from('groups')
    .delete()
    .eq('owner_id', userId)
    .eq('id', groupId);

  if (error) throw error;
}

export async function getGroupMembers(userId, groupId) {
  const { data, error } = await supabaseAdmin
    .from('group_members')
    .select('person_id, people ( id, name )')
    .eq('group_id', groupId);

  if (error) throw error;

  return (data || []).map(gm => gm.people).filter(Boolean);
}