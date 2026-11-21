import { useState } from 'react'
import './styles.css'
import {
  Sun, Moon, Monitor, Smartphone, Sparkles, Download, Copy,
  Check, Play, Star, Film, Flame, Heart, MessageSquare, Compass,
  ShieldCheck
} from 'lucide-react'

// Sample movies with high quality posters
const SAMPLE_MOVIES = [
  {
    id: '1',
    title: 'Dune: Part Two',
    year: 2024,
    rating: 8.6,
    quality: '4K UHD',
    runtime: '166 min',
    tags: ['Sci-Fi', 'Adventure'],
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1400&auto=format&fit=crop',
    audio: '7.1 Atmos',
    size: '18.4 GB',
    seeders: 4210,
    leechers: 320,
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.'
  },
  {
    id: '2',
    title: 'Interstellar',
    year: 2014,
    rating: 8.7,
    quality: '4K Remux',
    runtime: '169 min',
    tags: ['Sci-Fi', 'Drama'],
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    audio: '5.1 DTS-HD',
    size: '14.2 GB',
    seeders: 2890,
    leechers: 190
  },
  {
    id: '3',
    title: 'Blade Runner 2049',
    year: 2017,
    rating: 8.0,
    quality: '1080p BluRay',
    runtime: '164 min',
    tags: ['Cyberpunk', 'Mystery'],
    poster: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop',
    audio: '7.1 TrueHD',
    size: '8.6 GB',
    seeders: 1740,
    leechers: 95
  },
  {
    id: '4',
    title: 'The Dark Knight',
    year: 2008,
    rating: 9.0,
    quality: '4K IMAX',
    runtime: '152 min',
    tags: ['Action', 'Crime'],
    poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600&auto=format&fit=crop',
    audio: '5.1 Surround',
    size: '12.1 GB',
    seeders: 3510,
    leechers: 210
  }
]

