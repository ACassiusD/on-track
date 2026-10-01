import React, { useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../store/AppStore';
import { applyGoalSetup, parseCalorieTarget, parseGoalWeight } from '../domain/goalSetup';
import { formatWeight, parseWeightInput, weightInput, type WeightUnit } from '../domain/weightUnits';
import { TimePicker } from '../components/TimePicker';
import { Button, Card, Field, Label, Row, Screen } from '../components/UI';
const steps = ['Daily calories', 'Goal weight', 'Milestones', 'Weigh-in time'];
export default function Goals() {
  return <GoalsSetup />;
}
function GoalsSetup() {
  const { state, commit, palette: p } = useApp();
  const [step, setStep] = useState(0);
  const [unit, setUnit] = useState<WeightUnit>(state.weightUnit ?? 'lb');
  const [target, setTarget] = useState(String(state.target ?? ''));
  const [goal, setGoal] = useState(state.goal === null ? '' : weightInput(state.goal, state.weightUnit ?? 'lb'));
  const [milestones, setMilestones] = useState([...state.milestones]);
  const [milestone, setMilestone] = useState('');
  const [time, setTime] = useState(state.weighInTime ?? '14:00');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const move = (next: number) => { Keyboard.dismiss(); setError(''); setStep(next); };
  const changeUnit = (next: WeightUnit) => {
    try {
      const pounds = parseGoalWeight(goal, unit, state.goal);
      setGoal(pounds === null ? '' : weightInput(pounds, next));
      setUnit(next); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Check your goal weight.'); }
  };
  const addMilestone = () => {
    if (!milestone.trim()) return true;
    try {
      const pounds = parseWeightInput(milestone, unit);
      if (milestones.some(n => weightInput(n, unit) === weightInput(pounds, unit))) throw new Error('That milestone is already added.');
      setMilestones(previous => [...previous, pounds].sort((a,b) => b-a));
      setMilestone(''); setError(''); return true;
    } catch (e) { setError(e instanceof Error ? e.message : 'Check your milestone weight.'); return false; }
  };
  const next = () => {
    try {
      if (step === 0) parseCalorieTarget(target);
      if (step === 1) parseGoalWeight(goal, unit, state.goal);
      if (step === 2 && !addMilestone()) return;
      move(step+1);
    } catch (e) { setError(e instanceof Error ? e.message : 'Check your entry.'); }
  };
  const save = async () => {
    setSaving(true); setError(''); Keyboard.dismiss();
    try { await commit(s => applyGoalSetup(s, { target, goal, unit, milestones, time })); router.back(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save your goals.'); }
    finally { setSaving(false); }
  };
  return <Screen title="Set your goals">
    <View style={{ gap: 8 }}><Label small>Step {step+1} of {steps.length}</Label><View style={{ flexDirection: 'row', gap: 5 }}>{steps.map((name,i)=><View key={name} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= step ? p.primary : p.line }} />)}</View></View>
    <Card>
      <Text accessibilityRole="header" style={{ color: p.text, fontSize: 24, lineHeight: 30, fontWeight: '700' }}>{step === 0 ? 'Your daily calorie target' : step === 1 ? 'What’s your goal weight?' : step === 2 ? 'Add a milestone' : 'When do you weigh in?'}</Text>
      <Text style={{ color: p.muted, fontSize: 14, lineHeight: 21 }}>{step === 0 ? 'The daily total you want to stay within.' : step === 1 ? 'Optional. A weight you want to work toward.' : step === 2 ? 'Optional. A nearer weight to reach on the way to your goal.' : 'A regular time helps keep your readings consistent.'}</Text>
      {step === 0 ? <><Field value={target} onChangeText={setTarget} placeholder="e.g. 1700" numeric /><Label small>kcal per day</Label></> : null}
      {step === 1 ? <><Row><Label small>Weight unit</Label><Row>{(['lb','kg'] as const).map(value=><Button key={value} title={value === 'lb' ? 'Pounds' : 'Kilograms'} selected={unit === value} onPress={() => changeUnit(value)} />)}</Row></Row><Field value={goal} onChangeText={setGoal} placeholder={unit === 'kg' ? 'e.g. 75' : 'e.g. 165'} numeric /><Label small>{unit === 'kg' ? 'Kilograms' : 'Pounds'}</Label></> : null}
      {step === 2 ? <>
        {goal.trim() ? <Label small>Goal: {goal} {unit}</Label> : null}
        <Field value={milestone} onChangeText={setMilestone} placeholder={unit === 'kg' ? 'e.g. 80' : 'e.g. 170'} numeric />
        <Button title="Add milestone" disabled={!milestone.trim()} onPress={() => { addMilestone(); }} />
        {milestones.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{milestones.map(n=><Pressable key={n} accessibilityRole="button" accessibilityLabel={`Remove milestone ${formatWeight(n, unit)} ${unit}`} onPress={() => setMilestones(values => values.filter(value => value !== n))} style={{ minHeight: 44, paddingHorizontal: 12, borderWidth: 1, borderColor: p.line, borderRadius: p.retro ? 0 : 10, backgroundColor: p.bg, flexDirection: 'row', alignItems: 'center', gap: 10 }}><Text style={{ color: p.text, fontSize: 14 }}>{formatWeight(n, unit)} {unit}</Text><Text style={{ color: p.muted }}>×</Text></Pressable>)}</View> : null}
      </> : null}
      {step === 3 ? <><TimePicker value={time} onChange={setTime} /><Label small>This sets your logging time. Reminders are separate in Settings.</Label></> : null}
      {error ? <Text accessibilityRole="alert" style={{ color: p.red, fontSize: 14 }}>{error}</Text> : null}
    </Card>
    <Row>{step > 0 ? <Button title="Previous" disabled={saving} onPress={() => move(step-1)} /> : null}<View style={{ flex: 1 }}><Button title={saving ? 'Saving…' : step === 3 ? 'Save goals' : 'Next'} primary disabled={saving} onPress={() => { if (step === 3) void save(); else next(); }} /></View></Row>
    {step < 3 ? <Pressable accessibilityRole="button" onPress={() => { if (step === 0) setTarget(String(state.target ?? '')); if (step === 1) setGoal(state.goal === null ? '' : weightInput(state.goal, unit)); if (step === 2) setMilestone(''); move(step+1); }} style={{ minHeight: 44, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: p.muted, fontSize: 14 }}>{step === 0 ? state.target === null ? 'Set later' : 'Keep current target' : step === 1 && state.goal !== null ? 'Keep current goal' : step === 2 && milestones.length ? 'Continue with these milestones' : 'Skip for now'}</Text></Pressable> : null}
  </Screen>;
}
