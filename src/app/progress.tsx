import React, { useState } from 'react';
import { Alert, Pressable, Share, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../store/AppStore';
import { dailyTasks, taskScore, taskSummary } from '../domain/dailyTasks';
import { milestoneProgress, periodSummary, shareSummary, TREND_COVERAGE, TrendRange } from '../domain/progress';
import { Button, Card, Label, Row, Screen } from '../components/UI';
import { ProgressBuddy } from '../components/ProgressBuddy';
import { buddyStatus } from '../domain/buddy';
import { formatWeight } from '../domain/weightUnits';
import { WeightChart } from '../components/WeightChart';

function Details({ title, children }: { title: string; children: React.ReactNode }) {
  const { palette: p } = useApp();
  const [open, setOpen] = useState(false);
  return <View style={{ gap: open ? 10 : 0 }}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <Text style={{ color: p.text, fontSize: 15, fontWeight: '600', flexShrink: 1 }}>{title}</Text><Text style={{ color: p.primary, fontSize: 20 }}>{open ? '−' : '+'}</Text>
    </Pressable>
    {open ? children : null}
  </View>;
}
export default function Progress() {
  const { data, state, today, palette: p } = useApp();
  const unit = state.weightUnit ?? 'lb';
  const [range, setRange] = useState<TrendRange>(28);
  const [preview, setPreview] = useState<string | null>(null);
  const buddy = buddyStatus(data, today);
  const period = periodSummary(data, today);
  const tasks = taskSummary(data, today);
  const weight = milestoneProgress(data, state, today);
  return <Screen title="Progress">
    <Card>
      <ProgressBuddy featured />
      {buddy.possible > 0 ? <Label small>{buddy.record}</Label> : null}
      <Details title="How your pet feels">
        <Label small>Every daily task counts equally: workout, creatine, logging calories, entering weight, and staying within your calorie target.</Label>
        <Label small>Your pet reflects completed tasks over the past 14 days, starting with your first entry. Missed days count after you start; an unfinished today waits until you finish logging calories.</Label>
        <Label small>Thriving: 90% or more complete, with at least 12 days of history.</Label>
        <Label small>Happy: 80% or more complete, with at least 10 days of history.</Label>
        <Label small>Doing okay: 50% or more complete, while building toward Happy.</Label>
        <Label small>Needs care: 35–49% complete. Needs a boost: below 35%.</Label>
        <Label small>Your pet gets to know your routine for the first 7 days.</Label>
        <Label small>Logging over target still earns the logging check. Weight changes never affect happiness—only entering it does. This reflects your habits, not a medical health score.</Label>
      </Details>
    </Card>
    {data.weights.length ? (<Card>
      <Row><Label>Weight trend</Label><Button title="Weigh-ins" onPress={() => router.push('/weight')} /></Row>
      <Row><Label big>{weight.current.average === null ? '—' : formatWeight(weight.current.average, unit)}<Label small> {unit}</Label></Label><View style={{ gap: 3 }}><Label small>7-day average</Label><Label small>{weight.current.coverage}/7 days measured</Label></View></Row>
      <View accessibilityLabel="Chart range" style={{ flexDirection: 'row', backgroundColor: p.bg, borderRadius: p.retro ? 0 : 8, padding: 3, gap: 3 }}>
        {([28, 90, 'all'] as const).map(r => <Pressable key={r} accessibilityRole="button" accessibilityState={{ selected: range === r }} onPress={() => setRange(r)} style={{ flex: 1, minHeight: 38, justifyContent: 'center', alignItems: 'center', borderRadius: p.retro ? 0 : 6, backgroundColor: range === r ? p.primary : 'transparent' }}><Text style={{ color: range === r ? p.bg : p.muted, fontSize: 13, fontWeight: '600' }}>{r === 'all' ? 'All time' : `${r} days`}</Text></Pressable>)}
      </View>
      <WeightChart range={range} />
      {weight.fraction !== null ? <><Row><Label small>{Math.round(weight.fraction * 100)}% to goal</Label><Label small>{formatWeight(weight.goal!, unit)} {unit}</Label></Row><View style={{ height: 6, backgroundColor: p.grey, borderRadius: 4, overflow: 'hidden' }}><View style={{ height: 6, width: `${weight.fraction * 100}%`, backgroundColor: p.primary }} /></View></> : weight.next !== null ? <Label small>Next checkpoint: {formatWeight(weight.next, unit)} {unit}</Label> : null}
      <Details title="Goals & trend details">
        <Label small>7-day averages; gaps over seven days stay disconnected.</Label>
        <Label small>{weight.qualified ? 'Enough readings for a measured trend.' : `Early estimate. Record at least ${TREND_COVERAGE} days in a seven-day window for a measured trend.`}</Label>
        {weight.baseline !== null ? <Label small>Baseline: {formatWeight(weight.baseline, unit)} {unit} · {weight.baselineDate}</Label> : <Label small>Set a goal and keep weighing in to establish a baseline.</Label>}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{weight.milestones.map(n => <Text key={n} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: p.grey, color: weight.reached.includes(n) ? p.primary : p.text, fontSize: 14 }}>{weight.reached.includes(n) ? '✓ ' : ''}{formatWeight(n, unit)} {unit}</Text>)}</View>
        <Label small>Checkpoints require at least {TREND_COVERAGE}/7 measured days. Estimates stay provisional below that; checkpoints are not permanent awards.</Label>
      </Details>
    </Card>) : <Card><Row><Label>Weight</Label><Button title="Add weight" primary onPress={() => router.push('/weight')} /></Row><Label small>Your trend starts with your first weigh-in.</Label></Card>}
    <Card>
      <Label>Daily tasks</Label><Label small>This week + last week · {tasks.dates.length} days</Label>
      {tasks.totals.some(t => t.known > 0) ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{tasks.totals.map(t => <View key={t.label} style={{ width: '47%', flexGrow: 1, backgroundColor: p.bg, padding: 10, borderRadius: p.retro ? 0 : 8, gap: 6 }}><Text style={{ color: p.muted, fontSize: 13 }}>{t.label === 'Weight entered' ? 'Weight' : t.label}</Text><Text style={{ color: p.text, fontSize: 22, fontWeight: '700' }}>{t.done}<Text style={{ color: p.muted, fontSize: 13 }}> / {t.days}</Text></Text><View style={{ height: 4, backgroundColor: p.grey, borderRadius: 3, overflow: 'hidden' }}><View style={{ height: 4, width: `${t.done / t.days * 100}%`, backgroundColor: p.primary }} /></View></View>)}</View> : <Label small>Complete today’s tasks to start your history.</Label>}
      <Details title="Logging details">
        <Label small>{period.dates[0]} → {today} · future days excluded</Label>
        {tasks.totals.map(t => <Label key={t.label} small>{t.label}: {t.known} reported · {t.unknown} unknown</Label>)}
        <Label small>{tasks.completeDays}/{tasks.dates.length} days with all five tasks complete.</Label>
        <Label small>Calories logged counts even over target. Within target is a separate automatic task, earned after logging is finished.</Label>
        <Label>{period.meanCompleteCalories === null ? '—' : Math.round(period.meanCompleteCalories).toLocaleString()} kcal average</Label>
        <Label small>From {period.completeCalorieDays} fully logged days; this is recorded intake.</Label>
        <Label small>{period.revisionCount} corrections across {period.revisedDays} days. Earlier confirmed totals stay in your history.</Label>
      </Details>
    </Card>
    <Card><Details title="Day history">{period.rows.slice().reverse().map(({ date }) => <Pressable key={date} accessibilityRole="button" accessibilityLabel={`${date}, ${taskScore(data, date).count} of 5 tasks complete. Open day.`} onPress={() => router.push({ pathname: '/day', params: { date } })} style={{ minHeight: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: p.line }}><Text style={{ color: p.text, fontSize: 14 }}>{date}</Text><Label small>{taskScore(data, date).count}/5 · {dailyTasks(data, date).filter(c => c.value === null).length} unknown</Label></Pressable>)}</Details></Card>
    <Button title="Share progress" onPress={() => setPreview(shareSummary(data, state, today))} />
    {preview !== null ? <Card><Label>Share preview</Label><Label small>{preview}</Label><Row><Button title="Cancel" onPress={() => setPreview(null)} /><Button title="Share" primary onPress={() => { void Share.share({ message: preview }).catch(() => Alert.alert('Could not open share sheet')); }} /></Row></Card> : null}
  </Screen>;
}
