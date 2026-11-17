import { EXPENSE_CATS } from './categories';
import { money, monthKey, monthTitle } from './format';

const MILESTONES = [1000000, 500000, 250000, 100000, 50000];
const RANK = { alert: 0, warn: 1, info: 2 };

/**
 * Builds the in-app notification list from numbers the app already has. Pure function, no network.
 *   summary / budgets / target: the current ledger state for `month`
 *   vault: { balance, items } for roughly the last 7 days (or null when offline)
 * Every id is stable, so "read" state survives restarts; an id that changes counts as a new notification.
 */
export function buildAlerts({ now = new Date(), month, summary, budgets = {}, target = 0, vault = null }) {
  const out = [];
  const cur = monthKey(now);
  const day = now.getDate();
  const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = dim - day;

  if (month === cur && summary) {
    const mt = monthTitle(month);

    for (const c of EXPENSE_CATS) {
      const lim = budgets[c.id] || 0;
      if (lim <= 0) continue;
      const sp = (summary.byCategory && summary.byCategory[c.id]) || 0;
      if (sp > lim) {
        out.push({ id: `over:${c.id}:${month}`, tone: 'alert', icon: c.icon, go: 'Budgets', title: `${c.label} is over budget`, body: `You have spent ${money(sp)} of ${money(lim)}. That is ${money(sp - lim)} over.` });
      } else if (sp === lim) {
        out.push({ id: `full:${c.id}:${month}`, tone: 'warn', icon: c.icon, go: 'Budgets', title: `${c.label} limit reached`, body: `All ${money(lim)} of this month's budget is used.` });
      } else if (sp / lim >= 0.8) {
        out.push({ id: `near:${c.id}:${month}`, tone: 'warn', icon: c.icon, go: 'Budgets', title: `${c.label} is at ${Math.round((sp / lim) * 100)}% of its limit`, body: `${money(lim - sp)} left for the rest of ${mt}.` });
      }
    }

    if (summary.remaining < 0) {
      out.push({ id: `neg:${month}`, tone: 'alert', icon: 'warning', go: 'Home', title: 'You are spending more than you have', body: `Remaining is −${money(-summary.remaining)} for ${mt}.` });
    } else if (summary.income > 0 && summary.remaining <= summary.income * 0.1) {
      out.push({ id: `low:${month}`, tone: 'warn', icon: 'wallet', go: 'Home', title: 'Only a little is left this month', body: `PKR ${money(summary.remaining)} remaining of ${money(summary.income)} income.` });
    }

    if (summary.income === 0 && day >= 2) {
      out.push({ id: `noinc:${month}`, tone: 'warn', icon: 'salary', go: 'Home', title: `No income added for ${mt}`, body: 'Add your salary so remaining and budgets stay correct.' });
    }

    if (daysLeft <= 2) {
      out.push({ id: `end:${month}`, tone: 'info', icon: 'calendar', go: 'Home', title: daysLeft === 0 ? 'Last day of the month' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in ${mt}`, body: `PKR ${money(Math.max(0, summary.remaining))} remaining to spend.` });
    }

    if (target > 0) {
      if (summary.saved >= target) {
        out.push({ id: `savdone:${month}`, tone: 'info', icon: 'vault', go: 'Savings', title: 'Savings target reached', body: `You saved ${money(summary.saved)} of ${money(target)} this month.` });
      } else if (summary.saved === 0 && day >= 5) {
        out.push({ id: `savnone:${month}`, tone: 'warn', icon: 'vault', go: 'Savings', title: 'Monthly savings not added yet', body: `Your target is ${money(target)} for ${mt}.` });
      } else if (daysLeft <= 4) {
        out.push({ id: `savgap:${month}`, tone: 'warn', icon: 'vault', go: 'Savings', title: `${money(target - summary.saved)} to reach your savings target`, body: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in ${mt}.` });
      }
    }
  }

  if (vault) {
    for (const it of vault.items || []) {
      if (it.type === 'use') {
        out.push({ id: `use:${it.id}`, tone: 'info', icon: 'arrowOut', go: 'Savings', title: `${money(it.amount)} taken out of savings`, body: it.note || 'Used from savings' });
      }
    }
    const m = MILESTONES.find((x) => (vault.balance || 0) >= x);
    if (m) out.push({ id: `mile:${m}`, tone: 'info', icon: 'vault', go: 'Savings', title: `Savings passed ${money(m)}`, body: `Your savings balance is PKR ${money(vault.balance)}.` });
  }

  return out.map((n, i) => ({ n, i })).sort((a, b) => RANK[a.n.tone] - RANK[b.n.tone] || a.i - b.i).map((x) => x.n);
}
