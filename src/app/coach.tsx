import React, { useState } from 'react';
import { Alert, Share, Switch } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../store/AppStore';
import { useCloud } from '../store/CloudStore';
import { reviewFacts, nextAction, reviewText, chatGPTPrompt } from '../domain/coach';
import { Button, Card, Label, Row, Screen } from '../components/UI';

export default function Coach() {
  const { data, today, state } = useApp();
  const cloud = useCloud();
  const facts = reviewFacts(data, today);
  const [consent, setConsent] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [ai, setAI] = useState<string | null>(null);
  const [aiError, setAIError] = useState<string | null>(null);
  const requestAI = async () => {
    if (!consent || requesting || state.mode !== 'real') return;
    setRequesting(true); setAIError(null); setAI(null);
    try { setAI(await cloud.requestReview(facts)); }
    catch (e) { setAIError(e instanceof Error ? e.message : 'AI review unavailable. Your local review remains available.'); }
    finally { setRequesting(false); }
  };
  const [showExport, setShowExport] = useState(false);
  const [help, setHelp] = useState<'forgot' | 'overwhelmed' | 'later' | null>(null);
  return <Screen title="Check-in">
    <Card><Label>Next action</Label><Label>{nextAction(facts)}</Label><Button title="Review today’s food" primary onPress={() => router.push({ pathname: '/calories', params: { date: today, audit: 'yes' } })} /></Card>
    <Card><Label>Two-week review</Label><Label small>Previous and current calendar week · through today</Label><Label>{reviewText(facts, state.weightUnit ?? 'lb')}</Label><Label small>Calculated on this device. This review is not AI-generated.</Label></Card>
    <Card><Label>Make the next step smaller</Label><Row><Button title="Forgot something" selected={help === 'forgot'} onPress={() => setHelp('forgot')} /><Button title="Too much effort" selected={help === 'overwhelmed'} onPress={() => setHelp('overwhelmed')} /><Button title="Ate afterward" selected={help === 'later'} onPress={() => setHelp('later')} /></Row>
      {help ? <><Label>{help === 'overwhelmed' ? 'Just update the total you have right now. You can check the rest afterward.' : help === 'forgot' ? 'Add your best estimate in MyFitnessPal, then update this total. A correction is useful information.' : 'Update your total and repeat the short food check. Your earlier confirmation stays in history.'}</Label><Button title="Update calorie total" onPress={() => router.push({ pathname: '/calories', params: { date: today, edit: 'yes' } })} /></> : null}
    </Card>
    <Card><Label>AI review</Label><Label small>{facts.from}–{facts.through} · summary only, no photos</Label><Button title="Account" onPress={() => router.push('/account')} /><Row><Label small>Allow this summary to be sent to OpenAI</Label><Switch value={consent} onValueChange={setConsent} accessibilityLabel="Allow summary to be sent to OpenAI" /></Row><Button title={requesting ? 'Reviewing…' : 'Request AI review'} primary disabled={!consent || !cloud.session || state.mode !== 'real' || requesting} onPress={() => { void requestAI(); }} />{ai ? <Label>{ai}</Label> : null}{aiError ? <Label small>{aiError}</Label> : null}<Label small>Optional. Server credentials must be configured first. A review cannot change your records.</Label></Card>
    <Card><Label>ChatGPT review</Label><Label small>Optional export. Nothing is sent until you choose a destination in the share sheet. Photos and individual food items are excluded. Server AI requires a signed-in account and configured server credentials.</Label><Button title="Preview ChatGPT prompt" onPress={() => setShowExport(!showExport)} />{showExport ? <><Label small>{state.mode === 'demo' ? 'Illustrative demo data\n' : ''}{chatGPTPrompt(facts, state.weightUnit ?? 'lb')}</Label><Button title="Share this prompt" onPress={() => { void Share.share({ message: `${state.mode === 'demo' ? 'Illustrative demo data\n' : ''}${chatGPTPrompt(facts, state.weightUnit ?? 'lb')}` }).catch(() => Alert.alert('Could not share', 'Please try again.')); }} /></> : null}</Card>
  </Screen>;
}
