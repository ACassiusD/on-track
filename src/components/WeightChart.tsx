import React from 'react';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';
import { useApp } from '../store/AppStore';
import { addDays, trend } from '../domain/model';
import { Label } from './UI';
export function WeightChart() {
  const { data, today, palette: p } = useApp(); const points = Array.from({ length: 28 }, (_, i) => { const date = addDays(today, i - 27); return { date, ...trend(data.weights, date) }; }).filter(point => point.average !== null);
  if (points.length < 2) return <Label small>Add weigh-ins to see your seven-day average line.</Label>;
  const values = points.map(point => point.average!); const lo = Math.min(...values) - .2; const hi = Math.max(...values) + .2; const x = (date: string) => 36 + (Date.parse(date + 'T12:00:00Z') - Date.parse(addDays(today, -27) + 'T12:00:00Z')) / 86400000 / 27 * 278; const y = (v: number) => 12 + (hi - v) / (hi - lo) * 77;
  const path = points.map((pt, i) => `${i ? 'L' : 'M'}${x(pt.date)},${y(pt.average!)}`).join(' ');
  return <Svg width="100%" height={112} viewBox="0 0 326 112" accessibilityLabel="Seven-day average weight trend across the last 28 days" accessible>{[lo, (lo + hi) / 2, hi].map(v => <React.Fragment key={v}><Line x1={36} x2={314} y1={y(v)} y2={y(v)} stroke={p.line} /><SvgText x={0} y={y(v) + 4} fontSize={10} fill={p.muted}>{v.toFixed(1)}</SvgText></React.Fragment>)}<Path d={path} stroke={p.primary} strokeWidth={3} fill="none" /><SvgText x={36} y={108} fontSize={10} fill={p.muted}>{addDays(today, -27).slice(5)}</SvgText><SvgText x={314} y={108} textAnchor="end" fontSize={10} fill={p.muted}>{today.slice(5)}</SvgText></Svg>;
}
