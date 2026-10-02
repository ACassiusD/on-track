import React, { useState } from 'react';
import { Alert, Image, Platform, Share, Pressable, Text, View, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { useApp } from '../../store/AppStore';
import { Photo, makeId } from '../../domain/model';
import { photoForDate } from '../../domain/photos';
import { validDate } from '../../domain/reminders';
import { Button, Card, Label, Row, Screen } from '../../components/UI';
import { PhotoReel } from '../../components/PhotoReel';
import { PhotoPickerModal, photoDateLabel } from '../../components/PhotoPickerModal';
export default function Photos() {
  const { data, today, updateData, commit, state, palette: p } = useApp(); const [selectedId, setSelectedId] = useState<string | null>(null); const [referenceId,setReferenceId]=useState<string|null>(null); const [mode, setMode] = useState<'Side by side' | 'Flip' | 'Slider'>('Side by side'); const [flip, setFlip] = useState(false); const [position,setPosition]=useState(50); const [width,setWidth]=useState(0); const [trackWidth,setTrackWidth]=useState(1); const [busy,setBusy]=useState(false); const [captureDate,setCaptureDate]=useState<string|null>(null);
  const [picker, setPicker] = useState<'date' | 'reference' | 'comparison' | null>(null);
  const [adjust, setAdjust] = useState(false);
  const [adjustReference, setAdjustReference] = useState(false);
  const [fine, setFine] = useState(false);
  const [more, setMore] = useState(false);
  const [reelTarget, setReelTarget] = useState<'reference' | 'comparison'>('comparison');
  const { height } = useWindowDimensions();
  const uploadDate = captureDate ?? today;
  const reviewed = data.photoReviewedDates.includes(today); const photos = data.photos.slice().sort((a,b)=>a.date.localeCompare(b.date)); const reference=photos.find(photo=>photo.id===referenceId)??photos[0]; const selected=photoForDate(photos, uploadDate, selectedId);
  const add=async()=>{ const dateAtPick = uploadDate; if (!validDate(dateAtPick) || dateAtPick > today) { Alert.alert('Choose a valid photo date today or earlier'); return; } setBusy(true); const modeAtPick=state.mode; let copied:File|null=null; try { const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:false,quality:1}); if(result.canceled)return; const id=makeId(); const source=new File(result.assets[0].uri); const directory=new Directory(Paths.document,'progress-photos',modeAtPick); directory.create({intermediates:true,idempotent:true}); copied=new File(directory,`${id}.${source.extension.replace('.','')||'jpg'}`); await source.copy(copied); const photo:Photo={id,date:dateAtPick,uri:copied.uri,scale:1,x:0,y:0}; await commit(s=>({...s,[modeAtPick]:{...s[modeAtPick],photos:[...s[modeAtPick].photos,photo]}})); setSelectedId(id); setCaptureDate(dateAtPick === today ? null : dateAtPick); setAdjustReference(false); setMore(false); } catch { if(copied?.exists)try{copied.delete();}catch{} Alert.alert('Could not add photo','Please retry. The selected original is unchanged.'); } finally {setBusy(false);} };
  const adjusted = adjustReference ? reference : selected;
  const align=(key:'scale'|'x'|'y',delta:number)=>{if(!adjusted)return;updateData(d=>({...d,photos:d.photos.map(photo=>photo.id!==adjusted.id?photo:{...photo,[key]:key==='scale'?Math.round(Math.max(.5,Math.min(2,photo.scale+delta))*100)/100:Math.max(-100,Math.min(100,photo[key]+delta))})}));};
  const picture=(photo:Photo|undefined)=>photo?<Image source={{uri:photo.uri}} accessibilityLabel={`Progress photo ${photo.date}`} resizeMode="contain" style={{width:'100%',height:'100%',transform:[{translateX:photo.x},{translateY:photo.y},{scale:photo.scale}]}}/>:<Label small>No photo yet</Label>;
  const remove=()=>{if(!selected)return;const photo=selected;const modeAtDelete=state.mode;Alert.alert('Delete app copy?',`Remove the ${photo.date} photo from ON TRACK. Your original in Photos is unchanged.`,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>{void(async()=>{setBusy(true);try{await commit(s=>({...s,[modeAtDelete]:{...s[modeAtDelete],photos:s[modeAtDelete].photos.filter(item=>item.id!==photo.id)}}));try{const directory=new Directory(Paths.document,'progress-photos',modeAtDelete);const file=new File(photo.uri);if(!file.uri.startsWith(directory.uri.replace(/\/$/,'')+'/'))throw new Error('Not an app-owned photo path');if(file.exists)file.delete();}catch{Alert.alert('Photo removed from timeline','The app copy could not be deleted from disk. Secure deletion is not confirmed.');}setSelectedId(null);}catch{Alert.alert('Could not delete','Your photo remains in the timeline.');}finally{setBusy(false);}})();}}]);};
  const exportOriginal=()=>{if(!selected)return;const photo=selected;if(Platform.OS!=='ios'){Alert.alert('iPhone export only','File export on other platforms needs a native sharing adapter.');return;}Alert.alert('Export original photo?',`${photo.date} · alignment edits are excluded. Choose where to save or share the file.`,[{text:'Cancel',style:'cancel'},{text:'Open share sheet',onPress:()=>{void Share.share({url:photo.uri}).catch(()=>Alert.alert('Could not export photo'));}}]);};
  const control = (title: string, label: string, onPress: () => void) => <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={{ minWidth: 44, minHeight: 44, flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: p.bg, borderWidth: 1, borderColor: p.line, borderRadius: p.retro ? 0 : 8 }}><Text style={{ color: p.primary, fontSize: 21, fontWeight: '600' }}>{title}</Text></Pressable>;
  const reel = photos.length && !adjust ? <PhotoReel photos={photos} target={reelTarget} selectedId={reelTarget === 'reference' ? reference?.id : selected?.id} onSelect={photo => {
    if (reelTarget === 'reference') { setReferenceId(photo.id); if (mode === 'Flip') setFlip(true); }
    else { setCaptureDate(photo.date === today ? null : photo.date); setSelectedId(photo.id); setFlip(false); setAdjustReference(false); }
    setMore(false);
  }} /> : null;
  return <Screen title="" back={false} compact>
    <Card compact>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {selected && reference ? <Pressable accessibilityRole="button" accessibilityLabel="Choose reference photo" accessibilityState={{ selected: reelTarget === 'reference' }} onPress={() => { setReelTarget('reference'); setAdjust(false); }} style={{ flex: 1, minHeight: 44, paddingHorizontal: 8, justifyContent: 'center', borderBottomWidth: 2, borderColor: reelTarget === 'reference' ? p.primary : p.line }}>
          <Text style={{ color: p.muted, fontSize: 11 }}>Reference</Text><Text style={{ color: p.primary, fontSize: 14, fontWeight: '600' }}>{photoDateLabel(reference.date, today)}</Text>
        </Pressable> : null}
        <Pressable accessibilityRole="button" accessibilityLabel="Choose comparison photo from reel" accessibilityState={{ selected: reelTarget === 'comparison' }} disabled={busy} onPress={() => { setReelTarget('comparison'); setAdjust(false); }} style={{ flex: 1, minHeight: 44, paddingHorizontal: 8, justifyContent: 'center', borderBottomWidth: 2, borderColor: reelTarget === 'comparison' ? p.primary : p.line }}>
          <Text style={{ color: p.muted, fontSize: 11 }}>Photo for</Text><Text style={{ color: p.primary, fontSize: 14, fontWeight: '600' }}>{photoDateLabel(uploadDate, today)}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Choose date to add a photo" disabled={busy} onPress={() => setPicker('date')} style={{ minWidth: 56, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: p.primary, fontSize: 14 }}>+ Add</Text></Pressable>
      </View>
      {!selected ? <><View style={{ minHeight: 210, justifyContent: 'center', alignItems: 'center', gap: 14, paddingHorizontal: 12 }}>
        <Text style={{ color: p.muted, fontSize: 16 }}>No photo yet</Text>
        <Button title={busy ? 'Working…' : uploadDate === today ? 'Add today’s photo' : `Add photo for ${photoDateLabel(uploadDate, today)}`} primary disabled={busy} onPress={() => { void add(); }} />
      </View>{reel}</> : <>
        <View style={{ flexDirection: 'row', backgroundColor: p.bg, borderRadius: p.retro ? 0 : 8, padding: 3 }}>
          {(['Side by side', 'Flip', 'Slider'] as const).map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: mode === item }} onPress={() => { setMode(item); setFlip(false); }} style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: mode === item ? p.primary : 'transparent', borderRadius: p.retro ? 0 : 6 }}><Text style={{ color: mode === item ? p.bg : p.muted, fontSize: 13, fontWeight: '600' }}>{item}</Text></Pressable>)}
        </View>
        <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', height: Math.min(adjust ? 280 : 320, Math.max(220, height * (adjust ? .3 : .36))), gap: 8 }}>
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
        {reel}
        <Row>
          <Label small>{mode === 'Slider' ? 'Slide to compare' : mode === 'Flip' ? `Showing ${flip ? 'reference' : 'photo'}` : 'Saved ✓'}</Label>
          <Button title={adjust ? 'Done' : 'Adjust'} selected={adjust} onPress={() => setAdjust(!adjust)} />
        </Row>
        {adjust && adjusted ? <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Label small>Adjust</Label>
            {(['Reference', 'Photo'] as const).map((label, index) => <Pressable key={label} accessibilityRole="button" accessibilityLabel={`Adjust ${label.toLowerCase()}`} accessibilityState={{ selected: adjustReference === (index === 0) }} onPress={() => { setAdjustReference(index === 0); if (mode === 'Flip') setFlip(index === 0); }} style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderColor: adjustReference === (index === 0) ? p.primary : p.line }}><Text style={{ color: adjustReference === (index === 0) ? p.primary : p.muted, fontSize: 13 }}>{label}</Text></Pressable>)}
            <Label small>{Math.round(adjusted.scale * 100)}%</Label>
          </View>
          <View style={{ flexDirection: 'row', gap: 5 }}>
            {control('−', 'Make photo smaller', () => align('scale', fine ? -.01 : -.05))}{control('+', 'Make photo larger', () => align('scale', fine ? .01 : .05))}{control('←', 'Move photo left', () => align('x', fine ? -1 : -5))}{control('→', 'Move photo right', () => align('x', fine ? 1 : 5))}{control('↑', 'Move photo up', () => align('y', fine ? -1 : -5))}{control('↓', 'Move photo down', () => align('y', fine ? 1 : 5))}
          </View>
          <Row><Pressable accessibilityRole="button" accessibilityLabel="Fine adjustment: 1 pixel movement and 1 percent resizing" accessibilityState={{ selected: fine }} onPress={() => setFine(!fine)} style={{ minHeight: 44, paddingHorizontal: 10, justifyContent: 'center', borderWidth: 1, borderColor: fine ? p.primary : p.line, borderRadius: p.retro ? 0 : 8 }}><Text style={{ color: fine ? p.primary : p.muted, fontSize: 13 }}>{fine ? 'Fine ✓' : 'Fine'}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => updateData(d => ({ ...d, photos: d.photos.map(photo => photo.id === adjusted.id ? { ...photo, scale: 1, x: 0, y: 0 } : photo) }))} style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: p.primary, fontSize: 13 }}>Reset</Text></Pressable></Row>
        </View> : null}
        {mode === 'Flip' ? <Button title={flip ? 'Show comparison' : 'Show reference'} onPress={() => setFlip(!flip)} /> : null}
        {mode === 'Slider' ? <View accessible accessibilityRole="adjustable" accessibilityLabel="Photo comparison divider" accessibilityValue={{ min: 0, max: 100, now: Math.round(position) }} accessibilityActions={[{ name: 'increment', label: 'More reference photo' }, { name: 'decrement', label: 'More comparison photo' }]} onAccessibilityAction={event => setPosition(n => Math.max(0, Math.min(100, n + (event.nativeEvent.actionName === 'increment' ? 10 : -10))))} onLayout={event => setTrackWidth(event.nativeEvent.layout.width)} onStartShouldSetResponder={() => true} onResponderGrant={event => setPosition(Math.max(0, Math.min(100, event.nativeEvent.locationX / trackWidth * 100)))} onResponderMove={event => setPosition(Math.max(0, Math.min(100, event.nativeEvent.locationX / trackWidth * 100)))} style={{ height: 44, justifyContent: 'center', marginHorizontal: 10 }}>
          <View pointerEvents="none" style={{ height: 6, backgroundColor: p.grey, borderRadius: 3 }}><View style={{ height: 6, width: `${position}%`, backgroundColor: p.primary, borderRadius: 3 }} /></View><View pointerEvents="none" style={{ position: 'absolute', left: `${position}%`, marginLeft: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: p.primary }} />
        </View> : null}
        <Row>
          {reviewed ? <Label small>Reviewed today ✓</Label> : <Pressable accessibilityRole="button" onPress={() => updateData(d => ({ ...d, photoReviewedDates: [...new Set([...d.photoReviewedDates, today])] }))} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: p.muted, fontSize: 12 }}>Mark reviewed</Text></Pressable>}
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: more }} onPress={() => setMore(!more)} style={{ minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' }}><Text style={{ color: p.primary, fontSize: 13 }}>More {more ? '▴' : '▾'}</Text></Pressable>
        </Row>
        {more ? <View style={{ gap: 8, borderTopWidth: 1, borderColor: p.line, paddingTop: 8 }}>
          <Button title="Add another photo" disabled={busy} onPress={() => { void add(); }} />
          <Row><Button title="Export photo" disabled={busy} onPress={exportOriginal} /><Button title="Delete photo" disabled={busy} onPress={remove} /></Row>
        </View> : null}
      </>}
    </Card>
    {picker ? <PhotoPickerModal kind={picker} today={today} date={uploadDate} photos={photos} selectedId={picker === 'reference' ? reference?.id : selected?.id} onDate={date => { setCaptureDate(date === today ? null : date); setSelectedId(null); setFlip(false); setAdjust(false); setAdjustReference(false); setReelTarget('comparison'); setMore(false); setPicker(null); }} onPhoto={id => { if (picker === 'reference') setReferenceId(id); else { const photo = photos.find(item => item.id === id); if (photo) setCaptureDate(photo.date === today ? null : photo.date); setSelectedId(id); setFlip(false); } setPicker(null); }} onClose={() => setPicker(null)} /> : null}
  </Screen>;
}
