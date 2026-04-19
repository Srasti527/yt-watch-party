export {};

interface YTPlayerOptions {
  height?: string | number;
  width?: string | number;
  videoId?: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (e: { target: YTPlayer }) => void;
    onStateChange?: (e: { data: number; target: YTPlayer }) => void;
  };
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  loadVideoById(videoId: string, startSeconds?: number): void;
  getCurrentTime(): number;
  destroy(): void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
      };
      Player: new (
        elementId: HTMLElement | string,
        options: YTPlayerOptions
      ) => YTPlayer;
    };
  }
}

export type { YTPlayer, YTPlayerOptions };
