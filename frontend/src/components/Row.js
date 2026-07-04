import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Info, Film, Image as ImageIcon } from 'lucide-react';

const Row = ({ category, onSelect, onInfo }) => {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="relative group/row">
      <h2 className="px-[4%] text-white text-xl md:text-2xl font-semibold mt-8 mb-2">{category.title}</h2>
      <button onClick={() => scroll(-1)} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-30 h-[60%] w-[4%] items-center justify-center bg-black/40 hover:bg-black/70 opacity-0 group-hover/row:opacity-100 transition-opacity">
        <ChevronLeft className="w-8 h-8 text-white" />
      </button>
      <div ref={scrollRef} className="row-scroll">
        {category.items.map((item) => (
          <div key={item.id} className="row-card group" onClick={() => onSelect && onSelect(item)}>
            <img src={item.image && !item.image.startsWith('data:video') ? item.image : 'https://placehold.co/600x340/181818/e50914?text=%E2%96%B6+Video'} alt={item.title} />
            {item.tag && (
              <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{item.tag}</span>
            )}
            <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
              {item.type === 'video' ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
              {item.type}
            </span>
            <div className="card-info">
              <p className="text-white text-sm font-semibold truncate">{item.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <button className="bg-white text-black rounded-full p-1 hover:bg-white/80" onClick={(e) => { e.stopPropagation(); onSelect && onSelect(item); }}>
                  <Play className="w-3 h-3 fill-black" />
                </button>
                <button className="bg-black/60 text-white rounded-full p-1 border border-white/40 hover:border-white" onClick={(e) => { e.stopPropagation(); (onInfo || onSelect) && (onInfo || onSelect)(item); }}>
                  <Info className="w-3 h-3" />
                </button>
                <span className="text-gray-300 text-[11px] ml-auto">{item.year} · {item.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => scroll(1)} className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-30 h-[60%] w-[4%] items-center justify-center bg-black/40 hover:bg-black/70 opacity-0 group-hover/row:opacity-100 transition-opacity">
        <ChevronRight className="w-8 h-8 text-white" />
      </button>
    </div>
  );
};

export default Row;
