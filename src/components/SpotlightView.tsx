interface SpotlightViewProps {
  onContinue: () => void;
}

const spotlightCards = [
  { title: 'Mindful Learning', description: 'Discover study strategies that help you focus and retain more.', badge: 'Study Tip' },
  { title: 'Exam Ready', description: 'Top reminders to review before exams and boost your confidence.', badge: 'Exam' },
  { title: 'Creative Notes', description: 'Use diagrams, charts, and color to make learning memorable.', badge: 'Skills' },
  { title: 'Healthy Habits', description: 'Small routines for better concentration and energy during classes.', badge: 'Wellness' },
  { title: 'Time Mastery', description: 'Plan your day with short breaks and consistent practice sessions.', badge: 'Productivity' },
  { title: 'Group Power', description: 'Study with peers to solve problems faster and learn new perspectives.', badge: 'Collaboration' },
  { title: 'Goal Tracker', description: 'Set a daily target and celebrate every lesson you complete.', badge: 'Motivation' },
  { title: 'Ask Questions', description: 'Curiosity is your best learning tool — never hesitate to ask.', badge: 'Confidence' },
  { title: 'Smart Revision', description: 'Repeat key ideas in short bursts to make them stick longer.', badge: 'Revision' },
  { title: 'Future Focus', description: 'Connect what you learn today to the success you want tomorrow.', badge: 'Vision' },
];

export default function SpotlightView({ onContinue }: SpotlightViewProps) {
  return (
    <div className="spotlight-page module-card">
      <div className="spotlight-header">
        <div>
          <p className="spotlight-label">Spotlight</p>
          <h2>Latest learning highlights</h2>
          <p className="spotlight-subtext">
            Explore ten spotlight cards with key study ideas, activities, and motivation for your dashboard.
          </p>
        </div>
      </div>

      <div className="spotlight-list">
        {spotlightCards.map(card => (
          <article key={card.title} className="spotlight-card">
            <div className="spotlight-card-top">
              <span className="spotlight-card-badge">{card.badge}</span>
            </div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </article>
        ))}
      </div>

      <div className="spotlight-footer">
        <button className="continue-button" onClick={onContinue}>
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}
