export default function FeedbackPage() {
  // Replace this URL with your actual Google Form URL
  const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdDemo1234567890/viewform?embedded=true';

  return (
    <div className="feedback-page container animate-fade-in">
      <div className="dashboard-header text-center">
        <h1>Share Your <span className="text-gradient">Feedback</span></h1>
        <p>Your feedback helps us improve our services. All responses are confidential.</p>
      </div>

      <div className="feedback-frame-wrapper animate-fade-in-up delay-1">
        {/* Google Form Embed */}
        <div style={{
          padding: 'var(--space-8)',
          textAlign: 'center',
          background: 'var(--color-bg-secondary)',
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-6)',
        }}>
          <div style={{ fontSize: '4rem' }}>📝</div>
          <h3>Feedback Form</h3>
          <p style={{ maxWidth: '400px' }}>
            To connect this to a real Google Form, replace the URL in{' '}
            <code style={{
              background: 'var(--color-bg-tertiary)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
            }}>
              FeedbackPage.jsx
            </code>
          </p>

          {/* Simulated Form Preview */}
          <div style={{
            width: '100%',
            maxWidth: '500px',
            textAlign: 'left',
          }}>
            <div className="flex-col gap-4" style={{ padding: 'var(--space-6)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
              <div className="form-group">
                <label className="form-label">How was your session? *</label>
                <div className="flex gap-3">
                  {['😞', '😐', '🙂', '😊', '🤩'].map((emoji, i) => (
                    <button
                      key={i}
                      className="btn btn-secondary btn-icon"
                      style={{ fontSize: '1.5rem' }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">What went well?</label>
                <textarea
                  className="form-textarea"
                  placeholder="Share what you found helpful..."
                  rows={3}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Anything you&apos;d like to improve?</label>
                <textarea
                  className="form-textarea"
                  placeholder="We value constructive feedback..."
                  rows={3}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Would you recommend MindCare?</label>
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-sm">Yes</button>
                  <button className="btn btn-outline btn-sm">Maybe</button>
                  <button className="btn btn-outline btn-sm">No</button>
                </div>
              </div>

              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} id="submit-feedback">
                Submit Feedback →
              </button>
            </div>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
            💡 In production, this page will embed your Google Form directly.
          </p>
        </div>
      </div>
    </div>
  );
}
