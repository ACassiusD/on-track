import { addDays, emptyData, emptyDay, initialState } from './model.ts';
import type { State } from './model.ts';
export type DemoProfile = 'good' | 'mixed' | 'bad' | 'new';
export function selectDemoProfile(state: State, profile: DemoProfile, today: string): State {
  const demo = profile === 'new' ? emptyData() : initialState(today).demo;
  if (profile !== 'new') {
    demo.days = {};
    const successful = { good: 12, mixed: 8, bad: 4 }[profile];
    for (let i=13; i>=0; i--) {
      const date = addDays(today,-i);
      const within = i < successful;
      demo.days[date] = { ...emptyDay(date,1950), calories: within ? 1780+(i%3)*40 : 2200+(i%3)*70, food: true, workout: profile === 'good' ? i%7 !== 6 : profile === 'mixed' ? i%3 === 0 : i%7 === 0, creatine: profile === 'good' ? true : profile === 'mixed' ? i%3 !== 0 : i%4 === 0 };
    }
    demo.weights = demo.weights.map((w,i) => ({ ...w, pounds: Number((profile === 'good' ? 180-i*.16 + Math.sin(i)*.15 : profile === 'mixed' ? 175+Math.sin(i)*.4 : 173+i*.1+Math.sin(i)*.2).toFixed(1)) }));
  }
  return { ...state, mode: 'demo', demoProfile: profile, demo };
}
