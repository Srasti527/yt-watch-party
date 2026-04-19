import { useState } from 'react';

type ChatMessage = {
  username: string;
  message: string;
  time: number;
};

type ChatBoxProps = {
  messages: ChatMessage[];
  onSend: (message: string) => void;
};

export function ChatBox({ messages, onSend }: ChatBoxProps) {
  const [text, setText] = useState('');

  return (
    <div className="card chat-box">
      <h3>Chat</h3>
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={`${m.time}-${i}`}>
            <strong>{m.username}:</strong> {m.message}
          </div>
        ))}
      </div>
      <div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button
          type="button"
          onClick={() => {
            const next = text.trim();
            if (!next) return;
            onSend(next);
            setText('');
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
