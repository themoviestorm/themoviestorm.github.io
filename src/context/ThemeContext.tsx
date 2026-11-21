import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
export type Palette = 'crimson' | 'amber' | 'aurora';
export type FontCombo = 'a' | 'b' | 'c';
export type PreviewMode = 'responsive' | 'phone-frame' | 'split';

interface ThemeContextType {
  theme: Theme;
  palette: Palette;
  fontCombo: FontCombo;
  previewMode: PreviewMode;
  isStudioOpen: boolean;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setPalette: (p: Palette) => void;
  setFontCombo: (f: FontCombo) => void;
  setPreviewMode: (m: PreviewMode) => void;
  setIsStudioOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  palette: 'crimson',
  fontCombo: 'a',
  previewMode: 'responsive',
  isStudioOpen: false,
  setTheme: () => {},
  toggleTheme: () => {},
  setPalette: () => {},
  setFontCombo: () => {},
  setPreviewMode: () => {},
  setIsStudioOpen: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('moviestorm_theme') as Theme;
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  const [palette, setPalette] = useState<Palette>(() => {
    const saved = localStorage.getItem('moviestorm_palette') as Palette;
    return saved === 'amber' || saved === 'aurora' || saved === 'crimson' ? saved : 'crimson';
  });

  const [fontCombo, setFontCombo] = useState<FontCombo>(() => {
    const saved = localStorage.getItem('moviestorm_font_combo') as FontCombo;
    return saved === 'a' || saved === 'b' || saved === 'c' ? saved : 'a';
  });

  const [previewMode, setPreviewMode] = useState<PreviewMode>('responsive');
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('moviestorm_theme', theme);
    localStorage.setItem('moviestorm_palette', palette);
    localStorage.setItem('moviestorm_font_combo', fontCombo);

    document.documentElement.className = `${theme} palette-${palette} font-combo-${fontCombo}`;
  }, [theme, palette, fontCombo]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        palette,
        fontCombo,
        previewMode,
        isStudioOpen,
        setTheme,
        toggleTheme,
        setPalette,
        setFontCombo,
        setPreviewMode,
        setIsStudioOpen
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
