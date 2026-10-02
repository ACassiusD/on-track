export const defaultPets = [
  { id: 'mochi', name: 'Mochi Bunny', description: 'A soft little buddy with a growing sprout.' },
  { id: 'sprout', name: 'Sprout Spirit', description: 'A cheerful bean with a signature curl.' },
  { id: 'rice', name: 'Rice Buddy', description: 'A tiny rice-ball friend with a leaf tuft.' },
] as const;
export type DefaultPet = typeof defaultPets[number]['id'];
export function normalizeDefaultPet(value: unknown): DefaultPet {
  return defaultPets.find(pet => pet.id === value)?.id ?? 'mochi';
}
