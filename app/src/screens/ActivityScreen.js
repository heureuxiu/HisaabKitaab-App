import React, { useMemo, useState } from 'react';
import { View, Text, RefreshControl } from 'react-native';
import { C, T } from '../theme';
import { useLedger } from '../lib/ledger';
import { useSheet } from '../sheetContext';
import { catById, subLabel } from '../lib/categories';
import { money, monthTitle, shiftMonth, dayShort } from '../lib/format';
import { CollapseScroll, CompactBar } from '../components/collapse';
import { TopBar, GlassBtn, Seg, Sheet, Row, EmptyHint, Banner, MonthPicker } from '../components/ui';
import { amountText, amountColor } from './HomeScreen';

const FILTERS = [['all', 'All'], ['income', 'Income'], ['savings', 'Savings'], ['expense', 'Expenses']];

export default function ActivityScreen() {
  const L = useLedger();
  const { openEdit } = useSheet();
  const [filter, setFilter] = useState('all');
  const [picker, setPicker] = useState(false);

  const rows = useMemo(() => L.entries.filter((e) => filter === 'all' || e.type === filter), [L.entries, filter]);

  const tot = useMemo(() => {
    let inc = 0, out = 0;
    for (const e of rows) { if (e.type === 'income') inc += e.amount; else out += e.amount; }
    return { inc, out };
  }, [rows]);

  const days = useMemo(() => {
    const map = new Map();
    for (const e of rows) { if (!map.has(e.date)) map.set(e.date, []); map.get(e.date).push(e); }
    return [...map.entries()].map(([date, items]) => ({ date, items }));
  }, [rows]);

  return (
    <CollapseScroll h={330}
      refreshControl={<RefreshControl refreshing={L.loading} onRefresh={L.refresh} tintColor="#0A2D8C" progressViewOffset={40} />}
      compact={<CompactBar left={<GlassBtn size={42} icon="back" label="Previous month" onPress={() => L.setMonth(shiftMonth(L.month, -1))} />}
        title={monthTitle(L.month)} sub={`+${money(tot.inc)}   ${'−'}${money(tot.out)}`}
        right={<GlassBtn size={42} icon="calendar" label="Pick month" onPress={() => setPicker(true)} />} />}
      header={<>
        <TopBar left={<GlassBtn icon="back" label="Previous month" onPress={() => L.setMonth(shiftMonth(L.month, -1))} />}
          title={monthTitle(L.month)} onTitlePress={() => setPicker(true)}
          right={<GlassBtn icon="calendar" label="Pick month" onPress={() => setPicker(true)} />} />
        <View style={{ marginTop: 24 }}><Seg options={FILTERS} value={filter} onChange={setFilter} /></View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 22 }}>
          <View style={{ flex: 1 }}>
            <Text style={[T(13, 400, { color: 'rgba(255,255,255,0.7)' })]}>Money in</Text>
            <Text numberOfLines={1} adjustsFontSizeToFit style={[T(26, 500, { color: '#FFFFFF', letterSpacing: -1 })]}>+{money(tot.inc)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[T(13, 400, { color: 'rgba(255,255,255,0.7)' })]}>Money out</Text>
            <Text numberOfLines={1} adjustsFontSizeToFit style={[T(26, 500, { color: '#FFFFFF', letterSpacing: -1 })]}>{'−'}{money(tot.out)}</Text>
          </View>
        </View>
      </>}>

      <Sheet top={20} gap={10}>
        {L.error && !L.offline ? <Banner text={L.error} /> : null}
        {days.length === 0 ? <EmptyHint>{L.entries.length ? 'Nothing here for this filter.' : `No entries in ${monthTitle(L.month)} yet.`}</EmptyHint>
          : days.map((d) => (
            <View key={d.date} style={{ gap: 10 }}>
              <Text style={[T(14, 500, { color: C.muted, marginTop: 6 })]}>{dayShort(d.date)}</Text>
              <View>
                {d.items.map((e) => (
                  <Row key={e.id} icon={catById(e.category).icon} title={e.note || catById(e.category).label} sub={subLabel(e)}
                    amount={amountText(e)} color={amountColor(e)} onPress={() => openEdit(e)} />
                ))}
              </View>
            </View>
          ))}
      </Sheet>
      <MonthPicker visible={picker} value={L.month} onPick={(k) => { L.setMonth(k); setPicker(false); }} onClose={() => setPicker(false)} />
    </CollapseScroll>
  );
}
