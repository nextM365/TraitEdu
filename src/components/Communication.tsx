import { useState } from 'react';

interface CommunicationProps {
  messages: string[];
}

export default function Communication({ messages: initialMessages }: CommunicationProps) {
  const [messages, setMessages] = useState<string[]>(initialMessages);
  const [value, setValue] = useState('');

  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setMessages([trimmed, ...messages]);
    setValue('');
  }

  return (
    <div>
      <div className="card-header">
        <h2>Parent-school communication</h2>
      </div>
      <ul className="data-list">
        {messages.map((message, index) => (
          <li key={`${message}-${index}`}>{message}</li>
        ))}
      </ul>
      <form className="small-form" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Send a message"
          value={value}
          onChange={event => setValue(event.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
