import React, { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useApp } from '../store/AppStore';
import { defaultPets, normalizeDefaultPet, type DefaultPet } from '../domain/defaultPets';
import { DefaultPetArtwork } from './DefaultPetArtwork';
import { Button, Card, Label } from './UI';

export function DefaultPetPicker({ onClose }: { onClose: () => void }) {
  const { state, palette: p, commit } = useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);
  const selected = normalizeDefaultPet(state.defaultPet);
  const choose = async (pet: DefaultPet) => {
    if (busy.current) return;
    busy.current = true; setSaving(true); setError('');
    try { await commit(s => ({ ...s, defaultPet: pet })); onClose(); }
    catch { setError('Could not save your pet. Please try again.'); }
    finally { busy.current = false; setSaving(false); }
  };
  return <Modal visible transparent animationType="fade" onRequestClose={() => { if (!busy.current) onClose(); }}>
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#000000bb' }}>
      <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 420, maxHeight: '85%', alignSelf: 'center' }}>
        <ScrollView><Card compact>
          <Text accessibilityRole="header" style={{ color: p.text, fontSize: 22, fontWeight: '700' }}>Choose your pet</Text>
          <Label small>These buddies appear with the Default theme. Other themes have their own pet. Your progress stays the same.</Label>
          <View accessibilityRole="radiogroup" accessibilityLabel="Default theme pet" style={{ gap: 10 }}>
            {defaultPets.map(pet => <Pressable key={pet.id} accessibilityRole="radio" accessibilityLabel={pet.name} accessibilityState={{ checked: selected === pet.id, disabled: saving }} aria-checked={selected === pet.id} aria-disabled={saving} disabled={saving} onPress={() => { void choose(pet.id); }} style={({ pressed }) => ({ minHeight: 110, flexDirection: 'row', alignItems: 'center', padding: 10, gap: 12, borderRadius: p.retro ? 0 : 14, borderWidth: 2, borderColor: selected === pet.id ? p.primary : p.line, backgroundColor: pressed ? p.grey : p.bg, opacity: saving ? .6 : 1 })}>
              <View accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants"><DefaultPetArtwork pet={pet.id} mood="normal" blink={false} delighted={false} size={86} /></View>
              <View style={{ flex: 1, gap: 5 }}><Text style={{ color: p.text, fontSize: 16, fontWeight: '600' }}>{pet.name}</Text><Text style={{ color: p.muted, fontSize: 12, lineHeight: 17 }}>{pet.description}</Text>{selected === pet.id ? <Text style={{ color: p.primary, fontSize: 12 }}>✓ Your buddy</Text> : null}</View>
            </Pressable>)}
          </View>
          {error ? <Text accessibilityRole="alert" style={{ color: p.red }}>{error}</Text> : null}
          <Button title={saving ? 'Saving…' : 'Close'} disabled={saving} onPress={onClose} />
        </Card></ScrollView>
      </View>
    </View>
  </Modal>;
}
