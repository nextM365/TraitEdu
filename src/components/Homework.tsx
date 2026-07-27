import { useState } from 'react';

interface HomeworkProps {
  tasks: string[];
}

export default function Homework({ tasks: initialTasks }: HomeworkProps) {
  const [tasks, setTasks] = useState<string[]>(initialTasks);
  const [value, setValue] = useState('');

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setTasks([trimmed, ...tasks]);
    setValue('');
  }

  return (
    <div>
      <div className="card-header">
        <h2>Homework updates</h2>
        <span className="label label-secondary">Due soon</span>
      </div>
      <ul className="data-list">
        {tasks.map((task, index) => (
          <li key={`${task}-${index}`}>{task}</li>
        ))}
      </ul>
      <form className="small-form" onSubmit={addTask}>
        <input
          type="text"
          placeholder="Add homework update"
          value={value}
          onChange={event => setValue(event.target.value)}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
