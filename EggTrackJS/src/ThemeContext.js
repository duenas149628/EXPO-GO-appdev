import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = '@eggtrack_theme';

const PALETTES = {
  light: {
    background: '#F4F7F4',
    surface: '#FFFFFF',
    text: '#1C2821',
    muted: '#738078',
    secondaryText: '#536258',
    border: '#E2E9E3',
    input: '#F8FAF8',
    primary: '#2D6A4F',
    primaryStrong: '#1C5138',
    primarySoft: '#E7F2EA',
    accent: '#3878A8',
    danger: '#C84D4D',
    dangerStrong: '#B43C3C',
    warning: '#B87911',
    chartGrid: '#E5ECE6',
    chartText: '#66756A',
  },
  dark: {
    background: '#101713',
    surface: '#18221B',
    text: '#EDF4EE',
    muted: '#A2B1A5',
    secondaryText: '#C0CCC2',
    border: '#2B392F',
    input: '#202C23',
    primary: '#8BD3A5',
    primaryStrong: '#24623F',
    primarySoft: '#203B2A',
    accent: '#8FC8F0',
    danger: '#F18A83',
    dangerStrong: '#A93F3F',
    warning: '#E9BD62',
    chartGrid: '#2B392F',
    chartText: '#A9B8AC',
  },
};

const COLOR_MAP = {
  '#F5F7FA': 'background',
  '#F3F4F6': 'background',
  '#FFFFFF': 'surface',
  '#000000': 'text',
  '#000': 'text',
  'BLACK': 'text',
  '#1C2821': 'text',
  '#111827': 'text',
  '#536258': 'secondaryText',
  '#66756A': 'chartText',
  '#738078': 'muted',
  '#6B7280': 'muted',
  '#4B5563': 'secondaryText',
  '#374151': 'secondaryText',
  '#9CA3AF': 'muted',
  '#E5E7EB': 'border',
  '#D1D5DB': 'border',
  '#F9FAFB': 'input',
  '#DC2626': 'danger',
  '#C84D4D': 'danger',
  '#2D6A4F': 'primary',
};

const TEXT_STYLE_NAME = /title|subtitle|text|label|value|name|amount|date|egg|quantity|threshold|method|status|stock|count|heading|unit|history|item|summary|description|role|empty|available|conversion|result|alert|info|total|mark|arrow|input/i;

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState('system');

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then(savedMode => {
        if (active && (savedMode === 'light' || savedMode === 'dark')) {
          setMode(savedMode);
        }
      })
      .catch(error => console.warn('Could not load theme preference:', error));

    return () => {
      active = false;
    };
  }, []);

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = PALETTES[isDark ? 'dark' : 'light'];

  const toggleTheme = useCallback(async () => {
    const nextMode = isDark ? 'light' : 'dark';
    setMode(nextMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch (error) {
      console.warn('Could not save theme preference:', error);
    }
  }, [isDark]);

  const value = useMemo(
    () => ({ colors, isDark, mode, toggleTheme }),
    [colors, isDark, mode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

export function useThemedStyles(baseStyles) {
  const { colors } = useTheme();
  return useMemo(() => {
    const themed = {};
    Object.entries(baseStyles).forEach(([name, style]) => {
      themed[name] = {};
      Object.entries(style).forEach(([property, value]) => {
        let colorToken = typeof value === 'string' ? COLOR_MAP[value.toUpperCase()] : null;
        if (value === '#FFFFFF' && property === 'color') colorToken = null;
        if (value === '#111827' && property === 'backgroundColor') colorToken = 'primaryStrong';
        if (value === '#DC2626' && property === 'backgroundColor') colorToken = 'dangerStrong';
        themed[name][property] = colorToken ? colors[colorToken] : value;
      });
      if (TEXT_STYLE_NAME.test(name) && !Object.prototype.hasOwnProperty.call(themed[name], 'color')) {
        themed[name].color = colors.text;
      }
    });
    return StyleSheet.create(themed);
  }, [baseStyles, colors]);
}
