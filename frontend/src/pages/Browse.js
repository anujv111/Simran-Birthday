import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Row from '../components/Row';
import DetailModal from '../components/DetailModal';
import NetflixPlayer from '../components/NetflixPlayer';
import { useMedia } from '../context/MediaContext';
import { useNavigate } from 'react-router-dom';

const isPlayable = (item) => item && (item.video_url || (item.image && item.image.startsWith('data:video')));

const Browse = () => {
  const { categories, activeProfile, hydrated } = useMedia();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    // profile is cosmetic; no strict redirect
  }, [activeProfile, hydrated, navigate]);

  const openPlayer = (item) => setPlaying(item);
  const openInfo = (item) => setSelected(item);

  const handleCardSelect = (item) => {
    if (isPlayable(item)) openPlayer(item); else openInfo(item);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Hero onMoreInfo={openInfo} onPlay={openPlayer} />
      <div className="relative z-10 -mt-24 md:-mt-32 pb-24">
        {categories.map((c) => (
          <Row key={c.id} category={c} onSelect={handleCardSelect} onInfo={openInfo} />
        ))}

        <footer className="px-[4%] pt-10 pb-6 text-gray-500 text-sm">
          <p className="mb-2">Made with love for <span className="text-white font-semibold">Simran Singh</span> · 05 July</p>
          <p className="text-xs">Netflix &copy; {new Date().getFullYear()} · A tribute experience</p>
        </footer>
      </div>
      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onPlay={(it) => { setSelected(null); openPlayer(it); }}
        />
      )}
      {playing && <NetflixPlayer item={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
};

export default Browse;
