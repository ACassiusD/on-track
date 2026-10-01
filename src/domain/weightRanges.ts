export const weightRanges = [
  { days: 7, label: '7 days', averageLabel: '7-day average' },
  { days: 14, label: '14 days', averageLabel: '14-day average' },
  { days: 30, label: 'Month', averageLabel: 'Monthly average' },
  { days: 90, label: '3 months', averageLabel: '3-month average' },
  { days: 180, label: '6 months', averageLabel: '6-month average' },
  { days: 365, label: 'Year', averageLabel: 'Yearly average' },
] as const;
export type WeightWindow = typeof weightRanges[number]['days'];
