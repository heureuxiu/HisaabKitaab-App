export const TYPES = [
  { id: 'income', label: 'Income' },
  { id: 'expense', label: 'Expense' },
  { id: 'savings', label: 'Savings' },
];

// ids must match backend/categories.js. fg/tint are the icon-box colours from the design.
export const CATALOG = [
  { id: 'salary', label: 'Salary', short: 'Salary', icon: 'salary', type: 'income', fg: '#0B7A4B', tint: '#E3F5EC' },
  { id: 'freelance', label: 'Freelance', short: 'Freelance', icon: 'freelance', type: 'income', fg: '#0B7A4B', tint: '#E3F5EC' },
  { id: 'business', label: 'Business', short: 'Business', icon: 'business', type: 'income', fg: '#0B7A4B', tint: '#E3F5EC' },
  { id: 'other_in', label: 'Other', short: 'Other', icon: 'dots', type: 'income', fg: '#374151', tint: '#E8ECF1' },
  { id: 'rent', label: 'Rent', short: 'Rent', icon: 'home', type: 'expense', fg: '#5B21B6', tint: '#EDE9FE' },
  { id: 'food', label: 'Food & groceries', short: 'Food', icon: 'food', type: 'expense', fg: '#92400E', tint: '#FEF3C7' },
  { id: 'bills', label: 'Bills & utilities', short: 'Bills', icon: 'bills', type: 'expense', fg: '#075985', tint: '#E0F2FE' },
  { id: 'transport', label: 'Transport', short: 'Transport', icon: 'transport', type: 'expense', fg: '#115E59', tint: '#CCFBF1' },
  { id: 'other', label: 'Other', short: 'Other', icon: 'dots', type: 'expense', fg: '#374151', tint: '#E8ECF1' },
  { id: 'sav_monthly', label: 'Monthly savings', short: 'Monthly', icon: 'vault', type: 'savings', fg: '#2158D6', tint: '#E6EDFB' },
  { id: 'sav_emergency', label: 'Emergency fund', short: 'Emergency', icon: 'shield', type: 'savings', fg: '#2158D6', tint: '#E6EDFB' },
  { id: 'sav_goal', label: 'Goal', short: 'Goal', icon: 'goal', type: 'savings', fg: '#2158D6', tint: '#E6EDFB' },
];

export const catById = (id) => CATALOG.find((c) => c.id === id) ?? CATALOG[8];
export const catsFor = (type) => CATALOG.filter((c) => c.type === type);
export const EXPENSE_CATS = catsFor('expense');
export const TYPE_LABEL = { income: 'Income', expense: 'Expense', savings: 'Savings' };

/** Second line under an entry: "Income", "Savings", or the expense category name. */
export const subLabel = (entry) => (entry.type === 'expense' ? catById(entry.category).label : TYPE_LABEL[entry.type]);
