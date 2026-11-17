import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { C, T } from '../theme';
import Icon from '../components/Icon';
import DatePicker from '../components/DatePicker';
import Popup, { EntryPreview } from '../components/Popup';
import { api } from '../lib/api';
import { CollapseScroll, CompactBar } from '../components/collapse';
import { TopBar, GlassBtn, Seg, GlassPill, Sheet, InfoRow, Cta } from '../components/ui';
import { AmountInput } from './AddSheet';
import { money, todayStr, dayLong } from '../lib/format';

const OPTIONS = [['add', 'Add to savings'], ['use', 'Use from savings']];

/** Add to savings / use from savings. Pass `move` to edit or delete an existing one. */
export default function SavingsMoveSheet({ visible, move, initialType = 'add', balance, onClose, onSaved }) {
  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [pickDate, setPickDate] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [askDiscard, setAskDiscard] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (move) { setType(move.type); setAmount(String(move.amount)); setDate(move.date); setNote(move.note || ''); }
    else { setType(initialType); setAmount(''); setDate(todayStr()); setNote(''); }
    setBusy(false);
  }, [visible, move, initialType]);

  const isAdd = type === 'add';
  const n = Number(amount) || 0;
  const available = useMemo(() => (move ? balance - (move.type === 'add' ? move.amount : -move.amount) : balance), [balance, move]);
  const after = available + (isAdd ? n : -n);
  const tooMuch = !isAdd && n > available;
  const valid = Number.isInteger(n) && n > 0 && !tooMuch;

  async function onSave() {
    setBusy(true);
    const body = { type, amount: n, date, note: note.trim() };
    try {
      if (move) await api.updateMove(move.moveId, body); else await api.addMove(body);
      onSaved();
      onClose();
    } catch (e) { Alert.alert('Could not save', e.message); setBusy(false); }
  }

  const dirty = move
    ? (type !== move.type || n !== move.amount || date !== move.date || note.trim() !== (move.note || '').trim())
    : (n > 0 || note.trim() !== '');
  const requestClose = () => { if (dirty && !busy) setAskDiscard(true); else onClose(); };

  function onDelete() { setAskDelete(true); }
  async function doDelete() {
    setAskDelete(false);
    try { await api.deleteMove(move.moveId); onSaved(); onClose(); } catch (e) { Alert.alert('Could not delete', e.message); }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={requestClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <CollapseScroll h={430}
          compact={<CompactBar left={<GlassBtn size={42} icon="close" label="Close" onPress={requestClose} />}
            title={`PKR ${money(Number(amount) || 0)}`} sub={move ? 'Edit savings entry' : isAdd ? 'Add savings' : 'Use savings'}
            right={<GlassBtn size={42} icon="calendar" label="Pick date" onPress={() => setPickDate(true)} />} />}
          header={<>
            <TopBar left={<GlassBtn icon="close" label="Close" onPress={requestClose} />} title={move ? 'Edit savings entry' : isAdd ? 'Add savings' : 'Use savings'}
              right={<GlassBtn icon="calendar" label="Pick date" onPress={() => setPickDate(true)} />} />
            <View style={{ marginTop: 20 }}><Seg options={OPTIONS} value={type} onChange={setType} /></View>
            <View style={{ marginTop: 26, alignItems: 'center' }}>
              <Text style={[T(19, 400, { color: C.onDark, lineHeight: 24 })]}>Amount</Text>
              <AmountInput amount={amount} onChange={setAmount} />
              <View style={{ marginTop: 11 }}>
                <GlassPill text={tooMuch ? `You only have PKR ${money(Math.max(0, available))}` : `Savings after this: PKR ${money(Math.max(0, after))}`} />
              </View>
            </View>
          </>}>

          <Sheet top={22} gap={14} bottom={28}>
            <View style={{ backgroundColor: C.soft, borderRadius: 24, paddingVertical: 18, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={[T(14, 400, { color: C.muted })]}>Available in savings</Text>
                <Text style={[T(24, 500, { color: C.ink, letterSpacing: -0.6, marginTop: 2 })]}>PKR {money(Math.max(0, available))}</Text>
              </View>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="vault" size={24} color={C.ink} strokeWidth={1.6} />
              </View>
            </View>
            <InfoRow icon="calendar" trailing="Change" onPress={() => setPickDate(true)}><Text style={[T(16, 500, { color: C.ink })]}>{dayLong(date)}</Text></InfoRow>
            <InfoRow icon="pencil">
              <TextInput value={note} onChangeText={setNote} maxLength={200} placeholder={isAdd ? 'Add a note, e.g. Bonus' : 'Add a note, e.g. Medical bill'} placeholderTextColor={C.muted} accessibilityLabel="Note"
                style={[T(16, 500, { color: C.ink, padding: 0, height: 44 })]} />
            </InfoRow>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <View style={{ marginTop: 1 }}><Icon name="info" size={18} color={C.muted} strokeWidth={1.6} /></View>
              <Text style={[T(13, 400, { flex: 1, color: C.muted, lineHeight: 19 })]}>
                {isAdd ? "This adds to your savings only. It won't change this month's remaining." : "This comes out of your savings only. It won't change this month's remaining."}
              </Text>
            </View>
            <Cta label={busy ? 'Saving…' : move ? 'Save changes' : isAdd ? 'Add to savings' : 'Use from savings'} disabled={!valid || busy} onPress={onSave}
              icon={move ? 'trash' : isAdd ? 'plus' : 'minus'} onIcon={move ? onDelete : onSave} />
          </Sheet>
        </CollapseScroll>
        {move && (
          <Popup sheet visible={askDelete} onClose={() => setAskDelete(false)} icon="trash" tone="red" title="Delete this entry?"
            message="This savings entry will be removed and your savings balance will be recalculated. This can't be undone."
            actions={[{ label: 'Yes, delete', kind: 'red', onPress: doDelete }, { label: 'Keep it', kind: 'soft', onPress: () => setAskDelete(false) }]}>
            <EntryPreview icon="vault" fg="#2158D6" tint="#E6EDFB" title={move.type === 'add' ? 'Added to savings' : 'Used from savings'} sub={dayLong(move.date)}
              amount={`${move.type === 'add' ? '+' : '-'} PKR ${money(move.amount)}`} />
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
