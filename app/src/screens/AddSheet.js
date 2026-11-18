import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { C, T } from '../theme';
import Icon from '../components/Icon';
import DatePicker from '../components/DatePicker';
import Popup, { EntryPreview } from '../components/Popup';
import { catsFor, catById } from '../lib/categories';
import { useLedger } from '../lib/ledger';
import { CollapseScroll, CompactBar } from '../components/collapse';
import { TopBar, GlassBtn, Seg, GlassPill, Sheet, Sec, InfoRow, Cta } from '../components/ui';
import { money, todayStr, dayLong } from '../lib/format';

const TYPE_OPTIONS = [['income', 'Income'], ['savings', 'Savings'], ['expense', 'Expense']];
const SAVE_LABEL = { income: 'Save income', expense: 'Save expense', savings: 'Save to savings' };

/** Big amount typed straight into the hero (design: 60px, dim PKR prefix). */
export function AmountInput({ amount, onChange }) {
  const n = Number(amount) || 0;
  const len = amount ? money(n).length : 1;
  const fs = len <= 7 ? 60 : len <= 9 ? 48 : len <= 11 ? 40 : 34;
  return (
    <View style={{ alignItems: 'center', marginTop: 9 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
        <Text style={[T(Math.round(fs * 0.42), 500, { color: C.onDarkSoft, letterSpacing: -0.5 })]}>PKR</Text>
        <TextInput accessibilityLabel="Amount" value={amount ? money(n) : ''} onChangeText={(t) => onChange(t.replace(/[^0-9]/g, '').slice(0, 10))}
          keyboardType="number-pad" placeholder="0" placeholderTextColor="rgba(255,255,255,0.35)"
          style={[T(fs, 500, { color: '#FFFFFF', letterSpacing: -fs * 0.055, padding: 0, minWidth: 110, textAlign: 'center', height: 70 })]} />
      </View>
    </View>
  );
}

export default function AddSheet({ visible, entry, initialType = 'expense', onClose }) {
  const L = useLedger();
  const [type, setType] = useState(initialType);
  const [category, setCategory] = useState(catsFor(initialType)[0].id);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [pickDate, setPickDate] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [askDiscard, setAskDiscard] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (entry) { setType(entry.type); setCategory(entry.category); setAmount(String(entry.amount)); setDate(entry.date); setNote(entry.note || ''); }
    else { setType(initialType); setCategory(catsFor(initialType)[0].id); setAmount(''); setDate(todayStr()); setNote(''); }
    setBusy(false);
  }, [visible, entry, initialType]);

  const n = Number(amount) || 0;
  const valid = Number.isInteger(n) && n > 0;

  // Remaining after this entry (undo the old effect first when editing)
  const after = useMemo(() => {
    let base = L.summary.remaining;
    if (entry) base += entry.type === 'income' ? -entry.amount : entry.amount;
    return base + (type === 'income' ? n : -n);
  }, [L.summary.remaining, entry, type, n]);

  const pickType = (t) => { setType(t); setCategory(catsFor(t)[0].id); };

  async function onSave() {
    setBusy(true);
    try {
      await L.save({ type, category, amount: n, date, note: note.trim() }, entry?.id);
      onClose();
    } catch (e) { Alert.alert('Could not save', e.message); setBusy(false); }
  }

  const dirty = entry
    ? (type !== entry.type || category !== entry.category || n !== entry.amount || date !== entry.date || note.trim() !== (entry.note || '').trim())
    : (n > 0 || note.trim() !== '');
  const requestClose = () => { if (dirty && !busy) setAskDiscard(true); else onClose(); };

  function onDelete() { setAskDelete(true); }
  async function doDelete() {
    setAskDelete(false);
    try { await L.remove(entry.id); onClose(); } catch (e) { Alert.alert('Could not delete', e.message); }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={requestClose}>
      <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <CollapseScroll h={430}
          compact={<CompactBar left={<GlassBtn size={50} icon="close" label="Close" onPress={requestClose} />}
            title={`PKR ${money(Number(amount) || 0)}`} sub={entry ? 'Edit entry' : 'Add entry'}
            right={<GlassBtn size={50} icon="calendar" label="Pick date" onPress={() => setPickDate(true)} />} />}
          header={<>
            <TopBar left={<GlassBtn icon="close" label="Close" onPress={requestClose} />} title={entry ? 'Edit entry' : 'Add entry'}
              right={<GlassBtn icon="calendar" label="Pick date" onPress={() => setPickDate(true)} />} />
            <View style={{ marginTop: 20 }}><Seg options={TYPE_OPTIONS} value={type} onChange={pickType} /></View>
            <View style={{ marginTop: 26, alignItems: 'center' }}>
              <Text style={[T(19, 400, { color: C.onDark, lineHeight: 24 })]}>Amount</Text>
              <AmountInput amount={amount} onChange={setAmount} />
              <View style={{ marginTop: 11 }}>
                <GlassPill text={`Remaining after this: ${after < 0 ? '−' : ''}${money(Math.abs(after))}`} />
              </View>
            </View>
          </>}>

          <Sheet top={22} gap={16} bottom={28}>
            <Sec title="Category" />
            <View style={{ flexDirection: 'row', marginHorizontal: -4 }}>
              {catsFor(type).map((c) => {
                const on = c.id === category;
                return (
                  <Pressable key={c.id} onPress={() => setCategory(c.id)} style={{ width: '16.666%', alignItems: 'center', gap: 8, paddingHorizontal: 2 }}>
                    <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: on ? '#000' : C.soft, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={c.icon} size={22} color={on ? '#FFFFFF' : C.ink} strokeWidth={1.6} />
                    </View>
                    <Text numberOfLines={1} style={[T(12, on ? 600 : 500, { color: C.ink })]}>{c.short}</Text>
                  </Pressable>
                );
              })}
            </View>
            <InfoRow icon="calendar" trailing="Change" onPress={() => setPickDate(true)}><Text style={[T(16, 500, { color: C.ink })]}>{dayLong(date)}</Text></InfoRow>
            <InfoRow icon="pencil">
              <TextInput value={note} onChangeText={setNote} maxLength={200} placeholder="Add a note (optional)" placeholderTextColor={C.muted} accessibilityLabel="Note"
                style={[T(16, 500, { color: C.ink, padding: 0, height: 44 })]} />
            </InfoRow>
            <Cta label={busy ? 'Saving…' : entry ? 'Save changes' : SAVE_LABEL[type]} disabled={!valid || busy} onPress={onSave}
              icon={entry ? 'trash' : 'arrow'} onIcon={entry ? onDelete : onSave} />
          </Sheet>
        </CollapseScroll>
        {entry && (
          <Popup sheet visible={askDelete} onClose={() => setAskDelete(false)} icon="trash" tone="red" title="Delete this entry?"
            message="This entry will be removed and your balance will be recalculated. This can't be undone."
            actions={[{ label: 'Yes, delete', kind: 'red', onPress: doDelete }, { label: 'Keep it', kind: 'soft', onPress: () => setAskDelete(false) }]}>
            <EntryPreview icon={catById(entry.category).icon} fg={catById(entry.category).fg} tint={catById(entry.category).tint}
              title={catById(entry.category).label} sub={dayLong(entry.date)} amount={`${entry.type === 'income' ? '+' : '-'} PKR ${money(entry.amount)}`} />
          </Popup>
        )}
        <Popup visible={askDiscard} onClose={() => setAskDiscard(false)} icon="pencil" tone="navy" title="Discard changes?"
          message="You have unsaved changes. If you leave now, they'll be lost."
          actions={[{ label: 'Keep editing', kind: 'navy', onPress: () => setAskDiscard(false) }, { label: 'Discard', kind: 'ghostRed', onPress: () => { setAskDiscard(false); onClose(); } }]} />
        <DatePicker visible={pickDate} value={date} onPick={(d) => { setDate(d); setPickDate(false); }} onClose={() => setPickDate(false)} />
      </KeyboardAvoidingView>
    </Modal>
  );
}
