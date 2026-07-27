import { useState, type FormEvent } from 'react';

export default function FeedbackView() {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!feedback.trim()) {
      setError('Please provide your feedback.');
      return;
    }

    setError('');
    setSubmitted(true);
  };

  const handleReset = () => {
    setFeedback('');
    setError('');
    setSubmitted(false);
  };

  return (
    <div className="feedback-page module-card">
      <div className="feedback-hero">
        <div>
          <p className="feedback-title">Your feedback ✍️</p>
          <h2>We are listening!</h2>
          <p className="feedback-subtext">
            Please provide as much info as needed so we can help you.
          </p>
        </div>
      </div>

      {!submitted ? (
        <form className="feedback-form" onSubmit={handleSubmit}>
          <label className="feedback-label" htmlFor="feedback-input">
            Your feedback
          </label>
          <textarea
            id="feedback-input"
            value={feedback}
            onChange={event => setFeedback(event.target.value)}
            placeholder="Tell us what you liked or what should improve..."
            className="feedback-input"
            rows={6}
          />
          {error && <p className="feedback-error">{error}</p>}

          <div className="feedback-actions">
            <button type="button" className="cancel-button" onClick={handleReset}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save ➜
            </button>
          </div>
        </form>
      ) : (
        <div className="feedback-success">
          <h3>Thank you for your feedback!</h3>
          <p>We received your message and will review it shortly.</p>
          <button className="save-button" onClick={handleReset}>
            Send Another
          </button>
        </div>
      )}
    </div>
  );
}
