import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, RefreshControl, Alert } from 'react-native';
import { C, T } from '../theme';
import Icon from '../components/Icon';
import { api } from '../lib/api';
import { useLedger } from '../lib/ledger';
import { useSheet } from '../sheetContext';
import { money, monthKey, shiftMonth, todayStr, dayShort } from '../lib/format';
import { CollapseScroll, CompactBar } from '../components/collapse';
import { TopBar, GlassBtn, HeroCenter, GlassPill, Peek, Sheet, ActionPill, Seg, Tile, Sec, Row, EmptyHint, Banner } from '../components/ui';
import BalanceChart from '../components/BalanceChart';
import SavingsMoveSheet from './SavingsMoveSheet';

const RANGES = [['m', 'This month'], ['6m', '6 months'], ['all', 'All time']];
const FILTERS = [['all', 'All'], ['add', 'Added'], ['use', 'Used']];
const EMPTY = { balance: 0, start: 0, added: 0, used: 0, items: [] };
const TAG = { month: 'Monthly', manual: 'By hand', use: 'Taken out' };
const INFO = "Savings you add in the monthly flow land here too. Money you take out does not change this month's remaining.";

function fromOf(range) {
  const now = monthKey(new Date());
  if (range === 'm') return `${now}-01`;
  if (range === '6m') return `${shiftMonth(now, -5)}-01`;
  return '';
}

export default function SavingsScreen({ navigation }) {
  const L = useLedger();
  const [range, setRange] = useState('6m');
  const [filt, setFilt] = useState('all');
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [sheet, setSheet] = useState({ visible: false, move: null, type: 'add' });

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await api.vault(fromOf(range))); setError(null); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [range]);

  // L.entries changes when a monthly savings entry is added or edited, so the balance stays in step.
  useEffect(() => { load(); }, [load, L.entries]);

  const rows = [...data.items].filter((i) => filt === 'all' || i.type === filt).reverse();
  const shown = showAll ? rows : rows.slice(0, 8);
  const open = (type, move = null) => setSheet({ visible: true, move, type });

  return (
    <CollapseScroll h={440}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#0A2D8C" progressViewOffset={40} />}
      compact={<CompactBar left={<GlassBtn size={50} icon="back" label="Back" onPress={() => navigation.navigate('Home')} />}
        title={`PKR ${money(data.balance)}`} sub={`Added +${money(data.added)}   Used ${'−'}${money(data.used)}`}
        right={<GlassBtn size={50} icon="info" label="About savings" onPress={() => Alert.alert('Savings', INFO)} />} />}
      header={<>
        <TopBar left={<GlassBtn icon="back" label="Back" onPress={() => navigation.navigate('Home')} />} title="Savings"
          right={<GlassBtn icon="info" label="About savings" onPress={() => Alert.alert('Savings', INFO)} />} />
        <HeroCenter label="Total savings balance" value={money(data.balance)} pill={<GlassPill text="Across all months" icon="vault" />} />
        <Peek left={`Added +${money(data.added)}`} right={`Used −${money(data.used)}`} />
      </>}>

      <Sheet top={22} gap={16}>
        {error ? <Banner text={error} /> : null}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <ActionPill icon="plus" label="Add savings" onPress={() => open('add')} />
          <ActionPill icon="minus" label="Use savings" onPress={() => open('use')} />
        </View>
        <Seg dark={false} options={RANGES} value={range} onChange={(r) => { setRange(r); setShowAll(false); }} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Tile label="Balance at start" value={money(data.start)} />
          <Tile label="Balance now" value={money(data.balance)} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Tile label="Added" value={`+${money(data.added)}`} color={C.blue} />
          <Tile label="Used" value={`−${money(data.used)}`} color={C.orange} />
        </View>

        <Sec title="Balance over time" />
        <BalanceChart start={data.start} items={data.items} from={fromOf(range)} today={todayStr()} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[T(26, 500, { letterSpacing: -1.1, color: C.ink })]}>History</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {FILTERS.map(([id, label]) => {
              const on = filt === id;
              return (
                <Pressable key={id} onPress={() => { setFilt(id); setShowAll(false); }}
                  style={{ height: 34, paddingHorizontal: 14, borderRadius: 17, backgroundColor: on ? '#000' : C.soft, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={[T(13, on ? 600 : 500, { color: on ? '#FFFFFF' : C.ink })]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View>
          {shown.length === 0 ? <EmptyHint>{data.items.length ? 'Nothing here for this filter.' : 'No savings in this period yet. Tap Add savings to start.'}</EmptyHint>
            : shown.map((it) => {
              const add = it.type === 'add';
              return (
                <Row key={it.id} icon={add ? 'down' : 'arrowOut'} title={it.note} sub={`${dayShort(it.date)} · ${TAG[it.kind]}`}
                  amount={`${add ? '+' : '−'}${money(it.amount)}`} color={add ? C.blue : C.orange}
                  onPress={it.source === 'move' ? () => open(it.type, it) : undefined} />
              );
            })}
        </View>
        {rows.length > 8 ? (
          <Pressable onPress={() => setShowAll((v) => !v)} style={{ height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[T(15, 500, { color: C.ink, textDecorationLine: 'underline' })]}>{showAll ? 'Show less' : `Show all ${rows.length}`}</Text>
          </Pressable>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <View style={{ marginTop: 1 }}><Icon name="info" size={18} color={C.muted} strokeWidth={1.6} /></View>
          <Text style={[T(13, 400, { flex: 1, color: C.muted, lineHeight: 19 })]}>{INFO}</Text>
        </View>
      </Sheet>

      <SavingsMoveSheet visible={sheet.visible} move={sheet.move} initialType={sheet.type} balance={data.balance}
        onClose={() => setSheet((s) => ({ ...s, visible: false }))} onSaved={load} />
    </CollapseScroll>
  );
}
