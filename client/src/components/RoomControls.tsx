type RoomControlsProps = {
  canControl: boolean;
  roleLabel: string;
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
  canControl,
  roleLabel,
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
      <h3>Controls ({roleLabel})</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <button type="button" disabled={!canControl} onClick={onPlay}>
          Play
        </button>
        <button type="button" disabled={!canControl} onClick={onPause}>
          Pause
        </button>
        <label>
          Seek (s){' '}
          <input
            type="number"
            min={0}
            step={1}
            value={seekSeconds}
            disabled={!canControl}
            onChange={(e) => onSeekSecondsChange(e.target.value)}
          />
        </label>
        <button type="button" disabled={!canControl} onClick={onSeek}>
          Seek
        </button>
        <label>
          Video ID{' '}
          <input
            type="text"
            value={videoIdInput}
            disabled={!canControl}
            onChange={(e) => onVideoIdChange(e.target.value)}
            placeholder="YouTube video ID"
          />
        </label>
        <button type="button" disabled={!canControl} onClick={onChangeVideo}>
          Change video
        </button>
      </div>
    </div>
  );
}
