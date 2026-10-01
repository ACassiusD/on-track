import { addDays, emptyData, emptyDay, initialState } from './model.ts';
import type { State } from './model.ts';
export type DemoProfile = 'thriving' | 'good' | 'mixed' | 'low' | 'bad' | 'new';
export function selectDemoProfile(state: State, profile: DemoProfile, today: string): State {
  const demo = profile === 'new' ? emptyData() : initialState(today).demo;
  if (profile !== 'new') {
    demo.days = {};
    const successful = { thriving: 14, good: 12, mixed: 8, low: 6, bad: 4 }[profile];
    for (let i=365; i>=0; i--) {
      const date = addDays(today,-i);
      const within = i % 14 < successful;
      demo.days[date] = { ...emptyDay(date,1950), calories: within ? 1780+(i%3)*40 : 2200+(i%3)*70, food: profile === 'bad' ? i%4 === 0 : profile === 'low' ? i%2 === 0 : true, workout: profile === 'good' ? i%3 === 0 : profile === 'thriving' ? i%7 !== 6 : profile === 'mixed' ? i%3 === 0 : i%7 === 0, creatine: profile === 'good' || profile === 'thriving' || profile === 'low' ? true : profile === 'mixed' ? i%3 !== 0 : i%4 === 0 };
    }
    demo.weights = demo.weights.filter(w => { const ago = Math.round((Date.parse(today) - Date.parse(w.date)) / 86400000); return profile === 'bad' ? ago % 7 === 0 : profile === 'low' ? ago % 3 === 0 : true; }).map(w => { const ago = Math.round((Date.parse(today) - Date.parse(w.date)) / 86400000); return { ...w, time: '14:00', pounds: Number((profile === 'good' || profile === 'thriving' ? 175.8 + ago * .055 + Math.sin(ago / 13) * .4 + Math.sin(ago) * .15 : profile === 'mixed' ? 175.5 + ago * .006 + Math.sin(ago / 17) * 1.1 + Math.sin(ago) * .3 : 178 - ago * .035 + Math.sin(ago / 15) * .6 + Math.sin(ago) * .2).toFixed(1)) }; });
  }
  return { ...state, mode: 'demo', demoProfile: profile, demo };
}

// Extend older demo installs without replacing edits or touching personal records.
export function extendDemoHistory(state: State, today: string): State {
  if (state.demoProfile === 'new') return state;
  const oldest = state.demo.weights.map(w => w.date).sort()[0];
  if (oldest && oldest <= addDays(today, -364)) return state;
  const generated = selectDemoProfile(state, state.demoProfile ?? 'mixed', today).demo;
  const weights = generated.weights.filter(w => (!oldest || w.date < oldest) && !state.demo.weights.some(old => old.date === w.date));
  const days = { ...generated.days, ...state.demo.days };
  return { ...state, demo: { ...state.demo, days, weights: [...weights, ...state.demo.weights].sort((a,b) => a.date.localeCompare(b.date)) } };
}
