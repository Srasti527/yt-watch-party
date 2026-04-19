import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// function randomRoomId() {
//   return Math.random().toString(36).slice(2, 10);
// }

export function Home() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  function goRoom(id: string) {
    const u = username.trim();
    if (!u) {
      window.alert('Enter a username');
      return;
    }
    navigate(`/room/${encodeURIComponent(id)}`, {
      state: { username: u },
    });
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h1>Watch Party</h1>
      <label>
        Username
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 12 }}
        />
      </label>
      <label>
        Room ID
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 12 }}
        />
      </label>
      {/* <button
        type="button"
        onClick={() => {
          const id = randomRoomId();
          setRoomId(id);
          goRoom(id);
        }}
      >
        Create Room
      </button>{' '} */   <button
  type="button"
  onClick={() => {
    const u = username.trim();
    if (!u) {
      window.alert('Enter a username');
      return;
    }

    const id = roomId.trim() || 'room-' + Date.now();
    setRoomId(id);
    goRoom(id);
  }}
>
  Create Room
</button>}
      <button
        type="button"
        onClick={() => {
          const id = roomId.trim();
          if (!id) {
            window.alert('Enter a room ID');
            return;
          }
          goRoom(id);
        }}
      >
        Join Room
      </button>
    </div>
  );
}