const TORRENT_TIERS = [
  {
    quality: '2160p 4K UHD',
    codec: 'HEVC x265 10-bit',
    source: 'Remux BluRay',
    audio: 'Dolby Atmos 7.1 TrueHD',
    size: '22.8 GB',
    seeders: 2840,
    leechers: 180,
    name: 'Dune.Part.Two.2024.2160p.UHD.Remux.HEVC.DV.Atmos.mkv'
  },
  {
    quality: '1080p BluRay',
    codec: 'x265 High Profile',
    source: 'WEB-DL',
    audio: 'DDP 5.1 Atmos',
    size: '4.8 GB',
    seeders: 5120,
    leechers: 420,
    name: 'Dune.Part.Two.2024.1080p.WEB-DL.DDP5.1.Atmos.x265.mkv'
  },
  {
    quality: '720p HD',
    codec: 'x264 Efficient',
    source: 'WEB-DL',
    audio: 'AAC 2.0 Stereo',
    size: '1.6 GB',
    seeders: 1980,
    leechers: 90,
    name: 'Dune.Part.Two.2024.720p.WEB-DL.AAC2.0.x264.mkv'
  }
]

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [palette, setPalette] = useState<'amber' | 'aurora' | 'crimson'>('amber')
  const [fontCombo, setFontCombo] = useState<'a' | 'b' | 'c'>('a')
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile' | 'split'>('desktop')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'search' | 'saved' | 'chat'>('home')

  const handleCopy = (index: number) => {
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className={`${theme} palette-${palette} font-combo-${fontCombo}`}>
      {/* =========================================================================
          STUDIO CONTROLLER TOOLBAR (STICKY TOP)
         ========================================================================= */}
      <header className="lab-header">
        <div className="lab-header-content">
          <div className="lab-title-group">
            <div className="lab-logo-pill">
              <Film size={22} color="var(--accent-primary)" />
              <span>Movie Storm</span>
            </div>
            <span className="lab-badge">Design Studio</span>
          </div>

          <div className="lab-controls-group">
            {/* Theme Toggle */}
            <div className="control-pill" title="Switch Theme">
              <button
                className={`control-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <Moon size={14} /> Dark
              </button>
              <button
                className={`control-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <Sun size={14} /> Light
              </button>
            </div>

            {/* Color Palette Toggle */}
            <div className="control-pill" title="Choose Color Palette">
              <button
                className={`control-btn ${palette === 'amber' ? 'active' : ''}`}
                onClick={() => setPalette('amber')}
              >
                Amber Storm
              </button>
              <button
                className={`control-btn ${palette === 'aurora' ? 'active' : ''}`}
                onClick={() => setPalette('aurora')}
              >
                Aurora Violet
              </button>
              <button
                className={`control-btn ${palette === 'crimson' ? 'active' : ''}`}
                onClick={() => setPalette('crimson')}
              >
                Cinema Crimson
              </button>
            </div>

            {/* Typography Font Preset Toggle */}
            <div className="control-pill" title="Choose Typography Pairing">
              <button
                className={`control-btn ${fontCombo === 'a' ? 'active' : ''}`}
                onClick={() => setFontCombo('a')}
              >
                Outfit + Jakarta
              </button>
              <button
                className={`control-btn ${fontCombo === 'b' ? 'active' : ''}`}
                onClick={() => setFontCombo('b')}
              >
                Cinzel + Manrope
              </button>
              <button
                className={`control-btn ${fontCombo === 'c' ? 'active' : ''}`}
                onClick={() => setFontCombo('c')}
              >
                Space + DM Sans
              </button>
            </div>

            {/* Device Viewport Mode */}
            <div className="control-pill" title="Device Preview">
              <button
                className={`control-btn ${viewportMode === 'desktop' ? 'active' : ''}`}
                onClick={() => setViewportMode('desktop')}
              >
                <Monitor size={14} /> Desktop
              </button>
              <button
                className={`control-btn ${viewportMode === 'mobile' ? 'active' : ''}`}
                onClick={() => setViewportMode('mobile')}
              >
                <Smartphone size={14} /> Phone
              </button>
              <button
                className={`control-btn ${viewportMode === 'split' ? 'active' : ''}`}
                onClick={() => setViewportMode('split')}
              >
                Both
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN STUDIO SHOWCASE CANVAS
         ========================================================================= */}
      <div className="studio-container">

        {/* View mode notice */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          fontSize: '0.825rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="var(--accent-primary)" />
            <span>
              Active Typography: <strong>{
                fontCombo === 'a' ? 'Outfit (Display) + Plus Jakarta Sans (UI) + IBM Plex Mono (Specs)' :
                fontCombo === 'b' ? 'Cinzel (Editorial) + Manrope (UI) + Fira Code (Specs)' :
                'Space Grotesk (Display) + DM Sans (UI) + Share Tech Mono (Specs)'
              }</strong>
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Hover cards for real 3D depth
          </span>
        </div>

        {/* =====================================================================
            DESKTOP LAYOUT VIEW
           ===================================================================== */}
        {(viewportMode === 'desktop' || viewportMode === 'split') && (
          <section>
            {/* 3D Hero Stage */}
            <div className="hero-stage">
              <div className="hero-backdrop-glow" />
              <div className="hero-particle-grid" />

              <div className="hero-info-side">
                <div className="hero-eyebrow">
                  <Flame size={14} /> Top Trending Movie • 4K Dolby Vision
                </div>
                <h1 className="hero-title">{SAMPLE_MOVIES[0].title}</h1>
                <div className="hero-meta">
                  <span className="rating-badge">
                    <Star size={13} fill="#f59e0b" color="#f59e0b" /> {SAMPLE_MOVIES[0].rating}
                  </span>
                  <span>{SAMPLE_MOVIES[0].year}</span>
                  <span>•</span>
                  <span>{SAMPLE_MOVIES[0].runtime}</span>
                  <span>•</span>
                  <span className="quality-pill">{SAMPLE_MOVIES[0].quality}</span>
                  <span className="quality-pill">{SAMPLE_MOVIES[0].audio}</span>
                </div>
                <p className="hero-description">
                  {SAMPLE_MOVIES[0].synopsis}
                </p>
                <div className="hero-actions">
                  <button className="btn-primary">
                    <Download size={18} /> Download Torrent
                  </button>
                  <button className="btn-secondary">
                    <Play size={18} /> Watch Trailer
                  </button>
                  <button className="btn-secondary" title="Add to Favorites">
                    <Heart size={18} />
                  </button>
                </div>
              </div>

              {/* 3D Interactive Poster with Ambient Lighting */}
              <div className="hero-visual-side">
                <div className="hero-3d-poster-stage">
                  <div className="hero-3d-card">
                    <img src={SAMPLE_MOVIES[0].poster} alt="Hero Poster" />
                    <div className="hero-3d-reflection" />
                  </div>
                  <div className="floating-spec-badge">
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>2160p HEVC</span>
                    <span>18.4 GB • 4.2k seeds</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Catalog Grid Section with 3D Card Hover */}
            <div className="section-header">
              <div>
                <h2 className="section-title">Published Titles</h2>
                <p className="section-subtitle">Adaptive 3D cards with hover tilt, crisp typography, and torrent health indicators</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="quality-pill">All ({SAMPLE_MOVIES.length})</span>
                <span className="quality-pill">Movies</span>
                <span className="quality-pill">Series</span>
              </div>
            </div>

            <div className="cards-grid">
              {SAMPLE_MOVIES.map((movie) => (
                <div key={movie.id} className="card-3d-wrapper">
                  <div className="card-3d-inner">
                    <div className="card-poster-frame">
                      <img src={movie.poster} alt={movie.title} loading="lazy" />
                      <div className="card-poster-overlay">
                        <div className="card-badges-row">
                          <span className="quality-pill" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                            {movie.quality}
                          </span>
                          <span className="rating-badge" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                            ★ {movie.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="card-details">
                      <div className="card-title">{movie.title}</div>
                      <div className="card-sub">
                        <span>{movie.year} • {movie.runtime}</span>
                        <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{movie.size}</span>
                      </div>
                      <div className="card-tech-strip">
                        <span>{movie.audio}</span>
                        <span style={{ color: '#10b981' }}>▲ {movie.seeders}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Torrent Tier Download Table */}
            <div className="torrent-table-card">
              <div className="torrent-table-header">
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
                    Torrent Quality Tiers & Direct Magnet Links
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Formatted with monospaced technical font for clean hash and spec inspection
                  </p>
                </div>
                <div className="quality-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={14} /> Verified Public Trackers
                </div>
              </div>

              {TORRENT_TIERS.map((tier, idx) => (
                <div key={idx} className="torrent-row">
                  <div className="torrent-quality">{tier.quality}</div>
                  <div>
                    <div className="torrent-name">{tier.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tier.codec} • {tier.audio} • {tier.source}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {tier.size}
                  </div>
                  <div className="torrent-health">
                    <span className="seeders-count">▲ {tier.seeders}</span>
                    <span className="leechers-count">▼ {tier.leechers}</span>
                  </div>
                  <div className="torrent-btn-group">
                    <button
                      className="btn-icon-copy"
                      onClick={() => handleCopy(idx)}
                      title="Copy Magnet URI"
                    >
                      {copiedIndex === idx ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      {copiedIndex === idx ? 'Copied!' : 'Magnet'}
                    </button>
                    <button className="btn-icon-copy" style={{ background: 'rgba(var(--accent-primary-rgb), 0.15)', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
                      <Download size={14} /> .torrent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================================
            SMARTPHONE SIMULATION VIEW
           ===================================================================== */}
        {(viewportMode === 'mobile' || viewportMode === 'split') && (
          <section className="smartphone-comparison-stage">
            <div style={{ textAlign: 'center' }}>
              <h2 className="section-title">Smartphone Ergonomics & Compact View</h2>
              <p className="section-subtitle">
                Engineered for thumb-zone navigation, swipeable horizontal shelves, and compact torrent links
              </p>
            </div>

            {/* Mobile Device Frame */}
            <div className="phone-mockup-frame">
              <div className="phone-notch" />

              <div className="phone-screen-scroll">
                {/* Mobile Top Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>
                    <Film size={18} color="var(--accent-primary)" />
                    <span>Movie Storm</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', background: 'rgba(var(--accent-primary-rgb),0.15)', color: 'var(--accent-primary)', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    4K HDR
                  </div>
                </div>

                {/* Mobile Featured Card */}
                <div style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  aspectRatio: '16 / 9',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <img src={SAMPLE_MOVIES[0].backdrop} alt="Featured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '0.75rem'
                  }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#1 TODAY</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>{SAMPLE_MOVIES[0].title}</span>
                  </div>
                </div>

                {/* Mobile Horizontal Carousel */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>Trending Movies</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>See all</span>
                </div>

                <div className="phone-card-shelf">
                  {SAMPLE_MOVIES.map((movie) => (
                    <div key={movie.id} className="phone-shelf-item">
                      <div style={{ borderRadius: '10px', overflow: 'hidden', aspectRatio: '2 / 3', background: 'var(--bg-surface)', marginBottom: '0.4rem', border: '1px solid var(--border-color)' }}>
                        <img src={movie.poster} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {movie.title}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        <span>★ {movie.rating}</span>
                        <span>{movie.year}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile Torrent Bottom-Sheet Preview */}
                <div style={{
                  marginTop: '1.25rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '0.9rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem' }}>Quick Download</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-secondary)' }}>2160p 4K</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    18.4 GB • Dolby Atmos 7.1 • ▲ 4,210 seeds
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-primary" style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', justifyContent: 'center' }}>
                      <Download size={14} /> Get Torrent
                    </button>
                    <button className="btn-secondary" style={{ padding: '0.55rem 0.75rem', fontSize: '0.8rem' }}>
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Native Bottom Navigation Bar */}
              <div className="phone-bottom-nav">
                <div
                  className={`phone-nav-item ${activeMobileTab === 'home' ? 'active' : ''}`}
                  onClick={() => setActiveMobileTab('home')}
                >
                  <Compass size={18} />
                  <span>Explore</span>
                </div>
                <div
                  className={`phone-nav-item ${activeMobileTab === 'search' ? 'active' : ''}`}
                  onClick={() => setActiveMobileTab('search')}
                >
                  <Flame size={18} />
                  <span>Trending</span>
                </div>
                <div
                  className={`phone-nav-item ${activeMobileTab === 'saved' ? 'active' : ''}`}
                  onClick={() => setActiveMobileTab('saved')}
                >
                  <Heart size={18} />
                  <span>Favorites</span>
                </div>
                <div
                  className={`phone-nav-item ${activeMobileTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveMobileTab('chat')}
                >
                  <MessageSquare size={18} />
                  <span>Support</span>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
