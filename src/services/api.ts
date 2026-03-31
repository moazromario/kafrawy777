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

export const fetchAdminStats = async () => {
  const response = await fetch('/api/admin/stats');
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
};
