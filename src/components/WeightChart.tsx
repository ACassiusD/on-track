import React from 'react';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { useApp } from '../store/AppStore';
import { addDays } from '../domain/model';
import { trendSeries } from '../domain/progress';
import type { TrendRange } from '../domain/progress';
import { Label } from './UI';
import { View } from 'react-native';
export function WeightChart({ range=28 }: { range?: TrendRange }) {
  const { data, today, palette:p }=useApp(); const points=trendSeries(data,today,range);
  if (!points.length) return <View><Svg width="100%" height={100} viewBox="0 0 326 100" accessibilityLabel="Weight chart: no weigh-ins yet" accessible>{[20,50,80].map(y => <Line key={y} x1={0} x2={326} y1={y} y2={y} stroke={p.line} strokeDasharray="4 5" />)}<SvgText x={163} y={55} textAnchor="middle" fontSize={12} fill={p.muted}>No weigh-ins yet</SvgText></Svg><Label small>Add your first weight to start the graph.</Label></View>;
  const values=points.map(point=>point.average!); const lo=Math.min(...values)-.2; const hi=Math.max(...values)+.2;
  const start=range==='all'?points[0].date:addDays(today,-range+1); const end=today;
  const instant=(date:string)=>Date.parse(date+'T12:00:00Z'); const span=Math.max(86400000,instant(end)-instant(start));
  const x=(date:string)=>36+(instant(date)-instant(start))/span*278; const y=(value:number)=>12+(hi-value)/(hi-lo)*77;
  // Missing measurement gaps longer than the average window are not drawn as a trend.
  const path=points.map((point,i)=>`${i===0||instant(point.date)-instant(points[i-1].date)>7*86400000?'M':'L'}${x(point.date)},${y(point.average!)}`).join(' ');
  return <View><Svg width="100%" height={112} viewBox="0 0 326 112" accessibilityLabel={`Seven-day average weight trend, ${start} to ${end}. ${points.length} trend estimates. Gaps over seven days are disconnected.`} accessible>{[lo,(lo+hi)/2,hi].map(value=><React.Fragment key={value}><Line x1={36} x2={314} y1={y(value)} y2={y(value)} stroke={p.line}/><SvgText x={0} y={y(value)+4} fontSize={10} fill={p.muted}>{value.toFixed(1)}</SvgText></React.Fragment>)}<Path d={path} stroke={p.primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none"/>{points.map(point=><Circle key={point.date} cx={x(point.date)} cy={y(point.average!)} r={points.length === 1 ? 5 : 2} fill={p.primary}/>)}<SvgText x={36} y={108} fontSize={10} fill={p.muted}>{range==='all'?start:start.slice(5)}</SvgText><SvgText x={314} y={108} textAnchor="end" fontSize={10} fill={p.muted}>{range==='all'?end:end.slice(5)}</SvgText></Svg>{points.length === 1 ? <Label small>First reading saved. Add another day to see the line.</Label> : null}</View>;
}
