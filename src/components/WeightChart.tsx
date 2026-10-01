import React, { useState } from 'react';
import Svg, { Circle, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { useApp } from '../store/AppStore';
import { addDays, parseDate } from '../domain/model';
import { trendSeries } from '../domain/progress';
import type { TrendRange } from '../domain/progress';
import { displayedWeight } from '../domain/weightUnits';
import { Label } from './UI';
import { Pressable, Text, View } from 'react-native';
export function WeightChart({ range=28, compact=false }: { range?: TrendRange; compact?: boolean }) {
  const { data, today, state, palette:p }=useApp(); const unit = state?.weightUnit ?? 'lb'; const estimates=trendSeries(data,today,range).map(point => ({ ...point, average: point.average === null ? null : displayedWeight(point.average, unit) }));
  const [width, setWidth] = useState(326);
  const [selection, setSelection] = useState<string | null>(null);
  const measured = estimates.filter(point => data.weights.some(w => w.date === point.date));
  const singleDay = measured.length === 1;
  const points = singleDay ? measured : estimates;
  if (!points.length) return <View accessible accessibilityRole="image" accessibilityLabel="Weight chart: no weigh-ins yet" style={{ paddingVertical: 8 }}><Label small>Your trend starts with your first weigh-in.</Label></View>;
  const values=points.map(point=>point.average!); const lo=Math.min(...values)-.2; const hi=Math.max(...values)+.2;
  const start=singleDay || range==='all'?points[0].date:addDays(today,-range+1); const end=singleDay?start:today;
  const instant=(date:string)=>Date.parse(date+'T12:00:00Z'); const span=Math.max(86400000,instant(end)-instant(start));
  const x=(date:string)=>singleDay?175:36+(instant(date)-instant(start))/span*278; const y=(value:number)=>12+(hi-value)/(hi-lo)*77;
  // Missing measurement gaps longer than the average window are not drawn as a trend.
  const path=singleDay ? `M36,${y(points[0].average!)} L314,${y(points[0].average!)}` : points.map((point,i)=>`${i===0||instant(point.date)-instant(points[i-1].date)>7*86400000?'M':'L'}${x(point.date)},${y(point.average!)}`).join(' ');
  const height = compact ? 92 : 112;
  const scale = Math.min(width / 326, height / 112);
  const inset = (width - 326 * scale) / 2;
  const topInset = (height - 112 * scale) / 2;
  const selected = points.find(point => selection === `${range}:${unit}:${point.date}`);
  const bubbleX = selected ? Math.max(34, Math.min(174, x(selected.date) - 70)) : 0;
  const pointY = selected ? y(selected.average!) : 0;
  const above = pointY >= 54;
  const bubbleY = above ? pointY - 47 : pointY + 10;
  const bubbleFill = /^#[0-9a-f]{8}$/i.test(p.tile) ? p.tile.slice(0, 7) : p.tile;
  const arrowX = selected ? Math.max(bubbleX + 10, Math.min(bubbleX + 130, x(selected.date))) : 0;
  const dateLabel = (date: string) => parseDate(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{ height }}>
    <View pointerEvents="none" accessible accessibilityRole="image" accessibilityLabel={`Seven-day average weight trend in ${unit}, ${start} to ${end}. ${points.length} trend estimates. Gaps over seven days are disconnected.`}>
      <Svg width="100%" height={height} viewBox="0 0 326 112">
        {[lo,(lo+hi)/2,hi].map(value=><React.Fragment key={value}><Line x1={36} x2={314} y1={y(value)} y2={y(value)} stroke={p.line}/><SvgText x={0} y={y(value)+4} fontSize={10} fill={p.muted}>{value.toFixed(1)}</SvgText></React.Fragment>)}
        <Path d={path} stroke={p.primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {points.map(point=><Circle key={point.date} cx={x(point.date)} cy={y(point.average!)} r={selected?.date === point.date ? 6 : points.length === 1 ? 5 : 4} fill={p.primary} stroke={p.bg} strokeWidth={1.5}/>)}
        <SvgText x={singleDay ? 175 : 36} y={108} textAnchor={singleDay ? "middle" : "start"} fontSize={10} fill={p.muted}>{range==='all'||range>=180?start:start.slice(5)}</SvgText>
        {!singleDay ? <SvgText x={314} y={108} textAnchor="end" fontSize={10} fill={p.muted}>{range==='all'||range>=180?end:end.slice(5)}</SvgText> : null}
        {selected ? <>
          <Polygon points={above ? `${arrowX-5},${bubbleY+37} ${arrowX+5},${bubbleY+37} ${x(selected.date)},${pointY-4}` : `${arrowX-5},${bubbleY} ${arrowX+5},${bubbleY} ${x(selected.date)},${pointY+4}`} fill={bubbleFill} stroke={p.primary} strokeWidth={1}/>
          <Rect x={bubbleX} y={bubbleY} width={140} height={37} rx={p.retro ? 0 : 7} fill={bubbleFill} stroke={p.primary} strokeWidth={1}/>
          <SvgText x={bubbleX+70} y={bubbleY+15} textAnchor="middle" fontSize={13} fontWeight="700" fill={p.text}>{selected.average!.toFixed(1)} {unit}</SvgText>
          <SvgText x={bubbleX+70} y={bubbleY+29} textAnchor="middle" fontSize={9} fill={p.muted}>{dateLabel(selected.date)} · 7-day average</SvgText>
        </> : null}
      </Svg>
    </View>
    {points.map((point, i) => {
      const left = i ? (x(points[i-1].date)+x(point.date))/2 : Math.max(24,x(point.date)-22/scale);
      const right = i < points.length-1 ? (x(point.date)+x(points[i+1].date))/2 : Math.min(326,x(point.date)+22/scale);
      const key = `${range}:${unit}:${point.date}`;
      return <Pressable key={point.date} accessibilityRole="button" accessibilityLabel={`${dateLabel(point.date)}, seven-day average ${point.average!.toFixed(1)} ${unit}`} accessibilityHint="Show or hide this weight on the chart" accessibilityState={{ selected: selection === key }} onPress={() => setSelection(selection === key ? null : key)} style={{ position: 'absolute', left: inset+left*scale, top: Math.max(0,topInset+y(point.average!)*scale-22), width: Math.max(2,(right-left)*scale), height: 44 }} />;
    })}
    {selected ? <Text accessibilityLiveRegion="polite" style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}>{dateLabel(selected.date)}, seven-day average {selected.average!.toFixed(1)} {unit}</Text> : null}
  </View>;
}
