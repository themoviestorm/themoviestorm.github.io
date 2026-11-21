export default function App() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#090b10',
      color: '#f4f6fb',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
        Movie Storm
      </h1>
      <p style={{ color: '#94a3b8', maxWidth: '480px', lineHeight: '1.6', margin: '0 auto 1.5rem' }}>
        Foundational infrastructure initialized. Ready for design system, catalog browsing, and 3D experience.
      </p>
      <div style={{
        display: 'inline-block',
        padding: '0.5rem 1rem',
        borderRadius: '9999px',
        backgroundColor: '#1e293b',
        color: '#38bdf8',
        fontSize: '0.875rem',
        fontWeight: 500
      }}>
        themoviestorm.github.io
      </div>
    </main>
  )
}
