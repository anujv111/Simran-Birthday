import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, ArrowLeft, SkipBack, SkipForward, Settings } from 'lucide-react';

const fmt = (s) => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

const NetflixPlayer = ({ item, onClose }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const hideTimer = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true); // start muted so autoplay works
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fs, setFs] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState('');

  const src = item?.video_url || (item?.image && item.image.startsWith('data:video') ? item.image : '');
  const posterSrc = item?.banner || (item?.image && !item.image.startsWith('data:video') ? item.image : undefined);

  // Autoplay muted (avoids browser blocking); user can unmute manually.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && p.catch) {
      p.catch(() => { setPlaying(false); });
    }
    document.body.style.overflow = 'hidden';
    const onFsChange = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.body.style.overflow = '';
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { /* ignore */ }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === ' ' || e.key.toLowerCase() === 'k') { e.preventDefault(); togglePlay(); }
      if (e.key.toLowerCase() === 'm') toggleMute();
      if (e.key.toLowerCase() === 'f') toggleFullscreen();
      if (e.key === 'ArrowRight') seekBy(10);
      if (e.key === 'ArrowLeft') seekBy(-10);
      if (e.key === 'ArrowUp') { e.preventDefault(); changeVolume(Math.min(1, volume + 0.1)); }
      if (e.key === 'ArrowDown') { e.preventDefault(); changeVolume(Math.max(0, volume - 0.1)); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume]);

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3500);
  }, []);

  const revealControls = () => {
    setShowControls(true);
    scheduleHide();
  };

  useEffect(() => { scheduleHide(); return () => hideTimer.current && clearTimeout(hideTimer.current); }, [scheduleHide]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      const p = v.play();
      if (p && p.catch) p.catch((err) => setError(err?.message || 'Playback failed'));
    } else {
      v.pause();
    }
    revealControls();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    revealControls();
  };

  const changeVolume = (val) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(val === 0);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        // Try landscape lock (mobile only)
        try { await window.screen?.orientation?.lock?.('landscape'); } catch (e) { /* ignore */ }
      } else {
        await document.exitFullscreen();
      }
    } catch (e) { /* ignore */ }
  };

  const seekBy = (delta) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(0, v.currentTime + delta), v.duration || 0);
    revealControls();
  };

  const onSeek = (e) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * duration;
  };

  const progressPct = duration ? (current / duration) * 100 : 0;

  if (!src) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" onClick={onClose}>
        <div className="text-center px-6" onClick={(e) => e.stopPropagation()}>
          {posterSrc && <img src={posterSrc} alt={item?.title} className="max-h-[70vh] mx-auto rounded" />}
          <p className="text-white mt-4 text-lg">{item?.title}</p>
          <p className="text-gray-400 text-sm mt-1">This is a sample card. Upload a real video via Dashboard to play it here.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-white text-black rounded">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black select-none"
      style={{ cursor: showControls ? 'default' : 'none' }}
      onMouseMove={revealControls}
    >
      <video
        ref={videoRef}
        src={src}
        poster={posterSrc}
        autoPlay
        muted={muted}
        playsInline
        controls={false}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onCanPlay={() => setError('')}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onError={(e) => {
          const code = e.currentTarget?.error?.code;
          // 1=ABORTED 2=NETWORK 3=DECODE 4=SRC_NOT_SUPPORTED
          const reasons = {
            1: 'Playback was aborted.',
            2: 'A network error interrupted the download.',
            3: 'This browser cannot decode this video\u2019s codec (common with .mov/HEVC clips from iPhones).',
            4: 'This file/format isn\u2019t supported by this browser (common with .mov/HEVC clips from iPhones).',
          };
          setError(
            (reasons[code] || 'This video cannot be played in this browser.') +
            ' Try re-uploading as an MP4 (H.264 video / AAC audio) file \u2014 you can convert it for free at cloudconvert.com or with HandBrake.'
          );
        }}
        onClick={togglePlay}
      />

      {buffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Top bar */}
      <div className={`absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} z-10`}>
        <button onClick={onClose} className="text-white hover:text-gray-300 flex items-center gap-2 text-sm md:text-base">
          <ArrowLeft className="w-6 h-6 md:w-7 md:h-7" />
          <span className="hidden md:inline">Back to Browse</span>
        </button>
      </div>

      {/* Muted hint */}
      {muted && playing && !error && (
        <button
          onClick={toggleMute}
          className={`absolute top-20 right-6 px-3 py-2 rounded-full bg-black/70 border border-white/40 text-white text-xs flex items-center gap-2 hover:bg-black/90 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'} z-10`}
        >
          <VolumeX className="w-4 h-4" /> Tap to unmute
        </button>
      )}

      {/* Center play button when paused / on error */}
      {(!playing && !buffering) && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/10 hover:bg-white/20 border-2 border-white/60 flex items-center justify-center backdrop-blur z-10"
          aria-label="Play"
        >
          <Play className="w-12 h-12 text-white fill-white ml-1" />
        </button>
      )}

      {error && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center max-w-md px-6">
          <p className="text-white text-lg font-semibold">Playback error</p>
          <p className="text-gray-300 text-sm mt-2">{error}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-white text-black rounded font-semibold">Close</button>
        </div>
      )}

      {/* Bottom controls */}
      <div className={`absolute bottom-0 left-0 right-0 px-4 md:px-10 pb-6 pt-16 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} z-10`}>
        <div
          ref={progressRef}
          className="relative h-1.5 bg-white/25 rounded cursor-pointer group/progress mb-4 hover:h-2 transition-[height]"
          onClick={onSeek}
        >
          <div className="absolute inset-y-0 left-0 bg-red-600 rounded" style={{ width: `${progressPct}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity" style={{ left: `calc(${progressPct}% - 8px)` }} />
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <button onClick={togglePlay} className="text-white hover:text-gray-300" aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white" />}
          </button>
          <button onClick={() => seekBy(-10)} className="text-white hover:text-gray-300" aria-label="Back 10s">
            <SkipBack className="w-6 h-6" />
          </button>
          <button onClick={() => seekBy(10)} className="text-white hover:text-gray-300" aria-label="Forward 10s">
            <SkipForward className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 group/vol">
            <button onClick={toggleMute} className="text-white hover:text-gray-300" aria-label="Mute">
              {muted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            <input
              type="range" min={0} max={1} step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="w-0 group-hover/vol:w-24 transition-[width] accent-red-600"
            />
          </div>

          <span className="text-white text-xs md:text-sm tabular-nums">{fmt(current)} / {fmt(duration)}</span>

          <div className="flex-1 text-center px-4 truncate">
            <span className="text-white font-semibold text-sm md:text-base">{item.title}</span>
          </div>

          <button className="text-white/80 hover:text-white hidden md:block" aria-label="Settings">
            <Settings className="w-6 h-6" />
          </button>
          <button onClick={toggleFullscreen} className="text-white hover:text-gray-300" aria-label="Fullscreen">
            {fs ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetflixPlayer;
