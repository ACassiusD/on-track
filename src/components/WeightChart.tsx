import React from 'react';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { useApp } from '../store/AppStore';
import { addDays } from '../domain/model';
import { trendSeries } from '../domain/progress';
import type { TrendRange } from '../domain/progress';
import { Label } from './UI';
import { View } from 'react-native';
export function WeightChart({ range=28, compact=false }: { range?: TrendRange; compact?: boolean }) {
  const { data, today, palette:p }=useApp(); const estimates=trendSeries(data,today,range);
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
  return <View accessible accessibilityRole="image" accessibilityLabel={`Seven-day average weight trend, ${start} to ${end}. ${points.length} trend estimates. Gaps over seven days are disconnected.`}><Svg width="100%" height={compact ? 92 : 112} viewBox="0 0 326 112">{[lo,(lo+hi)/2,hi].map(value=><React.Fragment key={value}><Line x1={36} x2={314} y1={y(value)} y2={y(value)} stroke={p.line}/><SvgText x={0} y={y(value)+4} fontSize={10} fill={p.muted}>{value.toFixed(1)}</SvgText></React.Fragment>)}<Path d={path} stroke={p.primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none"/>{points.map(point=><Circle key={point.date} cx={x(point.date)} cy={y(point.average!)} r={points.length === 1 ? 5 : 2} fill={p.primary}/>)}<SvgText x={singleDay ? 175 : 36} y={108} textAnchor={singleDay ? "middle" : "start"} fontSize={10} fill={p.muted}>{range==='all'||range>=180?start:start.slice(5)}</SvgText>{!singleDay ? <SvgText x={314} y={108} textAnchor="end" fontSize={10} fill={p.muted}>{range==='all'||range>=180?end:end.slice(5)}</SvgText> : null}</Svg></View>;
}
