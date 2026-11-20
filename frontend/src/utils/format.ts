export const CURRENCY_SYMBOL = '₹';

export const formatINR = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${CURRENCY_SYMBOL}0`;
  return `${CURRENCY_SYMBOL}${num.toLocaleString('en-IN')}`;
};
