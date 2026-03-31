// src/services/api.ts

export const fetchBookingItems = async () => {
  const response = await fetch('/api/booking-items');
  if (!response.ok) throw new Error('Failed to fetch items');
  return response.json();
};

export const fetchWalletBalance = async (userId: string) => {
  const response = await fetch(`/api/wallet/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch wallet');
  return response.json();
};

export const depositWallet = async (userId: string, amount: number, transactionRef: string) => {
  const response = await fetch('/api/wallet/deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount, transactionRef })
  });
  if (!response.ok) throw new Error('Deposit failed');
  return response.json();
};

export const createBooking = async (bookingData: any) => {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Booking failed');
  }
  return response.json();
};

// --- Admin API ---
const getAdminHeaders = () => {
  const admin = JSON.parse(localStorage.getItem('admin_user') || '{}');
  return {
    'Content-Type': 'application/json',
    'x-admin-id': admin.id || ''
  };
};

export const adminLogin = async (credentials: any) => {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }
  return res.json();
};

export const fetchAdminStats = async () => {
  const res = await fetch('/api/admin/stats', { headers: getAdminHeaders() });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
};

export const fetchAdminUsers = async () => {
  const res = await fetch('/api/admin/users', { headers: getAdminHeaders() });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

export const updateAdminUser = async (id: string, data: any) => {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
};

export const fetchAdminBookings = async () => {
  const res = await fetch('/api/admin/bookings', { headers: getAdminHeaders() });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
};

export const updateAdminBooking = async (id: string, data: any) => {
  const res = await fetch(`/api/admin/bookings/${id}`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
};

export const fetchAdminPayments = async () => {
  const res = await fetch('/api/admin/payments', { headers: getAdminHeaders() });
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
};

export const updateAdminPayment = async (id: string, data: any) => {
  const res = await fetch(`/api/admin/payments/${id}`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
};

export const fetchAdminItems = async () => {
  const res = await fetch('/api/admin/items', { headers: getAdminHeaders() });
  if (!res.ok) throw new Error('Failed to fetch items');
  return res.json();
};

export const createAdminItem = async (data: any) => {
  const res = await fetch('/api/admin/items', {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Create failed');
  return res.json();
};

export const updateAdminItem = async (id: string, data: any) => {
  const res = await fetch(`/api/admin/items/${id}`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
};

export const fetchAdminSettings = async () => {
  const res = await fetch('/api/admin/settings', { headers: getAdminHeaders() });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
};

export const updateAdminSettings = async (data: any) => {
  const res = await fetch('/api/admin/settings', {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
};

export const fetchAdminAuditLogs = async () => {
  const res = await fetch('/api/admin/audit', { headers: getAdminHeaders() });
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
};
