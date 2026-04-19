import { useEffect, useRef } from 'react';
import type { YTPlayer } from '../youtube';
import { useSocket } from '../context/SocketContext';

type YouTubePlayerProps = {
  videoId: string;
  currentTime: number;
  isPlaying: boolean;
  canControl: boolean;
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
  canControl,
}: YouTubePlayerProps) {
  const socket = useSocket();
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);

  const remoteTimerRef = useRef<number | null>(null);
  const isRemoteUpdate = useRef(false);

  const lastVideoIdRef = useRef<string>('');
  const lastObservedTimeRef = useRef<number>(0);

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
            lastObservedTimeRef.current = currentTime;
          },
          onStateChange: (event) => {
            if (!canControl || isRemoteUpdate.current) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              socket.emit('play');
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              socket.emit('pause');
            }
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

  // Apply socket-driven updates only.
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;

    if (remoteTimerRef.current) window.clearTimeout(remoteTimerRef.current);
    isRemoteUpdate.current = true;

    if (effectiveVideoId !== lastVideoIdRef.current) {
      p.loadVideoById(effectiveVideoId, currentTime);
      lastVideoIdRef.current = effectiveVideoId;
    } else {
      p.seekTo(currentTime, true);
    }
    lastObservedTimeRef.current = currentTime;

    if (isPlaying) p.playVideo();
    else p.pauseVideo();

    remoteTimerRef.current = window.setTimeout(() => {
      isRemoteUpdate.current = false;
    }, 300);
  }, [effectiveVideoId, currentTime, isPlaying]);

  useEffect(() => {
    if (!canControl) return;
    const id = window.setInterval(() => {
      if (!playerRef.current || !readyRef.current) return;
      if (isRemoteUpdate.current) return;
      const time = playerRef.current.getCurrentTime();
      socket.emit('seek', { time });
    }, 2000);

    return () => window.clearInterval(id);
  }, [canControl, socket]);

  return <div ref={containerRef} />;
}