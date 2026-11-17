import React from 'react';
import { Modal, View, Text, ScrollView, Pressable } from 'react-native';
import { C, T } from '../theme';
import Icon from '../components/Icon';
import { useNotify } from '../lib/notify';
import { REMINDERS } from '../lib/reminders';
import { goTo } from '../navRef';
import { Hero, TopBar, GlassBtn, GlassPill, Sheet, Sec, Toggle, EmptyHint } from '../components/ui';

const TONE_COLOR = { alert: C.orange, warn: C.tileIcon, info: C.blue };

export default function NotificationsSheet() {
  const N = useNotify();
  const newCount = N.fresh.size;

  return (
    <Modal visible={N.visible} animationType="slide" onRequestClose={N.close}>
      <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <Hero h={200}>
          <TopBar left={<GlassBtn icon="close" label="Close" onPress={N.close} />} title="Notifications" />
          <View style={{ marginTop: 30, alignItems: 'center' }}>
            <GlassPill text={newCount > 0 ? `${newCount} new` : N.items.length ? 'Nothing new' : 'All caught up'} icon="bell" />
          </View>
        </Hero>

        <Sheet top={22} gap={14} bottom={40}>
          <Sec title="Alerts" />
          {N.items.length === 0 ? <EmptyHint>No alerts right now. Budget limits, savings and month-end reminders will show up here.</EmptyHint> : (
            <View>
              {N.items.map((it) => {
                const isNew = N.fresh.has(it.id);
                return (
                  <Pressable key={it.id} onPress={() => { N.close(); goTo(it.go); }} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'flex-start', gap: 13, paddingVertical: 10, opacity: pressed ? 0.6 : 1 })}>
                    <View style={{ width: 41, height: 41, borderRadius: 21, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={it.icon} size={20} color={TONE_COLOR[it.tone]} strokeWidth={1.5} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[T(17, isNew ? 600 : 500, { letterSpacing: -0.3, lineHeight: 22, color: C.ink })]}>{it.title}</Text>
                      <Text style={[T(13, 400, { color: C.muted, marginTop: 2, lineHeight: 18 })]}>{it.body}</Text>
                    </View>
                    {isNew ? <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.navy, marginTop: 8 }} /> : null}
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={{ marginTop: 14 }}><Sec title="Reminders" /></View>
          <View style={{ gap: 10 }}>
            {REMINDERS.map((r) => (
              <View key={r.key} style={{ backgroundColor: C.soft, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Icon name={r.icon} size={22} color={C.muted} strokeWidth={1.6} />
                <View style={{ flex: 1 }}>
                  <Text style={[T(16, 500, { color: C.ink, letterSpacing: -0.2 })]}>{r.title}</Text>
                  <Text style={[T(13, 400, { color: C.muted, marginTop: 2 })]}>{r.sub}</Text>
                </View>
                <Toggle on={!!N.reminders[r.key]} onPress={() => N.toggleReminder(r.key)} label={r.title} />
              </View>
            ))}
          </View>
          <Text style={[T(13, 400, { color: C.muted, lineHeight: 19 })]}>Reminders are set on this phone only. Nothing is sent from the server.</Text>
        </Sheet>
      </ScrollView>
    </Modal>
  );
}
