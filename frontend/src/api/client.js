import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const apiUrl = import.meta.env.VITE_API_URL || '/api';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const idempotencyKey = options.idempotencyKey;
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = response.status;
    error.details = data.details;
    throw error;
  }

  return data;
}

const ensureArray = (data) => (Array.isArray(data) ? data : []);

export const api = {
  people: {
    list: () => request('/people').then(ensureArray),
    create: (name, idempotencyKey) => request('/people', {
      method: 'POST',
      body: JSON.stringify({ name }),
      idempotencyKey
    }),
    delete: (id) => request(`/people/${id}`, { method: 'DELETE' })
  },
  groups: {
    list: () => request('/groups').then(ensureArray),
    create: (data, idempotencyKey) => request('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
      idempotencyKey
    }),
    update: (id, data) => request(`/groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/groups/${id}`, { method: 'DELETE' })
  },
  expenses: {
    list: (groupId) => request(`/expenses${groupId ? `?groupId=${groupId}` : ''}`).then(ensureArray),
    create: (data, idempotencyKey) => request('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
      idempotencyKey
    }),
    delete: (id) => request(`/expenses/${id}`, { method: 'DELETE' })
  },
  settlements: {
    list: () => request('/settlements').then(ensureArray),
    create: (data, idempotencyKey) => request('/settlements', {
      method: 'POST',
      body: JSON.stringify(data),
      idempotencyKey
    }),
    delete: (id) => request(`/settlements/${id}`, { method: 'DELETE' })
  },
  balances: {
    list: () => request('/balances').then(ensureArray),
    simplified: () => request('/balances/simplified').then(ensureArray),
    whoPaidWhat: () => request('/balances/who-paid-what').then(ensureArray),
    tripInvestment: (groupId) => request(`/balances/trip-investment${groupId ? `?groupId=${groupId}` : ''}`).then(ensureArray),
    whatEachSpent: (groupId) => request(`/balances/what-each-spent${groupId ? `?groupId=${groupId}` : ''}`).then(ensureArray)
  },
  settings: {
    getProfile: () => request('/settings/profile'),
    updateProfile: (displayName) => request('/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify({ displayName })
    }),
    deleteAllData: () => request('/settings/all-data', { method: 'DELETE' }),
    export: () => request('/export'),
    import: (data) => request('/export/import', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
};

export async function generateIdempotencyKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}