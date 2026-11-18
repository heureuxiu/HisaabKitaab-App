import React from 'react';
import { View, RefreshControl } from 'react-native';
import { C } from '../theme';
import { useLedger } from '../lib/ledger';
import { useSheet } from '../sheetContext';
import { useNotify } from '../lib/notify';
import { catById } from '../lib/categories';
import { money, monthKey, monthShort, relDay } from '../lib/format';
import { CollapseScroll, CompactBar } from '../components/collapse';
import { TopBar, GlassBtn, HeroCenter, GlassPill, Peek, Sheet, ActionPill, RoundBtn, Sec, Row, EmptyHint, Banner } from '../components/ui';

export const amountText = (e) => (e.type === 'income' ? `+${money(e.amount)}` : e.type === 'expense' ? `−${money(e.amount)}` : money(e.amount));
export const amountColor = (e) => (e.type === 'income' ? C.green : e.type === 'savings' ? C.blue : C.ink);

export default function HomeScreen({ navigation }) {
  const L = useLedger();
  const { openAdd, openEdit, openSettings } = useSheet();
  const N = useNotify();
  const s = L.summary;
  const thisMonth = L.month === monthKey(new Date());
  const rem = s.remaining;
  const recent = L.entries.slice(0, 6);

  return (
    <CollapseScroll h={440}
      refreshControl={<RefreshControl refreshing={L.loading} onRefresh={L.refresh} tintColor="#0A2D8C" progressViewOffset={40} />}
      compact={<CompactBar left={<GlassBtn size={50} icon="user" label="Account" onPress={openSettings} />}
        title={`PKR ${rem < 0 ? '−' : ''}${money(Math.abs(rem))}`} sub={thisMonth ? 'Remaining this month' : `Remaining in ${monthShort(L.month)}`}
        right={<GlassBtn size={50} icon="bell" label="Notifications" dot={N.unreadCount > 0} onPress={N.open} />} />}
      header={<>
        <TopBar left={<GlassBtn icon="user" label="Account" onPress={openSettings} />}
          right={<GlassBtn icon="bell" label={N.unreadCount ? `Notifications, ${N.unreadCount} new` : 'Notifications'} dot={N.unreadCount > 0} onPress={N.open} />} />
        <HeroCenter label={thisMonth ? 'Remaining this month' : `Remaining in ${monthShort(L.month)}`}
          value={`${rem < 0 ? '−' : ''}${money(Math.abs(rem))}`}
          pill={<GlassPill text={`${money(s.spent)} spent of ${money(s.income)}`} icon="down" />} />
        <Peek left={L.target > 0 ? 'Savings goal' : 'Set a savings goal'} right={L.target > 0 ? `${money(s.saved)} / ${money(L.target)}` : 'Tap to set'}
          onPress={() => navigation.navigate('Budgets')} />
      </>}>

      <Sheet top={12} gap={0} bottom={140}>
        {L.offline ? <Banner text="Offline. Showing the last saved numbers." onPress={openSettings} />
          : L.error ? <Banner text={L.error} onPress={openSettings} /> : null}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: L.error ? 12 : 0 }}>
          <ActionPill icon="arrowOut" label="Income" onPress={() => openAdd('income')} />
          <View style={{ flex: 0 }}><RoundBtn icon="vault" label="Add savings" onPress={() => openAdd('savings')} /></View>
          <ActionPill icon="down" label="Expense" onPress={() => openAdd('expense')} />
        </View>
        <View style={{ marginTop: 22 }}><Sec title="Recent Activity" right="View All" onRight={() => navigation.navigate('Activity')} /></View>
        <View style={{ marginTop: 6 }}>
          {recent.length === 0 ? <EmptyHint>Nothing here yet. Tap Income, Expense or the savings button to add your first entry.</EmptyHint>
            : recent.map((e) => (
              <Row key={e.id} icon={catById(e.category).icon} title={e.note || catById(e.category).label} sub={relDay(e.date)}
                amount={amountText(e)} color={amountColor(e)} onPress={() => openEdit(e)} />
            ))}
        </View>
      </Sheet>
    </CollapseScroll>
  );
}
