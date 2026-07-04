import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, Cake } from 'lucide-react';
import { useMedia } from '../context/MediaContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { activeProfile } = useMedia();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const path = location.pathname;

  return (
    <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="flex items-center gap-8">
        <div className="logo cursor-pointer" onClick={() => navigate('/browse')}>NETFLIX</div>
        <div className="nav-links hidden md:flex">
          <Link to="/browse" className={path === '/browse' ? 'active' : ''}>Home</Link>
          <a href="#">TV Shows</a>
          <a href="#">Movies</a>
          <a href="#">New & Popular</a>
          <Link to="/dashboard" className={path === '/dashboard' ? 'active' : ''}>My Memories</Link>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <Search className="w-5 h-5 text-white cursor-pointer" />
        <span className="hidden md:inline text-xs bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1">
          <Cake className="w-3 h-3" /> 05 JUL
        </span>
        <Bell className="w-5 h-5 text-white cursor-pointer" />
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded overflow-hidden bg-neutral-800">
            {activeProfile && <img src={activeProfile.avatar} alt={activeProfile.name} className="w-full h-full object-cover" />}
          </div>
          <ChevronDown className="w-4 h-4 text-white" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
