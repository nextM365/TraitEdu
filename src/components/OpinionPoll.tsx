import { useState, type FormEvent } from 'react';

interface PollQuestion {
  id: string;
  question: string;
  options: string[];
}

interface PollItem {
  id: string;
  title: string;
  subtitle: string;
  status: 'active' | 'completed';
  questions: PollQuestion[];
}

const polls: PollItem[] = [
  {
    id: 'poll-1',
    title: 'Parents Opinion Poll',
    subtitle: 'Your feedback about exam preparation and communication.',
    status: 'active',
    questions: [
      {
        id: 'q1',
        question: 'Do you feel the revision and practice provided before the exam were sufficient?',
        options: ['Yes', 'Mostly', 'Partially', 'No'],
      },
      {
        id: 'q2',
        question: 'Were worksheets, tests, or revision classes helpful for exam preparation?',
        options: ['Very helpful', 'Helpful', 'Somewhat helpful', 'Not helpful'],
      },
      {
        id: 'q3',
        question: 'Do you feel communication from the school about exam updates was clear?',
        options: ['Very clear', 'Clear', 'Somewhat clear', 'Not clear'],
      },
    ],
  },
  {
    id: 'poll-2',
    title: 'Term-2 Parents Opinion',
    subtitle: 'Share your feedback on progress reports and parent-teacher meetings.',
    status: 'completed',
    questions: [
      {
        id: 'q4',
        question: 'Were the progress updates easy to understand?',
        options: ['Yes', 'Somewhat', 'Not really', 'No'],
      },
    ],
  },
  {
    id: 'poll-3',
    title: 'Your Feedback Matters',
    subtitle: 'Tell us how the school can improve communication and team support.',
    status: 'completed',
    questions: [
      {
        id: 'q5',
        question: 'Did you feel heard during the last feedback session?',
        options: ['Yes', 'Mostly', 'Partially', 'No'],
      },
    ],
  },
];

interface OpinionPollProps {
  onBack: () => void;
}

export default function OpinionPoll({ onBack }: OpinionPollProps) {
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const selectedPoll = polls.find(poll => poll.id === selectedPollId) ?? polls[0];
  const showingList = selectedPollId === null;

  const handleSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="opinion-poll-page">
      <div className="page-header">
        <button type="button" className="back-button" onClick={showingList ? onBack : () => setSelectedPollId(null)}>
          ←
        </button>
        <div>
          <p className="page-tag">Opinion Poll</p>
          <h1>{showingList ? 'Opinion Polls' : selectedPoll.title}</h1>
        </div>
      </div>

      {showingList ? (
        <div className="poll-list">
          {polls.map(poll => (
            <button
              key={poll.id}
              type="button"
              className={`poll-list-card ${poll.status === 'active' ? 'active-poll' : 'completed-poll'}`}
              onClick={() => {
                setSelectedPollId(poll.id);
                setSubmitted(false);
                setAnswers({});
              }}>
              <div>
                <h2>{poll.title}</h2>
                <p>{poll.subtitle}</p>
              </div>
              <span className={poll.status === 'active' ? 'status-badge active' : 'status-badge completed'}>
                {poll.status === 'active' ? 'Active' : 'Completed'}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <p className="page-description">{selectedPoll.subtitle}</p>

          <form className="poll-form" onSubmit={handleSubmit}>
            {selectedPoll.questions.map(question => (
              <fieldset key={question.id} className="poll-question">
                <legend>{question.question}</legend>
                <div className="poll-options">
                  {question.options.map(option => (
                    <label key={option} className="poll-option">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => handleSelect(question.id, option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            {!submitted ? (
              <button type="submit" className="poll-submit-button">
                Submit Poll
              </button>
            ) : (
              <div className="poll-success-card">
                <h3>Thank you!</h3>
                <p>Your responses have been recorded successfully.</p>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
