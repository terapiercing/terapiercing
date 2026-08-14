export interface ThemeColors {
  primary: string
  primaryDark: string
  primaryLight: string
  secondary: string
  background: string
}

export interface Theme {
  id: string
  label: string
  colors: ThemeColors
}

export const THEMES: Record<string, Theme> = {
  terra: {
    id: 'terra',
    label: 'Terracota',
    colors: {
      primary: '#C4917B',
      primaryDark: '#A87060',
      primaryLight: '#F5E6DF',
      secondary: '#D4AF37',
      background: '#FDFAF8',
    },
  },
  oliva: {
    id: 'oliva',
    label: 'Oliva Sálvia',
    colors: {
      primary: '#7C8B6E',
      primaryDark: '#61705A',
      primaryLight: '#E8EDE2',
      secondary: '#B7A05B',
      background: '#F7F9F4',
    },
  },
  rosa: {
    id: 'rosa',
    label: 'Rosa Quartzo',
    colors: {
      primary: '#D9A6B4',
      primaryDark: '#BE8294',
      primaryLight: '#F8EAF0',
      secondary: '#C9A08C',
      background: '#FBF5F7',
    },
  },
  lavanda: {
    id: 'lavanda',
    label: 'Lavanda Serena',
    colors: {
      primary: '#A49BD9',
      primaryDark: '#857BC4',
      primaryLight: '#ECEAF8',
      secondary: '#B99B6B',
      background: '#F8F7FB',
    },
  },
  ceu: {
    id: 'ceu',
    label: 'Céu Pastel',
    colors: {
      primary: '#8FB4D6',
      primaryDark: '#6E97BC',
      primaryLight: '#E7F0F8',
      secondary: '#C0A26B',
      background: '#F6F9FC',
    },
  },
}

export const THEME_IDS = Object.keys(THEMES)

export function isThemeId(value: string | null | undefined): value is string {
  return !!value && Object.prototype.hasOwnProperty.call(THEMES, value)
}
