export type WeightUnit = 'lb' | 'kg';
const KG_PER_LB = 0.45359237;
export function displayedWeight(pounds: number, unit: WeightUnit = 'lb'): number {
  return unit === 'kg' ? pounds * KG_PER_LB : pounds;
}
export function storedWeight(value: number, unit: WeightUnit = 'lb'): number {
  return unit === 'kg' ? value / KG_PER_LB : value;
}
export function formatWeight(pounds: number, unit: WeightUnit = 'lb'): string {
  return displayedWeight(pounds, unit).toFixed(1);
}
export function weightInput(pounds: number, unit: WeightUnit = 'lb'): string {
  return String(Number(formatWeight(pounds, unit)));
}
export function parseWeightInput(input: string, unit: WeightUnit = 'lb'): number {
  const text = input.trim();
  if (!/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(text)) throw new Error(`Enter a valid weight in ${unit}.`);
  const pounds = storedWeight(Number(text.replace(',', '.')), unit);
  if (!Number.isFinite(pounds) || pounds <= 0) throw new Error(`Enter a positive weight in ${unit}.`);
  return pounds;
}
