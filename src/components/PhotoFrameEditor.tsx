import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { Modal, PanResponder, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ORIGINAL_FRAME, moveFraming, normalizeFraming, photoFraming, portraitFrame, zoomFraming, type FrameTouch, type PhotoFraming } from '../domain/photoFraming';
import type { Photo } from '../domain/model';
import { useApp } from '../store/AppStore';
import { FramedPhoto } from './FramedPhoto';
import { Button } from './UI';

export function PhotoFrameEditor({ uri, initial = ORIGINAL_FRAME, reference, onSave, onCancel, cancelTitle = 'Cancel', saveTitle = 'Save framing', onClose }: {
  uri: string; initial?: PhotoFraming; reference?: Photo; onSave: (frame: PhotoFraming) => Promise<void>; onCancel: () => void; cancelTitle?: string; saveTitle?: string; onClose?: () => void;
}) {
  const { palette: p } = useApp();
  const [frame, setFrame] = useState(() => normalizeFraming(initial));
  const [overlay, setOverlay] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [space, setSpace] = useState({ width: 0, height: 0 });
  const box = portraitFrame(space.width, space.height);
  const live = useRef({ frame, width: box.width, height: box.height, saving, setFrame });
  useLayoutEffect(() => { live.current = { frame, width: box.width, height: box.height, saving, setFrame }; }, [frame, box.width, box.height, saving]);
  const touches = useRef<FrameTouch[]>([]);
  const lock = useRef(false);
  const [responder, setResponder] = useState<ReturnType<typeof PanResponder.create> | null>(null);
  useEffect(() => { setResponder(PanResponder.create({
    onStartShouldSetPanResponder: () => !live.current.saving,
    onMoveShouldSetPanResponder: () => !live.current.saving,
    onPanResponderGrant: event => { touches.current = [...event.nativeEvent.touches]; },
    onPanResponderMove: event => {
      const next = [...event.nativeEvent.touches];
      const current = live.current;
      if (!current.saving) {
        const result = moveFraming(current.frame, touches.current, next, current.width, current.height);
        live.current.frame = result;
        current.setFrame(result);
      }
      touches.current = next;
    },
    onPanResponderRelease: () => { touches.current = []; },
    onPanResponderTerminate: () => { touches.current = []; },
    onPanResponderTerminationRequest: () => false,
  })); }, []);
  const close = () => { if (!lock.current) (onClose ?? onCancel)(); };
  const save = async () => {
    if (lock.current) return;
    lock.current = true; setSaving(true); setError('');
    try { await onSave(normalizeFraming(live.current.frame)); }
    catch { setError('Could not save. Your framing is still here; try again.'); }
    finally { lock.current = false; setSaving(false); }
  };
  const shift = (x: number, y: number) => setFrame(value => normalizeFraming({ ...value, x: value.x + x, y: value.y + y }));
  return <Modal animationType="slide" onRequestClose={close}>
    <SafeAreaView style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={{ padding: 16, paddingBottom: 8, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}><Text style={{ color: p.text, fontSize: 20, fontWeight: '600' }}>Frame photo</Text>{onClose ? <Button title="Close" disabled={saving} onPress={close} /> : null}</View>
        <Text style={{ color: p.muted, fontSize: 13 }}>Pinch to crop · drag to position</Text>
      </View>
      <View style={{ flex: 1, minHeight: 0, marginHorizontal: 16 }} onLayout={event => setSpace(event.nativeEvent.layout)}>
        <View {...responder?.panHandlers} accessibilityLabel="Photo framing area" style={{ position: 'absolute', ...box, overflow: 'hidden', backgroundColor: '#000', borderRadius: p.retro ? 0 : 12 }}>
          <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}><FramedPhoto uri={uri} framing={frame} label="Photo framing preview" /></View>
          {overlay && reference ? <View pointerEvents="none" style={{ position: 'absolute', inset: 0, opacity: .25 }}><FramedPhoto uri={reference.uri} framing={photoFraming(reference)} label="Reference framing overlay" onError={() => { setOverlay(false); setError('Reference unavailable. You can still frame this photo.'); }} /></View> : null}
          <View pointerEvents="none" style={{ position: 'absolute', inset: 0, borderWidth: 1, borderColor: '#ffffff80' }}>{[1, 2].map(n => <React.Fragment key={n}><View style={{ position: 'absolute', left: `${n * 100 / 3}%`, top: 0, bottom: 0, width: 1, backgroundColor: '#ffffff30' }} /><View style={{ position: 'absolute', top: `${n * 100 / 3}%`, left: 0, right: 0, height: 1, backgroundColor: '#ffffff30' }} /></React.Fragment>)}</View>
        </View>
      </View>
      <ScrollView style={{ flexGrow: 0, maxHeight: 190 }} contentContainerStyle={{ padding: 16, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ flex: 1 }}><Button title="−" accessibilityLabel="Zoom out" disabled={saving} onPress={() => setFrame(value => zoomFraming(value, value.zoom - .05))} /></View><Text style={{ color: p.text, width: 54, textAlign: 'center' }}>{Math.round(frame.zoom * 100)}%</Text><View style={{ flex: 1 }}><Button title="+" accessibilityLabel="Zoom in" disabled={saving} onPress={() => setFrame(value => zoomFraming(value, value.zoom + .05))} /></View><Button title="Reset" disabled={saving} onPress={() => setFrame({ ...ORIGINAL_FRAME })} /></View>
        <View style={{ flexDirection: 'row', gap: 8 }}>{([['←', -.01, 0], ['→', .01, 0], ['↑', 0, -.01], ['↓', 0, .01]] as const).map(([title, x, y]) => <View key={title} style={{ flex: 1 }}><Button title={title} accessibilityLabel={`Move photo ${x < 0 ? 'left' : x > 0 ? 'right' : y < 0 ? 'up' : 'down'}`} disabled={saving} onPress={() => shift(x, y)} /></View>)}</View>
        {reference ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ flex: 1 }}><Button title="Match reference" disabled={saving} onPress={() => { setFrame(photoFraming(reference)); setOverlay(true); }} /></View><Text style={{ color: p.muted, fontSize: 12 }}>Overlay</Text><Switch accessibilityLabel="Reference overlay" disabled={saving} value={overlay} onValueChange={setOverlay} trackColor={{ false: p.grey, true: p.primary }} /></View> : null}
      </ScrollView>
      <View style={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8, flexShrink: 0 }}>
        {error ? <Text accessibilityRole="alert" style={{ color: p.red, fontSize: 13 }}>{error}</Text> : null}
        <View style={{ flexDirection: 'row', gap: 10 }}><View style={{ flex: 1 }}><Button title={cancelTitle} disabled={saving} onPress={onCancel} /></View><View style={{ flex: 2 }}><Button title={saving ? 'Saving…' : saveTitle} primary disabled={saving} onPress={() => { void save(); }} /></View></View>
      </View>
    </SafeAreaView>
  </Modal>;
}
