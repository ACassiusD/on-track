// Replace individual adapters with development-build native modules/extensions later.
// Capability checks must distinguish unsupported, denied, unavailable, and ready.
export type CapabilityState = 'not-implemented' | 'unsupported' | 'permission-required' | 'denied' | 'ready';
export const capabilities: { name: string; state: CapabilityState; detail: string }[] = [
  { name: 'Apple Health', state: 'not-implemented', detail: 'Weight/workout/nutrition source verification and read permissions required.' },
  { name: 'Actionable reminders', state: 'permission-required', detail: 'Local iPhone notifications implemented. Enable and check permission/status in Reminders; delivery still requires on-device verification.' },
  { name: 'AlarmKit', state: 'not-implemented', detail: 'Native Swift adapter, authorization, and supported iOS checks required.' },
  { name: 'Widgets & Live Activities', state: 'not-implemented', detail: 'Native extensions and shared action/persistence bridge required.' },
];
