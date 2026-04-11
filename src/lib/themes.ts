// Theme color definitions
export interface ThemeColors {
  primary: string;      // Main accent color (e.g., violet-600)
  primaryLight: string; // Lighter variant (e.g., violet-500)
  primaryDark: string;  // Darker variant (e.g., violet-700)
  primaryGlow: string;  // Glow/shadow color
  accent: string;       // Secondary accent
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
}

export const THEMES: Theme[] = [
  {
    id: 'purple',
    name: 'Paars',
    colors: {
      primary: '139, 92, 246',      // violet-500
      primaryLight: '167, 139, 250', // violet-400
      primaryDark: '124, 58, 237',   // violet-600
      primaryGlow: '139, 92, 246',   // violet-500
      accent: '168, 85, 247',        // purple-500
    },
  },
  {
    id: 'blue',
    name: 'Blauw',
    colors: {
      primary: '59, 130, 246',       // blue-500
      primaryLight: '96, 165, 250',  // blue-400
      primaryDark: '37, 99, 235',    // blue-600
      primaryGlow: '59, 130, 246',   // blue-500
      accent: '14, 165, 233',        // sky-500
    },
  },
  {
    id: 'green',
    name: 'Groen',
    colors: {
      primary: '34, 197, 94',        // green-500
      primaryLight: '74, 222, 128',  // green-400
      primaryDark: '22, 163, 74',    // green-600
      primaryGlow: '34, 197, 94',    // green-500
      accent: '20, 184, 166',        // teal-500
    },
  },
  {
    id: 'red',
    name: 'Rood',
    colors: {
      primary: '239, 68, 68',        // red-500
      primaryLight: '248, 113, 113', // red-400
      primaryDark: '220, 38, 38',    // red-600
      primaryGlow: '239, 68, 68',    // red-500
      accent: '249, 115, 22',        // orange-500
    },
  },
  {
    id: 'orange',
    name: 'Oranje',
    colors: {
      primary: '249, 115, 22',       // orange-500
      primaryLight: '251, 146, 60',  // orange-400
      primaryDark: '234, 88, 12',    // orange-600
      primaryGlow: '249, 115, 22',   // orange-500
      accent: '245, 158, 11',        // amber-500
    },
  },
  {
    id: 'pink',
    name: 'Roze',
    colors: {
      primary: '236, 72, 153',       // pink-500
      primaryLight: '244, 114, 182', // pink-400
      primaryDark: '219, 39, 119',   // pink-600
      primaryGlow: '236, 72, 153',   // pink-500
      accent: '168, 85, 247',        // purple-500
    },
  },
  {
    id: 'cyan',
    name: 'Cyaan',
    colors: {
      primary: '6, 182, 212',        // cyan-500
      primaryLight: '34, 211, 238',  // cyan-400
      primaryDark: '8, 145, 178',    // cyan-600
      primaryGlow: '6, 182, 212',    // cyan-500
      accent: '14, 165, 233',        // sky-500
    },
  },
  {
    id: 'yellow',
    name: 'Geel',
    colors: {
      primary: '234, 179, 8',        // yellow-500
      primaryLight: '250, 204, 21',  // yellow-400
      primaryDark: '202, 138, 4',    // yellow-600
      primaryGlow: '234, 179, 8',    // yellow-500
      accent: '245, 158, 11',        // amber-500
    },
  },
];

export const DEFAULT_THEME = 'purple';

export function getTheme(themeId: string): Theme {
  return THEMES.find((t) => t.id === themeId) || THEMES[0];
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const { colors } = theme;

  root.style.setProperty('--theme-primary', colors.primary);
  root.style.setProperty('--theme-primary-light', colors.primaryLight);
  root.style.setProperty('--theme-primary-dark', colors.primaryDark);
  root.style.setProperty('--theme-primary-glow', colors.primaryGlow);
  root.style.setProperty('--theme-accent', colors.accent);
}
