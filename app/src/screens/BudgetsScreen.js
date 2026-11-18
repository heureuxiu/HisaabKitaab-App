import React, { useState } from 'react';
import { View, Text, Pressable, Alert, RefreshControl, Modal } from 'react-native';
import { C, T } from '../theme';
import Icon from '../components/Icon';
import { useLedger } from '../lib/ledger';
import { useSheet } from '../sheetContext';
import { EXPENSE_CATS } from '../lib/categories';
import { money, monthTitle, shiftMonth } from '../lib/format';
import { CollapseScroll, CompactBar } from '../components/collapse';
import { TopBar, GlassBtn, HeroCenter, GlassPill, Peek, Sheet, Sec, InfoRow, AmountPrompt, Banner, MonthPicker } from '../components/ui';

function LimitRow({ cat, spent, limit, editMode, onPress }) {
  const pct = limit ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const over = pct >= 100;
  const note = editMode ? 'Tap to change the limit' : spent > limit ? `Over by ${money(spent - limit)}` : over ? 'Limit reached' : `${money(limit - spent)} left`;
  return (
    <Pressable disabled={!editMode} onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={cat.icon} size={22} color={C.ink} strokeWidth={1.6} />
      </View>
      <View style={{ flex: 1, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[T(16, 600, { color: C.ink })]}>{cat.label}</Text>
          <Text style={[T(16, 600, { color: C.ink })]}>{money(spent)} <Text style={[T(16, 500, { color: C.muted })]}>/ {money(limit)}</Text></Text>
        </View>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: C.soft }}>
          <View style={{ width: `${pct}%`, height: 8, borderRadius: 4, backgroundColor: over ? C.orange : C.navy }} />
        </View>
        <Text style={[T(12, over && !editMode ? 600 : 500, { color: over && !editMode ? C.orange : C.muted })]}>{note}</Text>
      </View>
    </Pressable>
  );
}

