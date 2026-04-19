import { useEffect, useRef } from 'react';
import type { YTPlayer } from '../youtube';

type YouTubePlayerProps = {
  videoId: string;
  currentTime: number;
  isPlaying: boolean;
  isHost: boolean;
  onHostPlay: (time: number) => void;
  onHostPause: (time: number) => void;
  onHostSeek: (time: number) => void;
};

const DEFAULT_VIDEO_ID = 'dQw4w9WgXcQ';

let apiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!existing) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  });

  return apiPromise;
}

export function YouTubePlayer({
  videoId,
  currentTime,
  isPlaying,
  isHost,
  onHostPlay,
  onHostPause,
  onHostSeek,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);

  const isRemoteUpdate = useRef(false);
  const remoteTimerRef = useRef<number | null>(null);

  const lastVideoIdRef = useRef<string>('');
  const lastTimeRef = useRef<number>(0);
  const lastSeekEmitAtRef = useRef<number>(0);

  const effectiveVideoId = videoId?.trim() ? videoId.trim() : DEFAULT_VIDEO_ID;

  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !containerRef.current || playerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '400',
        width: '700',
        videoId: effectiveVideoId,
        playerVars: { rel: 0, enablejsapi: 1 },
        events: {
          onReady: () => {
            readyRef.current = true;
            lastVideoIdRef.current = effectiveVideoId;
            lastTimeRef.current = currentTime;
          },
          onStateChange: (event) => {
            if (!isHost || isRemoteUpdate.current) return;
            const p = playerRef.current;
            if (!p) return;

            const t = p.getCurrentTime?.() ?? currentTime;
            if (event.data === window.YT.PlayerState.PLAYING) onHostPlay(t);
            if (event.data === window.YT.PlayerState.PAUSED) onHostPause(t);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (remoteTimerRef.current) window.clearTimeout(remoteTimerRef.current);
      playerRef.current?.destroy();
      playerRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply socket updates to the player (and guard against emitting back)
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;

    isRemoteUpdate.current = true;
    if (remoteTimerRef.current) window.clearTimeout(remoteTimerRef.current);

    if (effectiveVideoId !== lastVideoIdRef.current) {
      p.loadVideoById(effectiveVideoId, currentTime);
      lastVideoIdRef.current = effectiveVideoId;
    } else {
      p.seekTo(currentTime, true);
    }

    lastTimeRef.current = currentTime;

    if (isPlaying) p.playVideo();
    else p.pauseVideo();

    remoteTimerRef.current = window.setTimeout(() => {
      isRemoteUpdate.current = false;
    }, 150);
  }, [effectiveVideoId, currentTime, isPlaying]);

  // Detect seekbar scrubs (time jumps) for host only
  useEffect(() => {
    if (!isHost) return;
    const p = playerRef.current;
    if (!p || !readyRef.current) return;

    const id = window.setInterval(() => {
      if (isRemoteUpdate.current) return;
      const now = p.getCurrentTime?.();
      if (typeof now !== 'number' || Number.isNaN(now)) return;
      const prev = lastTimeRef.current;

      if (Math.abs(now - prev) > 1.25) {
        const ms = Date.now();
        if (ms - lastSeekEmitAtRef.current < 600) {
          lastTimeRef.current = now;
          return;
        }
        lastSeekEmitAtRef.current = ms;
        lastTimeRef.current = now;
        onHostSeek(now);
        return;
      }

      lastTimeRef.current = now;
    }, 500);

    return () => {
      window.clearInterval(id);
    };
  }, [isHost, onHostSeek]);

  return <div ref={containerRef} />;
}