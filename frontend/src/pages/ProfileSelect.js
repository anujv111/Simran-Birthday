import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedia } from '../context/MediaContext';
import { Cake } from 'lucide-react';

const ProfileSelect = () => {
  const navigate = useNavigate();
  const { profiles, chooseProfile } = useMedia();

  const handleChoose = (p) => {
    chooseProfile(p);
    navigate('/browse');
  };

  return (
    <div className="profile-page fade-in">
      <div className="flex flex-col items-center gap-10 w-full px-6">
        <div className="flex items-center gap-3">
          <Cake className="w-7 h-7 text-red-600" />
          <span className="text-xs tracking-[0.3em] text-gray-400 uppercase">Simran's Birthday · 05 July</span>
        </div>
        <h1 className="text-white text-4xl md:text-6xl font-light tracking-tight text-center">Who's watching?</h1>

        <div className="flex flex-wrap justify-center gap-8 md:gap-14 mt-6">
          {profiles.map((p) => (
            <button key={p.id} className="profile-card group" onClick={() => handleChoose(p)}>
              <div className="profile-avatar" style={{ boxShadow: `0 8px 30px ${p.color}22` }}>
                <img src={p.avatar} alt={p.name} />
              </div>
              <span className="profile-name group-hover:text-white">{p.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-8 border border-gray-500 text-gray-400 hover:text-white hover:border-white transition-colors px-6 py-2 tracking-widest text-sm"
        >
          MANAGE MEMORIES
        </button>
      </div>
    </div>
  );
};

export default ProfileSelect;
