import React from 'react';
import {
  SlidersHorizontal, X, Sun, Moon, Palette as PaletteIcon,
  Type, Monitor, Smartphone, Sparkles, Check
} from 'lucide-react';
import { useTheme, Palette, FontCombo } from '../../context/ThemeContext';

export const DesignStudioDrawer: React.FC = () => {
  const {
    theme, palette, fontCombo, previewMode, isStudioOpen,
    setTheme, setPalette, setFontCombo, setPreviewMode, setIsStudioOpen
  } = useTheme();

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <button
        onClick={() => setIsStudioOpen(true)}
        className="studio-floating-trigger"
        title="Open Design & Styling Studio"
        aria-label="Open Design Studio"
      >
        <SlidersHorizontal size={18} />
        <span className="trigger-text">Design Studio</span>
        <span className="trigger-dot" />
      </button>

      {/* Slide-over Drawer / Modal Backdrop */}
      {isStudioOpen && (
        <div className="studio-drawer-backdrop" onClick={() => setIsStudioOpen(false)}>
          <div className="studio-drawer-panel" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="studio-drawer-header">
              <div className="studio-drawer-title-wrap">
                <PaletteIcon size={20} color="var(--accent-primary)" />
                <div>
                  <h3 className="studio-drawer-title">Design & Styling Lab</h3>
                  <span className="studio-drawer-sub">Live site-wide customization engine</span>
                </div>
              </div>
              <button
                onClick={() => setIsStudioOpen(false)}
                className="studio-drawer-close"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="studio-drawer-body">
              {/* Notice */}
              <div className="studio-info-banner">
                <Sparkles size={16} color="var(--accent-primary)" />
                <p>
                  Switch themes, palettes, and typography anytime. The entire website updates instantly across all views!
                </p>
              </div>

              {/* 1. Theme Switcher */}
              <div className="studio-section">
                <label className="studio-label">
                  <Sun size={15} /> Theme Mode
                </label>
                <div className="studio-pill-grid">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`studio-choice-btn ${theme === 'dark' ? 'active' : ''}`}
                  >
                    <Moon size={15} />
                    <span>Dark Cinema</span>
                    {theme === 'dark' && <Check size={14} className="choice-check" />}
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`studio-choice-btn ${theme === 'light' ? 'active' : ''}`}
                  >
                    <Sun size={15} />
                    <span>Light Gallery</span>
                    {theme === 'light' && <Check size={14} className="choice-check" />}
                  </button>
                </div>
              </div>

              {/* 2. Color Palette */}
              <div className="studio-section">
                <label className="studio-label">
                  <PaletteIcon size={15} /> Color Palette
                </label>
                <div className="studio-options-list">
                  {[
                    {
                      id: 'crimson' as Palette,
                      name: 'Cinema Crimson (Active)',
                      desc: 'Deep carbon noir with vibrant crimson CTA & champagne gold accents',
                      accent: '#e11d48'
                    },
                    {
                      id: 'amber' as Palette,
                      name: 'Amber Storm',
                      desc: 'Atmospheric storm ink with warm golden amber & electric cyan specs',
                      accent: '#f59e0b'
                    },
                    {
                      id: 'aurora' as Palette,
                      name: 'Aurora Violet',
                      desc: 'Midnight abyss with neon purple glows & cyber teal badges',
                      accent: '#8b5cf6'
                    }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPalette(p.id)}
                      className={`studio-palette-card ${palette === p.id ? 'active' : ''}`}
                    >
                      <div className="palette-color-swatch" style={{ background: p.accent }} />
                      <div className="palette-meta">
                        <div className="palette-name-row">
                          <span className="palette-name">{p.name}</span>
                          {palette === p.id && <Check size={14} color="var(--accent-primary)" />}
                        </div>
                        <p className="palette-desc">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Typography Pairing */}
              <div className="studio-section">
                <label className="studio-label">
                  <Type size={15} /> Typography Pairings
                </label>
                <div className="studio-options-list">
                  {[
                    {
                      id: 'a' as FontCombo,
                      name: 'Outfit + Plus Jakarta Sans + IBM Plex',
                      desc: 'Modern geometric cinema title + ultra-clean UI body + monospaced torrent specs'
                    },
                    {
                      id: 'b' as FontCombo,
                      name: 'Cinzel + Manrope + Fira Code',
                      desc: 'Grand cinematic serif titles + sharp contemporary UI + coding monospace'
                    },
                    {
                      id: 'c' as FontCombo,
                      name: 'Space Grotesk + DM Sans + Share Tech',
                      desc: 'Tech-forward streaming headlines + friendly neutral body + cyber specs'
                    }
                  ].map(fc => (
                    <button
                      key={fc.id}
                      onClick={() => setFontCombo(fc.id)}
                      className={`studio-palette-card ${fontCombo === fc.id ? 'active' : ''}`}
                    >
                      <div className="palette-meta">
                        <div className="palette-name-row">
                          <span className="palette-name">{fc.name}</span>
                          {fontCombo === fc.id && <Check size={14} color="var(--accent-primary)" />}
                        </div>
                        <p className="palette-desc">{fc.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Device Viewport Mode */}
              <div className="studio-section">
                <label className="studio-label">
                  <Monitor size={15} /> Device Simulation Canvas
                </label>
                <div className="studio-pill-grid">
                  <button
                    onClick={() => setPreviewMode('responsive')}
                    className={`studio-choice-btn ${previewMode === 'responsive' ? 'active' : ''}`}
                  >
                    <Monitor size={15} />
                    <span>Responsive Full</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode('phone-frame')}
                    className={`studio-choice-btn ${previewMode === 'phone-frame' ? 'active' : ''}`}
                  >
                    <Smartphone size={15} />
                    <span>Phone Mockup</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="studio-drawer-footer">
              <button onClick={() => setIsStudioOpen(false)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Apply & Keep Exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
