import type { Participant } from '../types/room';
import { useSocket } from '../context/SocketContext';

type ParticipantsListProps = {
  participants: Participant[];
  isHost: boolean;
  currentUserId?: string;
};

export function ParticipantsList({
  participants,
  isHost,
  currentUserId,
}: ParticipantsListProps) {
  const socket = useSocket();

  return (
    <div>
      <h3>Participants</h3>
      <ul>
        {participants.map((p) => (
          <li key={p.id}>
            {p.username} ({p.role}){' '}
            {isHost && p.id !== currentUserId && (
              <>
                <select
                  value={p.role}
                  onChange={(e) =>
                    socket.emit('assign-role', { userId: p.id, role: e.target.value })
                  }
                >
                  <option value="participant">Participant</option>
                  <option value="moderator">Moderator</option>
                </select>{' '}
                <button
                  type="button"
                  onClick={() => socket.emit('remove-participant', { userId: p.id })}
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => socket.emit('transfer-host', { userId: p.id })}
                >
                  Transfer host
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
