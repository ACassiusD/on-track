import React, { useState } from 'react';
import { Image, View } from 'react-native';
import type { Photo } from '../domain/model';
import { normalizeFraming, portraitFrame, type PhotoFraming } from '../domain/photoFraming';

export function FramedPhoto({ photo, uri = photo?.uri, framing = photo?.framing, label, onError }: { photo?: Photo; uri?: string; framing?: PhotoFraming; label?: string; onError?: () => void }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const box = portraitFrame(size.width, size.height);
  const frame = normalizeFraming(framing);
  return <View onLayout={event => setSize(event.nativeEvent.layout)} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
    {framing ? <View style={{ position: 'absolute', ...box, overflow: 'hidden' }}><Image source={{ uri }} accessibilityLabel={label} onError={onError} resizeMode="contain" style={{ width: '100%', height: '100%', transform: [{ translateX: frame.x * box.width }, { translateY: frame.y * box.height }, { scale: frame.zoom }] }} /></View>
      : <Image source={{ uri }} accessibilityLabel={label} onError={onError} resizeMode="contain" style={{ width: '100%', height: '100%', transform: [{ translateX: photo?.x ?? 0 }, { translateY: photo?.y ?? 0 }, { scale: photo?.scale ?? 1 }] }} />}
  </View>;
}
