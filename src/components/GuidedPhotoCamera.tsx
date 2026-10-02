import React, { useEffect, useRef, useState } from 'react';
import { AppState, Linking, Modal, ScrollView, Switch, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { File, Paths } from 'expo-file-system';
import { useApp } from '../store/AppStore';
import { createCaptureSession } from '../photos/captureSession';
import { normalizeFraming, type PhotoFraming } from '../domain/photoFraming';
import { FramedPhoto } from './FramedPhoto';
import { PhotoFrameEditor } from './PhotoFrameEditor';
import { PhotoOverlaySlider } from './PhotoOverlaySlider';
import type { Photo } from '../domain/model';
import { Button } from './UI';

export function GuidedPhotoCamera({ date, reference, onSave, onClose }: { date: string; reference?: Photo; onSave: (uri: string, framing: PhotoFraming) => Promise<void>; onClose: () => void }) {
  const { palette: p, state, update } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [seconds, setSeconds] = useState<0 | 3 | 10>(3);
  const [remaining, setRemaining] = useState(0);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [opacity, setOpacity] = useState(.25);
  const [preview, setPreview] = useState<string | null>(null);
  const camera = useRef<CameraView>(null);
  const session = useRef(createCaptureSession());
  const alive = useRef(true);
  const cache = useRef<string | null>(null);
  const pendingWait = useRef<{ timer: ReturnType<typeof setTimeout>; resolve: () => void } | null>(null);
  const { width, height } = useWindowDimensions();
  const frameWidth = Math.max(180, Math.min(width - 32, (height - 350) * .75));
  const guided = state.photoGuidance === true;
  const framing = normalizeFraming(reference?.framing);
  const text = { color: p.muted, fontSize: 13, lineHeight: 19 };
  const clearCache = () => { const uri = cache.current; cache.current = null; if (uri?.startsWith(Paths.cache.uri)) try { const file = new File(uri); if (file.exists) file.delete(); } catch {} };
  const cancel = () => {
    session.current.cancel();
    const pending = pendingWait.current;
    if (pending) { clearTimeout(pending.timer); pending.resolve(); pendingWait.current = null; }
  };
  useEffect(() => {
    alive.current = true;
    const subscription = AppState.addEventListener('change', status => {
      const isActive = status === 'active';
      setActive(isActive);
      if (!isActive) { cancel(); setRemaining(0); setWorking(false); setReady(false); }
    });
    return () => { alive.current = false; cancel(); clearCache(); subscription.remove(); };
  }, []);
  const close = () => { cancel(); onClose(); };
  const capture = async () => {
    if (session.current.isBusy()) return;
    setError(''); setWorking(true);
    try {
      await session.current.run(seconds, () => new Promise<void>(resolve => { const timer = setTimeout(() => { pendingWait.current = null; resolve(); }, 1000); pendingWait.current = { timer, resolve }; }), setRemaining, async isCurrent => {
        if (!camera.current || !alive.current || AppState.currentState !== 'active') return;
        const photo = await camera.current.takePictureAsync({ quality: 1, exif: false, base64: false });
        if (!alive.current || !isCurrent() || AppState.currentState !== 'active') { if (photo.uri.startsWith(Paths.cache.uri)) try { new File(photo.uri).delete(); } catch {} return; }
        cache.current = photo.uri;
        setPreview(photo.uri);
      });
    } catch { if (alive.current) setError('Could not take photo. Please retry.'); }
    finally { if (alive.current) setWorking(false); }
  };
  if (preview) return <PhotoFrameEditor uri={preview} initial={framing} reference={reference} onSave={frame => onSave(preview, frame)} saveTitle="Save photo" cancelTitle="Retake" onCancel={() => { clearCache(); setPreview(null); setReady(false); setError(''); }} onClose={close} />;
  return <Modal presentationStyle="fullScreen" animationType="slide" onRequestClose={close}>
    <SafeAreaProvider>
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={{ padding: 16, paddingBottom: 4, gap: 8 }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><Text style={{ color: p.text, fontSize: 19, fontWeight: '600' }}>Take progress photo</Text><Button title="Close" onPress={close} /></View>
        <Text style={text}>{date} · Stored on device</Text></View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        {!permission ? <Text style={text}>Checking camera access…</Text> : !permission.granted ? <View style={{ paddingVertical: 24, gap: 14 }}><Text style={{ color: p.text, fontSize: 16 }}>Allow camera access to take a photo.</Text><Button title={permission.canAskAgain ? 'Allow camera' : 'Open iPhone settings'} primary onPress={() => { void (permission.canAskAgain ? requestPermission() : Linking.openSettings()).catch(() => setError('Could not open camera access. Try again.')); }} /><Text style={text}>You can still import existing photos from the photo library.</Text></View> : <>
          <View style={{ width: frameWidth, height: frameWidth * 4 / 3, alignSelf: 'center', overflow: 'hidden', borderRadius: p.retro ? 0 : 14, backgroundColor: '#000' }}>
            {active ? <View style={{ width: '100%', height: '100%', transform: [{ translateX: framing.x * frameWidth }, { translateY: framing.y * frameWidth * 4 / 3 }, { scale: framing.zoom }] }}><CameraView key={facing} ref={camera} facing={facing} mirror={facing === 'front'} zoom={0} ratio="4:3" mode="picture" autofocus="on" flash="off" onCameraReady={() => setReady(true)} onMountError={() => { setReady(false); setError('Camera could not start. Close and retry, or import a photo.'); }} style={{ width: '100%', height: '100%' }} /></View> : <Text style={text}>Camera paused</Text>}
            {guided ? <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
              {reference ? <View style={{ position: 'absolute', inset: 0, opacity }}><FramedPhoto photo={reference} label="Reference photo guide" onError={() => setError('Reference photo is unavailable. Turn guides off or choose another reference.')} /></View> : null}
              <View style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, borderLeftWidth: 1, borderColor: '#ffffff80', borderStyle: 'dashed' }} />
              {[12, 88].map(top => <View key={top} style={{ position: 'absolute', top: `${top}%`, left: '15%', right: '15%', borderTopWidth: 1, borderColor: '#ffffffaa', borderStyle: 'dashed' }} />)}
            </View> : null}
            {remaining > 0 ? <View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#00000040' }}><Text accessibilityLiveRegion="assertive" style={{ color: '#fff', fontSize: 72, fontWeight: '700' }}>{remaining}</Text></View> : null}
          </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ flex: 1, gap: 3 }}><Text style={{ color: p.text, fontSize: 15, fontWeight: '600' }}>Guided photos · beta</Text><Text style={text}>{guided ? reference ? 'Match shoulders and feet to your reference.' : 'Keep your head and feet inside the guides.' : 'Try guides for consistent framing.'}</Text></View><Switch accessibilityLabel="Guided photos" value={guided} disabled={working} onValueChange={value => update(s => ({ ...s, photoGuidance: value }))} trackColor={{ false: p.grey, true: p.primary }} /></View>
            {guided && reference ? <Text style={text}>Reference: {reference.date} · Choose a different reference in Photos.</Text> : null}
            {guided && reference ? <PhotoOverlaySlider value={opacity} onChange={setOpacity} disabled={working} /> : null}
            <View style={{ flexDirection: 'row', gap: 8 }}><View style={{ flex: 1 }}><Button title={`Timer: ${seconds ? `${seconds}s` : 'off'}`} disabled={working} onPress={() => setSeconds(seconds === 0 ? 3 : seconds === 3 ? 10 : 0)} /></View><View style={{ flex: 1 }}><Button title={facing === 'back' ? 'Use front camera' : 'Use back camera'} disabled={working} onPress={() => { setReady(false); setFacing(facing === 'back' ? 'front' : 'back'); }} /></View></View>
            <Text style={text}>Use the same spot, camera height and lighting. Original photo is kept.</Text>

        </>}
        {error ? <Text accessibilityRole="alert" style={{ color: p.red, fontSize: 13 }}>{error}</Text> : null}
      </ScrollView>
      {permission?.granted ? <View style={{ padding: 16, paddingTop: 10, flexShrink: 0, borderTopWidth: 1, borderTopColor: p.line }}><Button title={remaining ? 'Cancel timer' : working ? 'Taking photo…' : 'Take photo'} primary disabled={!ready || !active || working && !remaining} onPress={() => { if (remaining) { cancel(); setRemaining(0); setWorking(false); } else { void capture(); } }} /></View> : null}
    </SafeAreaView>
    </SafeAreaProvider>
  </Modal>;
}
