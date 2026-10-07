// ✅ Currency formatter for LKR
export const formatLKR = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rs. 0.00';
  }
  return `Rs. ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatLKRShort = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rs. 0';
  }
  return `Rs. ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};