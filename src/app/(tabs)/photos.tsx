import React, { useState, useRef } from 'react';
import { Alert, Platform, Share, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useIsFocused } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { useApp } from '../../store/AppStore';
import { Photo, type State } from '../../domain/model';
import { PhotoAdjustmentTools } from '../../components/PhotoAdjustmentTools';
import { adjustmentTarget, applyPhotoAdjustment, beginPhotoAdjustment, changePhotoAdjustment, type PhotoAdjustment } from '../../domain/photoAdjustment';
import { ORIGINAL_FRAME, portraitFrame, photoFraming, type PhotoFraming } from '../../domain/photoFraming';
import { PhotoFrameEditor } from '../../components/PhotoFrameEditor';
import { FramedPhoto } from '../../components/FramedPhoto';
import { photoForDate } from '../../domain/photos';
import { validDate } from '../../domain/reminders';
import { Button, Card, Label, Row, Screen } from '../../components/UI';
import { GuidedPhotoCamera } from '../../components/GuidedPhotoCamera';
import { saveLocalPhoto } from '../../photos/localPhoto';
import { PhotoReel } from '../../components/PhotoReel';
import { PhotoPickerModal, photoDateLabel } from '../../components/PhotoPickerModal';
export default function Photos() {
  const { data, today, updateData, commit, state, palette: p } = useApp(); const [selectedId, setSelectedId] = useState<string | null>(null); const [referenceId,setReferenceId]=useState<string|null>(null); const [mode, setMode] = useState<'Side by side' | 'Flip' | 'Slider'>('Side by side'); const [flip, setFlip] = useState(false); const [position,setPosition]=useState(50); const [width,setWidth]=useState(0); const [trackWidth,setTrackWidth]=useState(1); const [busy,setBusy]=useState(false); const [captureDate,setCaptureDate]=useState<string|null>(null);
  const focused = useIsFocused();
  const [cameraSession, setCameraSession] = useState<{ date: string; mode: State['mode']; reference?: Photo } | null>(null);
  const [picker, setPicker] = useState<'date' | 'reference' | 'comparison' | null>(null);
  const [editing, setEditing] = useState<{ photo: Photo; mode: State['mode']; initial: PhotoFraming } | null>(null);
  const [importing, setImporting] = useState<{ uri: string; date: string; mode: State['mode']; reference?: Photo } | null>(null);
  const [adjustmentDraft, setAdjustment] = useState<PhotoAdjustment | null>(null);
  const [fine, setFine] = useState(false);
  const [savingAdjustments, setSavingAdjustments] = useState(false);
  const [adjustError, setAdjustError] = useState('');
  const adjustmentLock = useRef(false);
  const [more, setMore] = useState(false);
  const [reelTarget, setReelTarget] = useState<'reference' | 'comparison'>('comparison');
  const { height, width: windowWidth } = useWindowDimensions();
  // The comparison canvas stays fixed; photo framing is saved independently.
  const canvasWidth = width || windowWidth - 12;
  const photoWidth = mode === 'Side by side' ? (canvasWidth - 4) / 2 : canvasWidth;
  const previewHeight = Math.min(height * .65, photoWidth * 4 / 3);
  const uploadDate = captureDate ?? today;
  const reviewed = data.photoReviewedDates.includes(today); const photos = data.photos.slice().sort((a,b)=>a.date.localeCompare(b.date)); const reference=photos.find(photo=>photo.id===referenceId)??photos[0]; const selected=photoForDate(photos, uploadDate, selectedId);
  const adjustment = adjustmentDraft?.mode === state.mode && adjustmentDraft.photoId === selected?.id && adjustmentDraft.referenceId === reference?.id ? adjustmentDraft : null;
  const added = (photo: Photo) => { setSelectedId(photo.id); setCaptureDate(photo.date === today ? null : photo.date); setMore(false); };
  const add = async () => {
    const dateAtPick = uploadDate; const modeAtPick = state.mode;
    if (!validDate(dateAtPick) || dateAtPick > today) { Alert.alert('Choose a valid photo date today or earlier'); return; }
    setBusy(true);
    try { const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 }); if (!result.canceled) setImporting({ uri: result.assets[0].uri, date: dateAtPick, mode: modeAtPick, reference }); }
    catch { Alert.alert('Could not add photo', 'Please retry. The selected original is unchanged.'); }
    finally { setBusy(false); }
  };
  const picture = (photo: Photo | undefined) => photo ? <FramedPhoto photo={photo} framing={adjustment?.dirty.includes(photo.id) ? adjustment.frames[photo.id] : photo.framing} label={`Progress photo ${photo.date}`} /> : <Label small>No photo yet</Label>;
  const startAdjusting = () => {
    if (!selected || adjustmentLock.current) return;
    const box = portraitFrame(photoWidth, previewHeight);
    const session = beginPhotoAdjustment(state.mode, selected, reference, box.width, box.height);
    session.target = reelTarget === 'reference' && reference?.id !== selected.id ? 'reference' : 'photo';
    setAdjustment(session);
    if (mode === 'Flip') setFlip(session.target === 'reference');
    setAdjustError(''); setMore(false);
  };
  const saveAdjustments = async () => {
    if (!adjustment || adjustmentLock.current) return;
    adjustmentLock.current = true; setSavingAdjustments(true); setAdjustError('');
    try { await commit(s => applyPhotoAdjustment(s, adjustment)); setAdjustment(null); }
    catch { setAdjustError('Could not save. Your adjustments are still here; try again.'); }
    finally { adjustmentLock.current = false; setSavingAdjustments(false); }
  };
  const remove=()=>{if(!selected)return;const photo=selected;const modeAtDelete=state.mode;Alert.alert('Delete app copy?',`Remove the ${photo.date} photo from ON TRACK. Your original in Photos is unchanged.`,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>{void(async()=>{setBusy(true);try{await commit(s=>({...s,[modeAtDelete]:{...s[modeAtDelete],photos:s[modeAtDelete].photos.filter(item=>item.id!==photo.id)}}));try{const directory=new Directory(Paths.document,'progress-photos',modeAtDelete);const file=new File(photo.uri);if(!file.uri.startsWith(directory.uri.replace(/\/$/,'')+'/'))throw new Error('Not an app-owned photo path');if(file.exists)file.delete();}catch{Alert.alert('Photo removed from timeline','The app copy could not be deleted from disk. Secure deletion is not confirmed.');}setSelectedId(null);}catch{Alert.alert('Could not delete','Your photo remains in the timeline.');}finally{setBusy(false);}})();}}]);};
  const exportOriginal=()=>{if(!selected)return;const photo=selected;if(Platform.OS!=='ios'){Alert.alert('iPhone export only','File export on other platforms needs a native sharing adapter.');return;}Alert.alert('Export original photo?',`${photo.date} · framing edits are excluded. Choose where to save or share the file.`,[{text:'Cancel',style:'cancel'},{text:'Open share sheet',onPress:()=>{void Share.share({url:photo.uri}).catch(()=>Alert.alert('Could not export photo'));}}]);};
  const reel = photos.length && !adjustment && !more ? <PhotoReel photos={photos} target={reelTarget} selectedId={reelTarget === 'reference' ? reference?.id : selected?.id} onSelect={photo => {
    if (reelTarget === 'reference') { setReferenceId(photo.id); if (mode === 'Flip') setFlip(true); }
    else { setCaptureDate(photo.date === today ? null : photo.date); setSelectedId(photo.id); setFlip(false); }
    setMore(false);
  }} /> : null;
  return <Screen title="" back={false} compact horizontalPadding={4}>
    <Card compact>
      <Row><Text style={{ color: p.text, fontSize: 16, fontWeight: '600' }}>Photos</Text><Button title="Take photo" disabled={busy || !!adjustment} onPress={() => { if (Platform.OS === 'web') { Alert.alert('Open the mobile app', 'Taking progress photos is available in the mobile app.'); return; } if (!validDate(uploadDate) || uploadDate > today) return; setCameraSession({ date: uploadDate, mode: state.mode, reference }); }} /></Row>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {reference ? <Pressable accessibilityRole="button" accessibilityLabel="Choose reference photo" disabled={!!adjustment} accessibilityState={{ selected: reelTarget === 'reference' }} onPress={() => { setReelTarget('reference'); setMore(false); }} style={{ flex: 1, minHeight: 44, paddingHorizontal: 8, justifyContent: 'center', borderBottomWidth: 2, borderColor: reelTarget === 'reference' ? p.primary : p.line }}>
          <Text style={{ color: p.muted, fontSize: 11 }}>Reference</Text><Text style={{ color: p.primary, fontSize: 14, fontWeight: '600' }}>{photoDateLabel(reference.date, today)}</Text>
        </Pressable> : null}
        <Pressable accessibilityRole="button" accessibilityLabel="Choose comparison photo from reel" accessibilityState={{ selected: reelTarget === 'comparison' }} disabled={busy || !!adjustment} onPress={() => { setReelTarget('comparison'); setMore(false); }} style={{ flex: 1, minHeight: 44, paddingHorizontal: 8, justifyContent: 'center', borderBottomWidth: 2, borderColor: reelTarget === 'comparison' ? p.primary : p.line }}>
          <Text style={{ color: p.muted, fontSize: 11 }}>Photo</Text><Text style={{ color: p.primary, fontSize: 14, fontWeight: '600' }}>{photoDateLabel(uploadDate, today)}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Choose photo date" disabled={busy || !!adjustment} onPress={() => setPicker('date')} style={{ minWidth: 56, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: p.primary, fontSize: 14 }}>Date</Text></Pressable>
      </View>
      {!selected ? <><View style={{ minHeight: 210, justifyContent: 'center', alignItems: 'center', gap: 14, paddingHorizontal: 12 }}>
        <Text style={{ color: p.muted, fontSize: 16 }}>No photo yet</Text>
        <Button title={busy ? 'Working…' : uploadDate === today ? 'Import photo' : `Import for ${photoDateLabel(uploadDate, today)}`} primary disabled={busy} onPress={() => { void add(); }} />
      </View>{reel}</> : <>
        <View style={{ flexDirection: 'row', backgroundColor: p.bg, borderRadius: p.retro ? 0 : 8, padding: 3 }}>
          {(['Side by side', 'Flip', 'Slider'] as const).map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: mode === item }} onPress={() => { setMode(item); setFlip(false); }} style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: mode === item ? p.primary : 'transparent', borderRadius: p.retro ? 0 : 6 }}><Text style={{ color: mode === item ? p.bg : p.muted, fontSize: 13, fontWeight: '600' }}>{item}</Text></Pressable>)}
        </View>
        <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', height: previewHeight, marginHorizontal: -10, gap: 4 }}>
          {mode === 'Side by side' ? <>
            <View style={{ flex: 1, overflow: 'hidden', borderRadius: 10, backgroundColor: p.bg }}>{picture(reference)}</View><View style={{ flex: 1, overflow: 'hidden', borderRadius: 10, backgroundColor: p.bg }}>{picture(selected)}</View>
          </> : <View style={{ flex: 1, overflow: 'hidden', borderRadius: 10, backgroundColor: p.bg }}>
            {mode === 'Flip' ? <>
              <View key={`comparison-${selected?.id}`} collapsable={false} pointerEvents="none" accessibilityElementsHidden={flip} importantForAccessibility={flip ? 'no-hide-descendants' : 'auto'} style={{ position: 'absolute', inset: 0, opacity: flip ? 0 : 1 }}>{picture(selected)}</View>
              <View key={`reference-${reference?.id}`} collapsable={false} pointerEvents="none" accessibilityElementsHidden={!flip} importantForAccessibility={!flip ? 'no-hide-descendants' : 'auto'} style={{ position: 'absolute', inset: 0, opacity: flip ? 1 : 0 }}>{picture(reference)}</View>
            </> : picture(selected)}
            {mode === 'Slider' ? <><View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${position}%`, overflow: 'hidden' }}><View style={{ width, height: '100%' }}>{picture(reference)}</View></View><View pointerEvents="none" style={{ position: 'absolute', left: `${position}%`, top: 0, bottom: 0, width: 2, backgroundColor: p.primary }} /></> : null}
          </View>}
        </View>
        {mode === 'Flip' ? <Button title={flip ? 'Show comparison' : 'Show reference'} onPress={() => setFlip(!flip)} /> : null}
        {mode === 'Slider' ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View accessible accessibilityRole="adjustable" accessibilityLabel="Photo comparison divider" accessibilityValue={{ min: 0, max: 100, now: Math.round(position) }} accessibilityActions={[{ name: 'increment', label: 'More reference photo' }, { name: 'decrement', label: 'More comparison photo' }]} onAccessibilityAction={event => setPosition(n => Math.max(0, Math.min(100, n + (event.nativeEvent.actionName === 'increment' ? 10 : -10))))} onLayout={event => setTrackWidth(event.nativeEvent.layout.width)} onStartShouldSetResponder={() => true} onResponderGrant={event => setPosition(Math.max(0, Math.min(100, event.nativeEvent.locationX / trackWidth * 100)))} onResponderMove={event => setPosition(Math.max(0, Math.min(100, event.nativeEvent.locationX / trackWidth * 100)))} style={{ flex: 1, height: 44, justifyContent: 'center', marginHorizontal: 10 }}>
          <View pointerEvents="none" style={{ height: 6, backgroundColor: p.grey, borderRadius: 3 }}><View style={{ height: 6, width: `${position}%`, backgroundColor: p.primary, borderRadius: 3 }} /></View><View pointerEvents="none" style={{ position: 'absolute', left: `${position}%`, marginLeft: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: p.primary }} />
        </View><Pressable accessibilityRole="button" accessibilityLabel="Center comparison divider" onPress={() => setPosition(50)} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: p.primary, fontSize: 12 }}>50%</Text></Pressable></View> : null}
        {adjustment ? <PhotoAdjustmentTools target={adjustment.target} frame={adjustment.frames[adjustmentTarget(adjustment)]} hasReference={!!reference && reference.id !== selected.id} fine={fine} busy={savingAdjustments} error={adjustError} onTarget={target => { setAdjustment(value => value ? { ...value, target } : null); if (mode === 'Flip') setFlip(target === 'reference'); }} onFine={() => setFine(!fine)} onChange={frame => setAdjustment(value => value ? changePhotoAdjustment(value, frame) : null)} onReset={() => setAdjustment(value => value ? changePhotoAdjustment(value, ORIGINAL_FRAME) : null)} onSave={() => { void saveAdjustments(); }} onCancel={() => { setAdjustment(null); setAdjustError(''); }} /> : <>
          <View style={{ flexDirection: 'row', gap: 8 }}><View style={{ flex: 1 }}><Button title="Adjust" primary disabled={savingAdjustments} onPress={startAdjusting} /></View><View style={{ flex: 1 }}><Button title="Photo options" selected={more} onPress={() => setMore(!more)} /></View></View>
          {reel}
        </>}
        {more && !adjustment ? <View style={{ gap: 8, borderTopWidth: 1, borderColor: p.line, paddingTop: 8 }}>
          <Button title={reelTarget === 'reference' ? 'Crop reference' : 'Crop photo'} onPress={() => { const photo = reelTarget === 'reference' ? reference : selected; if (photo) setEditing({ photo, mode: state.mode, initial: photoFraming(photo, photoWidth, previewHeight) }); }} />
          <Button title="Import photo" disabled={busy} onPress={() => { void add(); }} />
          <Row><Button title="Export original" disabled={busy} onPress={exportOriginal} /><Button title="Delete photo" disabled={busy} onPress={remove} /></Row>
          {reviewed ? <Label small>Reviewed today ✓</Label> : <Button title="Mark reviewed" onPress={() => updateData(d => ({ ...d, photoReviewedDates: [...new Set([...d.photoReviewedDates, today])] }))} />}
        </View> : null}
      </>}
    </Card>
    {cameraSession && focused ? <GuidedPhotoCamera date={cameraSession.date} reference={cameraSession.reference} onClose={() => setCameraSession(null)} onSave={async (uri, framing) => { const photo = await saveLocalPhoto(uri, cameraSession.date, cameraSession.mode, today, commit, framing); added(photo); setCameraSession(null); }} /> : null}
    {editing ? <PhotoFrameEditor uri={editing.photo.uri} initial={editing.initial} reference={reference?.id !== editing.photo.id ? reference : undefined} onCancel={() => setEditing(null)} onSave={async framing => { await commit(s => ({ ...s, [editing.mode]: { ...s[editing.mode], photos: s[editing.mode].photos.map(photo => photo.id === editing.photo.id ? { ...photo, framing } : photo) } })); setEditing(null); }} /> : null}
    {importing ? <PhotoFrameEditor saveTitle="Save photo" uri={importing.uri} initial={importing.reference?.framing} reference={importing.reference} onCancel={() => setImporting(null)} onSave={async framing => { const photo = await saveLocalPhoto(importing.uri, importing.date, importing.mode, today, commit, framing); added(photo); setImporting(null); }} /> : null}
    {picker ? <PhotoPickerModal kind={picker} today={today} date={uploadDate} photos={photos} selectedId={picker === 'reference' ? reference?.id : selected?.id} onDate={date => { setCaptureDate(date === today ? null : date); setSelectedId(null); setFlip(false); setReelTarget('comparison'); setMore(false); setPicker(null); }} onPhoto={id => { if (picker === 'reference') setReferenceId(id); else { const photo = photos.find(item => item.id === id); if (photo) setCaptureDate(photo.date === today ? null : photo.date); setSelectedId(id); setFlip(false); } setPicker(null); }} onClose={() => setPicker(null)} /> : null}
  </Screen>;
}
