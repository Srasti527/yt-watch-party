import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import type { RoomState } from '../types/room';
import { ParticipantsList } from '../components/ParticipantsList';
import { RoomControls } from '../components/RoomControls';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { ChatBox } from '../components/ChatBox';


type LocationState = { username?: string };
type ChatMessage = { username: string; message: string; time: number };
type Reaction = { id: number; emoji: string };

export function Room() {
  const { roomId: roomIdParam } = useParams();
  const roomId = roomIdParam ?? '';
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useSocket();

  const username = (location.state as LocationState | null)?.username?.trim() ?? '';

  const [room, setRoom] = useState<RoomState | null>(null);
  const [seekInput, setSeekInput] = useState('0');
  const [videoInput, setVideoInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const joinKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!username) {
      navigate('/', { replace: true });
    }
  }, [username, navigate]);

  useEffect(() => {
    if (!username || !roomId) return;
    const key = `${roomId}::${username}`;
    if (joinKeyRef.current === key) return;
    joinKeyRef.current = key;

    const emitJoin = () => {
      socket.emit('join-room', { roomId, username });
    };
    if (socket.connected) emitJoin();
    else socket.once('connect', emitJoin);

    return () => {
      socket.off('connect', emitJoin);
    };
  }, [roomId, username, socket]);

  useEffect(() => {
    const onRoomUpdate = (r: RoomState | null) => {
      setRoom(r);
    };
    const onVideoPlay = (payload: { isPlaying: boolean; currentTime: number }) => {
      setRoom((prev) =>
        prev
          ? { ...prev, isPlaying: payload.isPlaying, currentTime: payload.currentTime }
          : prev
      );
    };
    const onVideoPause = (payload: { isPlaying: boolean; currentTime: number }) => {
      setRoom((prev) =>
        prev
          ? { ...prev, isPlaying: payload.isPlaying, currentTime: payload.currentTime }
          : prev
      );
    };
    const onVideoSeek = (payload: { time: number }) => {
      setRoom((prev) => (prev ? { ...prev, currentTime: payload.time } : prev));
    };
    const onVideoChange = (payload: { videoId: string }) => {
      setRoom((prev) => (prev ? { ...prev, videoId: payload.videoId } : prev));
    };
    const onRoleAssigned = (payload: { participants: RoomState['participants'] }) => {
      setRoom((prev) => (prev ? { ...prev, participants: payload.participants } : prev));
    };
    const onParticipantRemoved = (payload: { participants: RoomState['participants'] }) => {
      setRoom((prev) => (prev ? { ...prev, participants: payload.participants } : prev));
    };
    const onHostTransferred = (payload: {
      hostId: string;
      participants: RoomState['participants'];
    }) => {
      setRoom((prev) =>
        prev
          ? { ...prev, hostId: payload.hostId, participants: payload.participants }
          : prev
      );
    };
    const onNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };
    const onNewReaction = ({ emoji }: { emoji: string }) => {
      const reaction = { id: Date.now() + Math.random(), emoji };
      setReactions((prev) => [...prev, reaction]);
      window.setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 1500);
    };
    const onKicked = () => {
      window.alert('You were removed by host');
      navigate('/');
    };

    socket.on('room-update', onRoomUpdate);
    socket.on('role-assigned', onRoleAssigned);
    socket.on('participant-removed', onParticipantRemoved);
    socket.on('host-transferred', onHostTransferred);
    socket.on('new-message', onNewMessage);
    socket.on('new-reaction', onNewReaction);
    socket.on('kicked', onKicked);
    socket.on('video-play', onVideoPlay);
    socket.on('video-pause', onVideoPause);
    socket.on('video-seek', onVideoSeek);
    socket.on('video-change', onVideoChange);

    return () => {
      socket.off('room-update', onRoomUpdate);
      socket.off('role-assigned', onRoleAssigned);
      socket.off('participant-removed', onParticipantRemoved);
      socket.off('host-transferred', onHostTransferred);
      socket.off('new-message', onNewMessage);
      socket.off('new-reaction', onNewReaction);
      socket.off('kicked', onKicked);
      socket.off('video-play', onVideoPlay);
      socket.off('video-pause', onVideoPause);
      socket.off('video-seek', onVideoSeek);
      socket.off('video-change', onVideoChange);
    };
  }, [socket, navigate]);

  useEffect(() => {
    if (!room) return;
    setSeekInput(String(Math.floor(room.currentTime)));
  }, [room?.currentTime, room]);

  useEffect(() => {
    if (!room) return;
    setVideoInput(room.videoId);
  }, [room?.videoId, room]);

  const me = room?.participants.find((p) => p.id === socket.id);
  const role = me?.role ?? 'participant';
  const isHost = role === 'host';
  const canControl = role === 'host' || role === 'moderator';

  if (!username) {
    return null;
  }

  return (
    <div className="page-wrap">
      <div className="card room-card">
      <p>
        <Link to="/">← Home</Link>
      </p>
      <h1>Room: {roomId}</h1>
      <div className="room-layout">
      {room && <div className="side-panel">
        <ParticipantsList
          participants={room.participants}
          isHost={isHost}
          currentUserId={socket.id}
        />
      </div>}
      <div className="video-panel">
      {room && (
        <YouTubePlayer
          videoId={room.videoId}
          currentTime={room.currentTime}
          isPlaying={room.isPlaying}
          canControl={canControl}
        />
      )}
      <div className="reactions-layer">
        {reactions.map((r) => (
          <span key={r.id} className="reaction-float">
            {r.emoji}
          </span>
        ))}
      </div>
      {!room && <p>Loading room…</p>}
      {room && (
        <RoomControls
          canControl={canControl}
          roleLabel={role}
          seekSeconds={seekInput}
          videoIdInput={videoInput}
          onSeekSecondsChange={setSeekInput}
          onVideoIdChange={setVideoInput}
          onPlay={() => {
            socket.emit('play', { time: room.currentTime });
          }}
          
          onPause={() => {
            socket.emit('pause', { time: room.currentTime });
          }}
          onSeek={() => {
            const t = Number(seekInput);
            if (!Number.isFinite(t) || t < 0) {
              window.alert('Invalid seek time');
              return;
            }
            socket.emit('seek', { time: t });
          }}
          onChangeVideo={() => {
            const id = videoInput.trim();
            if (!id) {
              window.alert('Video ID is required');
              return;
            }
            socket.emit('change-video', { videoId: id });
          }}
        />
      )}
      <div className="reactions-buttons">
        {['👍', '😂', '🔥', '❤️'].map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => socket.emit('send-reaction', { emoji })}
          >
            {emoji}
          </button>
        ))}
      </div>
      {room && (
        <ChatBox
          messages={messages}
          onSend={(message) => socket.emit('send-message', { message })}
        />
      )}
      <p style={{ marginTop: 16 }}>
        <button type="button" onClick={() => socket.emit('sync-request')}>
          Sync (request full room state)
        </button>
      </p>
      </div>
      </div>
      </div>
    </div>
  );
}