export default function BudgetsScreen({ navigation }) {
  const L = useLedger();
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState(null); // 'target' | category id
  const [chooser, setChooser] = useState(false);
  const [picker, setPicker] = useState(false);

  const spentOf = (id) => L.summary.byCategory[id] || 0;
  const budgeted = EXPENSE_CATS.filter((c) => (L.budgets[c.id] || 0) > 0);
  const unbudgeted = EXPENSE_CATS.filter((c) => !(L.budgets[c.id] > 0));
  const totalLimit = budgeted.reduce((s, c) => s + L.budgets[c.id], 0);
  const totalSpent = budgeted.reduce((s, c) => s + spentOf(c.id), 0);
  const left = totalLimit - totalSpent;
  const usedPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  async function onSave(n) {
    const which = editing;
    setEditing(null);
    try { if (which === 'target') await L.setTarget(n); else await L.setBudget(which, n); }
    catch (e) { Alert.alert('Could not save', e.message); }
  }
  const editingCat = EXPENSE_CATS.find((c) => c.id === editing);

  return (
    <CollapseScroll h={440}
      refreshControl={<RefreshControl refreshing={L.loading} onRefresh={L.refresh} tintColor="#0A2D8C" progressViewOffset={40} />}
      compact={<CompactBar left={<GlassBtn size={50} icon="back" label="Previous month" onPress={() => L.setMonth(shiftMonth(L.month, -1))} />}
        title={totalLimit > 0 ? `${left >= 0 ? 'Left' : 'Over'} PKR ${money(Math.abs(left))}` : `Spent PKR ${money(L.summary.spent)}`}
        sub={totalLimit > 0 ? `${usedPct}% of ${money(totalLimit)} used` : 'Budgets'}
        right={<GlassBtn size={50} icon="calendar" label="Pick month" onPress={() => setPicker(true)} />} />}
      header={<>
        <TopBar left={<GlassBtn icon="back" label="Previous month" onPress={() => L.setMonth(shiftMonth(L.month, -1))} />}
          title="Budgets" onTitlePress={() => setPicker(true)}
          right={<GlassBtn icon="calendar" label="Pick month" onPress={() => setPicker(true)} />} />
        {totalLimit > 0 ? (
          <HeroCenter label={left >= 0 ? 'Left in budgets' : 'Over budget by'} value={money(Math.abs(left))}
            pill={<GlassPill text={`${usedPct}% of ${money(totalLimit)} used`} icon="budgets" />} />
        ) : (
          <HeroCenter label="Spent this month" value={money(L.summary.spent)} pill={<GlassPill text="Set category limits below" icon="budgets" />} />
        )}
        <Peek left={totalLimit > 0 ? 'Total budget' : monthTitle(L.month)} right={totalLimit > 0 ? `${money(totalSpent)} / ${money(totalLimit)}` : 'No limits yet'} />
      </>}>

      <Sheet top={22} gap={14}>
        {L.error && !L.offline ? <Banner text={L.error} /> : null}
        <Sec title="Monthly limits" right={editMode ? 'Done' : 'Edit'} onRight={() => setEditMode((v) => !v)} />
        <View style={{ gap: 22, marginTop: 6 }}>
          {budgeted.map((c) => <LimitRow key={c.id} cat={c} spent={spentOf(c.id)} limit={L.budgets[c.id]} editMode={editMode} onPress={() => setEditing(c.id)} />)}
          {budgeted.length === 0 ? <Text style={[T(14, 400, { color: C.muted, lineHeight: 20 })]}>No category budgets yet. Add one to see how much you have left in each category.</Text> : null}
        </View>
        {unbudgeted.length > 0 ? (
          <Pressable onPress={() => setChooser(true)} style={{ height: 54, borderRadius: 27, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#B8C2D0', alignItems: 'center', justifyContent: 'center', marginTop: 6 }}>
            <Text style={[T(16, 500, { color: C.ink })]}>Add a category budget</Text>
          </Pressable>
        ) : null}
        <View style={{ marginTop: 6 }}>
          <InfoRow icon="vault" trailing={L.target > 0 ? 'Change' : 'Set'} onPress={() => setEditing('target')}>
            <Text numberOfLines={1} style={[T(16, 500, { color: C.ink })]}>Monthly savings target{L.target > 0 ? `: ${money(L.target)}` : ''}</Text>
          </InfoRow>
        </View>
      </Sheet>

      <MonthPicker visible={picker} value={L.month} onPick={(k) => { L.setMonth(k); setPicker(false); }} onClose={() => setPicker(false)} />

      <Modal visible={chooser} transparent animationType="fade" onRequestClose={() => setChooser(false)}>
        <Pressable onPress={() => setChooser(false)} style={{ flex: 1, backgroundColor: 'rgba(2,21,74,0.5)', justifyContent: 'center', padding: 24 }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: '#FFFFFF', borderRadius: 32, padding: 16, gap: 4 }}>
            <Text style={[T(22, 500, { color: C.ink, letterSpacing: -0.6, marginBottom: 8, marginLeft: 6 })]}>Choose a category</Text>
            {unbudgeted.map((c) => (
              <Pressable key={c.id} onPress={() => { setChooser(false); setEditing(c.id); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 8, paddingHorizontal: 6 }}>
                <View style={{ width: 41, height: 41, borderRadius: 21, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={c.icon} size={20} color={C.tileIcon} strokeWidth={1.5} />
                </View>
                <Text style={[T(18, 500, { color: C.ink, letterSpacing: -0.4 })]}>{c.label}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <AmountPrompt visible={!!editing}
        title={editing === 'target' ? 'Monthly savings target' : `${editingCat?.label ?? ''} budget`}
        hint="Whole rupees. Enter 0 to remove it."
        initial={editing === 'target' ? L.target : L.budgets[editing]}
        onCancel={() => setEditing(null)} onSave={onSave} />
    </CollapseScroll>
  );
}
