import { ThemeName } from '../domain/model';
export type Palette = { bg: string; tile: string; text: string; muted: string; primary: string; accent: string; line: string; green: string; yellow: string; red: string; grey: string; radius: number; retro?: boolean; fantasy?: boolean; yellowSurface?: string; redSurface?: string };
export const themes: Record<ThemeName, Palette> = {
  'Neon Arcade': { bg: '#101329', tile: '#1a2040', text: '#f2f5ff', muted: '#b5bfdf', primary: '#72e3ef', accent: '#c6a6ff', line: '#333f65', green: '#a8e3ad', yellow: '#f5d384', red: '#ffb1c3', grey: '#293458', yellowSurface: '#493c21', redSurface: '#512c39', radius: 20 },
  'Cozy Quest': { bg: '#29231d', tile: '#3b3328', text: '#fff1d6', muted: '#d8c5a8', primary: '#bbdca0', accent: '#f2bc7a', line: '#655640', green: '#b6dd99', yellow: '#f7d68c', red: '#f7b39d', grey: '#544a3b', radius: 16 },
  'Pocket Arcade': { bg: '#281f40', tile: '#3c2e57', text: '#fff2fa', muted: '#dfbfdd', primary: '#ffc681', accent: '#e6a4ff', line: '#70518c', green: '#a6e3c4', yellow: '#ffdd91', red: '#ffaab7', grey: '#574568', radius: 28 },
  'Arcade Pop': { bg: '#08051a', tile: '#100c2b', text: '#fff4d8', muted: '#b6afd9', primary: '#35e9ff', accent: '#ff42dc', line: '#4c42bd', green: '#94ff68', yellow: '#ffee57', red: '#ff557d', grey: '#201a45', yellowSurface: '#3a3020', redSurface: '#46152e', radius: 0, retro: true },
  'Fantasy RPG': { bg: '#0b1619', tile: '#17282a', text: '#f7ead2', muted: '#c2baa0', primary: '#8ee1c1', accent: '#ebc77a', line: '#796340', green: '#a9daa0', yellow: '#eac66f', red: '#f0a48e', grey: '#284044', yellowSurface: '#483b24', redSurface: '#4b2c2a', radius: 8, fantasy: true },
  'Classic': { bg: '#111421', tile: '#1b2033', text: '#f4f6ff', muted: '#b0bad2', primary: '#9bccff', accent: '#c3afff', line: '#353f58', green: '#a8e3ad', yellow: '#f5d384', red: '#ffb1c3', grey: '#2a3042', radius: 18 },
};
