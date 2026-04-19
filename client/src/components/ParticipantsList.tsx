import type { Participant } from '../types/room';

export function ParticipantsList({ participants }: { participants: Participant[] }) {
  return (
    <div>
      <h3>Participants</h3>
      <ul>
        {participants.map((p) => (
          <li key={p.id}>
            {p.username} ({p.role})
          </li>
        ))}
      </ul>
    </div>
  );
}
