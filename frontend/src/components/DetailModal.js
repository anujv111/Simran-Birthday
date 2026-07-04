import React, { useEffect } from 'react';
import { X, Play, Plus, ThumbsUp } from 'lucide-react';

const DetailModal = ({ item, onClose, onPlay }) => {
  const isVideo = item?.type === 'video' && (item.video_url || (item.image && item.image.startsWith('data:video')));
  const posterSrc = item?.image && !item.image.startsWith('data:video') ? item.image : undefined;
  const heroImage = item?.banner || posterSrc || item?.image;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hero">
          <img src={heroImage} alt={item.title} />
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center z-30">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="absolute bottom-6 left-6 right-6 z-20 flex items-end justify-between">
            <div>
              <h2 className="title-bebas text-white text-4xl md:text-5xl mb-3 text-shadow">{item.title}</h2>
              <div className="flex gap-3">
                {isVideo ? (
                  <button className="btn-play" onClick={() => onPlay && onPlay(item)}>
                    <Play className="w-5 h-5 fill-black" /> Play
                  </button>
                ) : (
                  <button className="btn-play"><Play className="w-5 h-5 fill-black" /> Play</button>
                )}
                <button className="w-10 h-10 rounded-full border-2 border-gray-400 hover:border-white flex items-center justify-center text-white bg-black/50"><Plus className="w-5 h-5" /></button>
                <button className="w-10 h-10 rounded-full border-2 border-gray-400 hover:border-white flex items-center justify-center text-white bg-black/50"><ThumbsUp className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 text-sm text-gray-300 mb-3">
                <span className="text-green-500 font-semibold">99% Match</span>
                <span>{item.year}</span>
                <span className="border border-gray-500 px-1.5 py-0.5 text-xs">U/A</span>
                <span>{item.duration}</span>
                <span className="border border-gray-500 px-1.5 py-0.5 text-xs">HD</span>
              </div>
              <p className="text-white text-base leading-relaxed">{item.description}</p>
            </div>
            <div className="text-sm text-gray-400 space-y-2">
              <p><span className="text-gray-500">Starring: </span><span className="text-white">Simran Singh</span></p>
              <p><span className="text-gray-500">Genres: </span>Birthday, Memories, Family, Feel-good</p>
              <p><span className="text-gray-500">This is: </span>Heartwarming, Joyful, Emotional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
