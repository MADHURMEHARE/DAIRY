import { User } from '../types';

export const getActiveCustomerId = (currentUser?: User | null): string => {
  if (currentUser?.customerId) return currentUser.customerId;
  if (currentUser?.id) return currentUser.id;
  try {
    const saved = localStorage.getItem('anandwan_user');
    if (saved) {
      const u = JSON.parse(saved);
      if (u.customerId) return u.customerId;
      if (u.id) return u.id;
    }
  } catch (e) {
    // Ignore error
  }
  return '';
};

export const getInitials = (name: string): string => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};
