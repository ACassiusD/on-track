import type { DataSet, State } from '../domain/model';
export type Backup = { version: 1; capturedAt: string; timezone: string; real: DataSet; targets: { calories: number | null; weight: number | null; milestones: number[] }; photosIncluded: false };
export type BackupSummary = { days: number; weights: number; confirmations: number; revisions: number };
export function realSignature(state: State): string { return JSON.stringify({ real: state.real, target: state.target, goal: state.goal, milestones: state.milestones }); }
export function createBackup(state: State, now = new Date()): Backup { if (state.mode !== 'real') throw new Error('Switch to personal mode before creating a backup. Demo data is never uploaded.'); return JSON.parse(JSON.stringify({ version: 1, capturedAt: now.toISOString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, real: { ...state.real, photos: [] }, targets: { calories: state.target, weight: state.goal, milestones: state.milestones }, photosIncluded: false })) as Backup; }
export function backupSummary(b: Backup): BackupSummary { return { days: Object.keys(b.real.days).length, weights: b.real.weights.length, confirmations: b.real.confirmations.length, revisions: b.real.revisions.length }; }
const obj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown): v is string => typeof v === 'string' && v.length < 1024;
const number = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const answer = (v: unknown) => v === true || v === false || v === null;
const positive = (v: unknown) => v === null || number(v) && v > 0;
const date = (v: unknown): v is string => { if (!str(v) || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false; const d = new Date(`${v}T12:00:00Z`); return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v; };
const instant = (v: unknown): v is string => str(v) && Number.isFinite(Date.parse(v));
function source(v: unknown): boolean { return obj(v) && ['manual','notification','healthkit','app-intent'].includes(String(v.kind)) && str(v.id) && instant(v.observedAt) && str(v.timezone) && (v.providerBundleId === undefined || str(v.providerBundleId)) && (v.providerName === undefined || str(v.providerName)); }
export function validateBackup(value: unknown): Backup {
  const fail = () => { throw new Error('Backup format is invalid or unsupported. Your local records were not changed.'); };
  if (!obj(value) || value.version !== 1 || value.photosIncluded !== false || !instant(value.capturedAt) || !str(value.timezone) || !obj(value.real) || !obj(value.targets) || JSON.stringify(value).length > 2_000_000) return fail();
  const r = value.real; const t = value.targets;
  if (!obj(r.days) || !Array.isArray(r.weights) || !Array.isArray(r.confirmations) || !Array.isArray(r.revisions) || !Array.isArray(r.photos) || r.photos.length || !Array.isArray(r.photoReviewedDates) || r.photoReviewedDates.some(d => !date(d)) || !positive(t.calories) || t.calories !== null && !Number.isInteger(t.calories) || !positive(t.weight) || !Array.isArray(t.milestones) || t.milestones.some(m => !number(m) || m <= 0)) return fail();
  for (const [key, d] of Object.entries(r.days)) { if (!date(key) || !obj(d) || d.date !== key || !answer(d.food) || !answer(d.workout) || !answer(d.creatine) || !(d.calories === null || number(d.calories) && Number.isSafeInteger(d.calories) && d.calories >= 0) || !positive(d.target) || !Array.isArray(d.sources) || d.sources.some(s => !source(s))) return fail(); }
  for (const w of r.weights) if (!obj(w) || !str(w.id) || !date(w.date) || !number(w.pounds) || w.pounds <= 0 || !source(w.source)) return fail();
  for (const c of r.confirmations) if (!obj(c) || !str(c.id) || !date(c.date) || !number(c.total) || c.total < 0 || !instant(c.at) || !str(c.timezone)) return fail();
  for (const e of r.revisions) if (!obj(e) || !str(e.id) || !date(e.date) || !number(e.oldTotal) || !number(e.newTotal) || e.oldTotal < 0 || e.newTotal < 0 || !instant(e.at) || !str(e.reason) || !str(e.confirmationId) || !source(e.source)) return fail();
  return JSON.parse(JSON.stringify(value)) as Backup;
}
export function restoreBackup(state: State, backup: Backup, expectedSignature: string): State { if (state.mode !== 'real') throw new Error('Switch to personal mode before restoring.'); if (realSignature(state) !== expectedSignature) throw new Error('Local records changed after preview. Review the backup again before restoring.'); const verified = validateBackup(backup); return { ...state, real: { ...verified.real, photos: state.real.photos }, target: verified.targets.calories, goal: verified.targets.weight, milestones: verified.targets.milestones }; }
