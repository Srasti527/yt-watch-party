type RoomControlsProps = {
  isHost: boolean;
  seekSeconds: string;
  videoIdInput: string;
  onSeekSecondsChange: (v: string) => void;
  onVideoIdChange: (v: string) => void;
  onPlay: () => void;
  onPause: () => void;
  onSeek: () => void;
  onChangeVideo: () => void;
};

export function RoomControls({
  isHost,
  seekSeconds,
  videoIdInput,
  onSeekSecondsChange,
  onVideoIdChange,
  onPlay,
  onPause,
  onSeek,
  onChangeVideo,
}: RoomControlsProps) {
  return (
    <div>
      <h3>Controls {isHost ? '(host)' : '(view only)'}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <button type="button" disabled={!isHost} onClick={onPlay}>
          Play
        </button>
        <button type="button" disabled={!isHost} onClick={onPause}>
          Pause
        </button>
        <label>
          Seek (s){' '}
          <input
            type="number"
            min={0}
            step={1}
            value={seekSeconds}
            disabled={!isHost}
            onChange={(e) => onSeekSecondsChange(e.target.value)}
          />
        </label>
        <button type="button" disabled={!isHost} onClick={onSeek}>
          Seek
        </button>
        <label>
          Video ID{' '}
          <input
            type="text"
            value={videoIdInput}
            disabled={!isHost}
            onChange={(e) => onVideoIdChange(e.target.value)}
            placeholder="YouTube video ID"
          />
        </label>
        <button type="button" disabled={!isHost} onClick={onChangeVideo}>
          Change video
        </button>
      </div>
    </div>
  );
}
