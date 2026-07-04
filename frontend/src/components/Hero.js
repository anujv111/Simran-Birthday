import React, { useRef, useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { Play, Info, Volume2, VolumeX, RotateCcw } from 'lucide-react';

const Hero = ({ onMoreInfo, onPlay }) => {
  const { hero } = useMedia();
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [ended, setEnded] = useState(false);
  const hasVideo = !!hero.video_url;

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const replay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play();
    setEnded(false);
  };

  const heroItem = {
    id: 'hero1',
    title: hero.title,
    description: hero.description,
    image: hero.backdrop,
    video_url: hero.video_url || '',
    type: hasVideo ? 'video' : 'photo',
    year: hero.year,
    duration: hero.duration,
  };

  return (
    <section className="hero">
      {hasVideo && !ended ? (
        <video
          ref={videoRef}
          src={hero.video_url}
          autoPlay
          muted={muted}
          playsInline
          onEnded={() => setEnded(true)}
          poster={hero.backdrop}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="hero-img" style={{ backgroundImage: `url(${hero.backdrop})` }} />
      )}
      <div className="hero-fade" />

      {hasVideo && (
        <div className="absolute right-6 bottom-40 z-20 flex gap-2">
          {ended ? (
            <button className="w-10 h-10 rounded-full border-2 border-gray-400 hover:border-white flex items-center justify-center text-white bg-black/50" onClick={replay} aria-label="Replay">
              <RotateCcw className="w-5 h-5" />
            </button>
          ) : (
            <button className="w-10 h-10 rounded-full border-2 border-gray-400 hover:border-white flex items-center justify-center text-white bg-black/50" onClick={toggleMute} aria-label="Toggle mute">
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          )}
          <span className="self-center border-l-2 border-white/60 pl-3 pr-4 py-1 text-white text-xs tracking-widest bg-black/40">FEATURED</span>
        </div>
      )}

      <div className="hero-content fade-in">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-red-600 text-white px-2 py-0.5 text-xs font-bold tracking-widest">N</span>
          <span className="text-xs tracking-[0.3em] text-gray-200 uppercase">Netflix Original</span>
        </div>
        <h1 className="title-bebas text-white text-5xl md:text-7xl font-bold mb-3 text-shadow">{hero.title}</h1>
        <div className="flex items-center gap-3 text-sm text-gray-200 mb-4">
          <span className="text-green-500 font-semibold">{hero.match}</span>
          <span>{hero.year}</span>
          <span className="border border-gray-400 px-1.5 py-0.5 text-xs">{hero.rating}</span>
          <span>{hero.duration}</span>
        </div>
        <p className="text-lg md:text-xl text-gray-100 font-medium mb-3 text-shadow">{hero.subtitle}</p>
        <p className="text-gray-200 md:text-base text-sm mb-6 max-w-xl text-shadow">{hero.description}</p>
        <div className="flex gap-3">
          <button className="btn-play" onClick={() => hasVideo && onPlay && onPlay(heroItem)}>
            <Play className="w-5 h-5 fill-black" /> Play
          </button>
          <button className="btn-info" onClick={() => onMoreInfo && onMoreInfo(heroItem)}>
            <Info className="w-5 h-5" /> More Info
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
