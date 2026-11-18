import React, { useEffect, useState } from 'react';
import { View, Text, RefreshControl } from 'react-native';
import { C, T } from '../theme';
import Icon from '../components/Icon';
import { api } from '../lib/api';
import { useLedger } from '../lib/ledger';
import { EXPENSE_CATS } from '../lib/categories';
import { money, monthShort } from '../lib/format';
import { CollapseScroll, CompactBar } from '../components/collapse';
import { useTopExtra, TopBar, GlassBtn, Sheet, Sec, Tile, EmptyHint, MonthPicker } from '../components/ui';
import { Bubbles, MonthBars } from '../components/Charts';

export default function ReportsScreen({ navigation }) {
  const L = useLedger();
  const extra = useTopExtra();
  const [hist, setHist] = useState([]);
  const [picker, setPicker] = useState(false);

  useEffect(() => {
    let live = true;
    api.history(L.month, 6).then((h) => { if (live) setHist(h); }).catch(() => { if (live) setHist([]); });
    return () => { live = false; };
  }, [L.month, L.entries]);

  const cats = EXPENSE_CATS.map((c) => ({ id: c.id, label: c.label, icon: c.icon, value: L.summary.byCategory[c.id] || 0 })).filter((c) => c.value > 0).sort((a, b) => b.value - a.value);
  const months = hist.map((h) => ({ key: h.month, label: monthShort(h.month), value: h.spent }));

  return (
    <CollapseScroll h={560}
      refreshControl={<RefreshControl refreshing={L.loading} onRefresh={L.refresh} tintColor="#0A2D8C" progressViewOffset={40} />}
      compact={<CompactBar left={<GlassBtn size={50} icon="back" label="Back" onPress={() => navigation.navigate('Home')} />}
        title={`Spent PKR ${money(L.summary.spent)}`} sub={`${monthShort(L.month)}${cats[0] ? `  ·  Top: ${cats[0].label}` : ''}`}
        right={<GlassBtn size={50} icon="calendar" label="Pick month" onPress={() => setPicker(true)} />} />}
      header={<>
        {cats.length > 0 ? <Bubbles items={cats} topOffset={extra} /> : (
          <View style={{ position: 'absolute', left: 40, right: 40, top: 230 + extra, alignItems: 'center', gap: 10 }}>
            <Icon name="grid" size={28} color="rgba(255,255,255,0.7)" strokeWidth={1.4} />
            <Text style={[T(17, 400, { color: C.onDark, textAlign: 'center', lineHeight: 24 })]}>No expenses this month yet. Your spending bubbles will appear here.</Text>
          </View>
        )}
        <TopBar left={<GlassBtn icon="back" label="Back" onPress={() => navigation.navigate('Home')} />}
          right={<GlassBtn icon="calendar" label="Pick month" onPress={() => setPicker(true)} />} />
      </>}>

      <Sheet top={22} gap={16}>
        <Sec title="Expenses" right="View all" onRight={() => navigation.navigate('Activity')} />
        <Text numberOfLines={1} adjustsFontSizeToFit style={[T(52, 500, { letterSpacing: -2.6, lineHeight: 56, textAlign: 'center', color: C.ink })]}>
          <Text style={[T(22, 500, { color: C.muted, letterSpacing: -0.4 })]}>PKR </Text>{money(L.summary.spent)}
        </Text>
        {cats.length > 0 ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {cats.slice(0, 2).map((c) => <Tile key={c.id} label={c.label} value={money(c.value)} icon={c.icon} />)}
            {cats.length === 1 ? <View style={{ flex: 1 }} /> : null}
          </View>
        ) : null}
        <Sec title="Last 6 months" />
        {months.some((m) => m.value > 0) ? <MonthBars months={months} /> : <EmptyHint>Add a few expenses to see your trend.</EmptyHint>}
      </Sheet>
      <MonthPicker visible={picker} value={L.month} onPick={(k) => { L.setMonth(k); setPicker(false); }} onClose={() => setPicker(false)} />
    </CollapseScroll>
  );
}
