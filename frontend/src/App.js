import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProfileSelect from './pages/ProfileSelect';
import Browse from './pages/Browse';
import Dashboard from './pages/Dashboard';
import { MediaProvider } from './context/MediaContext';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <MediaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProfileSelect />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </MediaProvider>
  );
}

export default App;
