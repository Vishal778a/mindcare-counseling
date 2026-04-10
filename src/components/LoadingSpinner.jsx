export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="spinner-overlay">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto var(--space-4)' }}></div>
        <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>{text}</p>
      </div>
    </div>
  );
}
