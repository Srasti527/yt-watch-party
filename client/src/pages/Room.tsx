import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import type { RoomState } from '../types/room';
import { ParticipantsList } from '../components/ParticipantsList';
import { RoomControls } from '../components/RoomControls';
import { YouTubePlayer } from '../components/YouTubePlayer';


type LocationState = { username?: string };

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
    const onVideoPlay = (p: { videoId: string; currentTime: number; isPlaying: boolean }) => {
      setRoom((prev) =>
        prev
          ? { ...prev, videoId: p.videoId, currentTime: p.currentTime, isPlaying: p.isPlaying }
          : prev
      );
    };
    const onVideoPause = (p: { videoId: string; currentTime: number; isPlaying: boolean }) => {
      setRoom((prev) =>
        prev
          ? { ...prev, videoId: p.videoId, currentTime: p.currentTime, isPlaying: p.isPlaying }
          : prev
      );
    };
    const onVideoSeek = (p: { videoId: string; currentTime: number; isPlaying: boolean }) => {
      setRoom((prev) =>
        prev
          ? { ...prev, videoId: p.videoId, currentTime: p.currentTime, isPlaying: p.isPlaying }
          : prev
      );
    };
    const onVideoChange = (p: { videoId: string; currentTime: number; isPlaying: boolean }) => {
      setRoom((prev) =>
        prev
          ? { ...prev, videoId: p.videoId, currentTime: p.currentTime, isPlaying: p.isPlaying }
          : prev
      );
    };

    socket.on('room-update', onRoomUpdate);
    socket.on('video-play', onVideoPlay);
    socket.on('video-pause', onVideoPause);
    socket.on('video-seek', onVideoSeek);
    socket.on('video-change', onVideoChange);

    return () => {
      socket.off('room-update', onRoomUpdate);
      socket.off('video-play', onVideoPlay);
      socket.off('video-pause', onVideoPause);
      socket.off('video-seek', onVideoSeek);
      socket.off('video-change', onVideoChange);
    };
  }, [socket]);

  useEffect(() => {
    if (!room) return;
    setSeekInput(String(Math.floor(room.currentTime)));
  }, [room?.currentTime, room]);

  useEffect(() => {
    if (!room) return;
    setVideoInput(room.videoId);
  }, [room?.videoId, room]);

  const isHost = Boolean(room && socket.id === room.hostId);

  if (!username) {
    return null;
  }

  return (
    <div style={{ padding: 24 }}>
      <p>
        <Link to="/">← Home</Link>
      </p>
      <h1>Room: {roomId}</h1>
      {room && <ParticipantsList participants={room.participants} />}
      {room && (
        <YouTubePlayer
          videoId={room.videoId}
          currentTime={room.currentTime}
          isPlaying={room.isPlaying}
          isHost={isHost}
          onHostPlay={(time) => socket.emit('play', { time })}
          onHostPause={(time) => socket.emit('pause', { time })}
          onHostSeek={(time) => socket.emit('seek', { time })}
        />
      )}
      {!room && <p>Loading room…</p>}
      {room && (
        <RoomControls
          isHost={isHost}
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
            if (!Number.isFinite(t) || t < 0) return;
            socket.emit('seek', { time: t });
          }}
          onChangeVideo={() => {
            const id = videoInput.trim();
            if (!id) return;
            socket.emit('change-video', { videoId: id });
          }}
        />
      )}
      <p style={{ marginTop: 16 }}>
        <button type="button" onClick={() => socket.emit('sync-request')}>
          Sync (request full room state)
        </button>
      </p>
    </div>
  );
}
