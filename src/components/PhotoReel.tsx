import React, { useEffect, useRef } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { FramedPhoto } from './FramedPhoto';
import type { Photo } from '../domain/model';
import { useApp } from '../store/AppStore';
import { photoDateLabel } from './PhotoPickerModal';

export function PhotoReel({ photos, selectedId, target, onSelect }: {
  photos: Photo[]; selectedId?: string; target: 'reference' | 'comparison';
  onSelect: (photo: Photo) => void;
}) {
  const { palette: p, today } = useApp();
  const list = useRef<FlatList<Photo>>(null);
  const index = photos.findIndex(photo => photo.id === selectedId);
  const count = photos.length;
  useEffect(() => {
    if (index >= 0) list.current?.scrollToIndex({ index, animated: false, viewPosition: .5 });
  }, [index, count, target]);
  return <View style={{ gap: 6 }}>
    <Text style={{ color: p.muted, fontSize: 11 }}>Choose {target === 'reference' ? 'reference' : 'comparison'}</Text>
    <FlatList ref={list} horizontal data={photos} extraData={selectedId} keyExtractor={photo => photo.id} showsHorizontalScrollIndicator={false} initialNumToRender={8} getItemLayout={(_, itemIndex) => ({ length: 76, offset: 76 * itemIndex, index: itemIndex })} style={{ height: 100, flexGrow: 0 }} onLayout={() => { if (index >= 0) list.current?.scrollToIndex({ index, animated: false, viewPosition: .5 }); }} renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`Use ${photoDateLabel(item.date, today)} as ${target} photo`} accessibilityState={{ selected: item.id === selectedId }} onPress={() => onSelect(item)} style={{ width: 76, paddingHorizontal: 3, alignItems: 'center', gap: 4 }}>
      <View style={{ width: 70, height: 78, borderWidth: 2, borderColor: item.id === selectedId ? p.primary : 'transparent', borderRadius: p.retro ? 0 : 8, overflow: 'hidden' }}><FramedPhoto photo={item} label={`Progress photo ${item.date}`} /></View>
      <Text numberOfLines={1} style={{ color: item.id === selectedId ? p.primary : p.muted, fontSize: 10 }}>{photoDateLabel(item.date, today)}</Text>
    </Pressable>} />
  </View>;
}
