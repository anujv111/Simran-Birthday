import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { categories as fallbackCategories, profiles as fallbackProfiles, heroContent as fallbackHero } from '../mock';

const MediaContext = createContext(null);
const PROFILE_KEY = 'simran_active_profile_v1';
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const MediaProvider = ({ children }) => {
  const [categories, setCategories] = useState(fallbackCategories);
  const [profiles, setProfiles] = useState(fallbackProfiles);
  const [hero, setHero] = useState(fallbackHero);
  const [activeProfile, setActiveProfile] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [c, p, h] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/profiles`),
        axios.get(`${API}/hero`),
      ]);
      setCategories(c.data);
      setProfiles(p.data);
      setHero(h.data);
    } catch (e) {
      console.error('API load failed, using mocks', e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const p = localStorage.getItem(PROFILE_KEY);
      if (p) setActiveProfile(JSON.parse(p));
    } catch (e) { /* noop */ }
    setHydrated(true);
    fetchAll();
  }, [fetchAll]);

  // Keep the active profile in sync with the latest data from the DB.
  // Without this, `activeProfile` stays frozen at whatever was cached in
  // localStorage the moment it was selected — so after editing a profile's
  // photo in the Dashboard, the Navbar/avatar kept showing the old picture
  // until the profile was re-selected. Once `profiles` refreshes (after any
  // fetchAll/update), re-hydrate activeProfile from it so the avatar/name
  // always reflect what's actually in the database.
  useEffect(() => {
    if (!activeProfile || !profiles?.length) return;
    const fresh = profiles.find((p) => p.id === activeProfile.id);
    if (fresh && (fresh.avatar !== activeProfile.avatar || fresh.name !== activeProfile.name || fresh.color !== activeProfile.color)) {
      setActiveProfile(fresh);
      try { localStorage.setItem(PROFILE_KEY, JSON.stringify(fresh)); } catch (e) { /* noop */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles]);

  const chooseProfile = (p) => {
    setActiveProfile(p);
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch (e) { /* noop */ }
  };

  const addMedia = async ({ title, type, categoryId, description, image, banner, videoUrl, year, duration }) => {
    const res = await axios.post(`${API}/media`, {
      title, type, category_id: categoryId, description, image, banner: banner || '', video_url: videoUrl || '', year, duration,
    });
    await fetchAll();
    return res.data;
  };

  const removeMedia = async (_categoryId, itemId) => {
    await axios.delete(`${API}/media/${itemId}`);
    await fetchAll();
  };

  const resetAll = async () => {
    await axios.post(`${API}/reset`);
    await fetchAll();
  };

  const updateProfile = async (id, updates) => {
    await axios.put(`${API}/profiles/${id}`, updates);
    await fetchAll();
  };

  const updateHero = async (updates) => {
    await axios.put(`${API}/hero`, updates);
    await fetchAll();
  };

  return (
    <MediaContext.Provider value={{ categories, profiles, hero, activeProfile, hydrated, loading, chooseProfile, addMedia, removeMedia, resetAll, updateProfile, updateHero, refetch: fetchAll }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error('useMedia must be used within MediaProvider');
  return ctx;
};
