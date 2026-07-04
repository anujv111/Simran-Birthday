import React, { useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import ProfilesEditor from '../components/ProfilesEditor';
import { useMedia } from '../context/MediaContext';
import { Upload, Trash2, Image as ImageIcon, Film, Plus, RotateCcw, Star, CheckCircle2, ImagePlus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const readAsDataURL = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = reject;
  r.readAsDataURL(file);
});

const Dashboard = () => {
  const { categories, hero, addMedia, removeMedia, resetAll, refetch } = useMedia();
  const heroFileRef = useRef(null);
  const navigate = useNavigate();
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingBackdrop, setUploadingBackdrop] = useState(false);
  const backdropFileRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: categories[0]?.id || 'c1',
    type: 'photo',
    image: '',      // cover / poster (photo shown on card and modal)
    banner: '',     // optional larger banner (used in detail modal hero)
    videoUrl: '',   // for videos: base64 data URL
  });

  const coverRef = useRef(null);
  const bannerRef = useRef(null);
  const videoRef = useRef(null);

  const handleCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image')) { toast({ title: 'Cover must be an image' }); return; }
    try { const data = await readAsDataURL(file); setForm((f) => ({ ...f, image: data })); } catch (err) { toast({ title: err?.message }); }
  };

  const handleBanner = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image')) { toast({ title: 'Banner must be an image' }); return; }
    try { const data = await readAsDataURL(file); setForm((f) => ({ ...f, banner: data })); } catch (err) { toast({ title: err?.message }); }
  };

  const handleVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video')) { toast({ title: 'Please choose a video file' }); return; }
    const nameLower = file.name.toLowerCase();
    const looksLikeMov = file.type === 'video/quicktime' || nameLower.endsWith('.mov');
    // Quick desktop-playability check: many iPhone videos are .mov/HEVC, which
    // plays fine on the phone/Safari but often fails to decode on desktop
    // Chrome/Firefox/Edge. Warn early instead of letting it fail later in the player.
    if (looksLikeMov) {
      const probe = document.createElement('video');
      const canPlayMov = probe.canPlayType('video/quicktime');
      if (!canPlayMov) {
        toast({
          title: 'This .mov file may not play on desktop browsers',
          description: 'iPhone .mov/HEVC videos often fail on Chrome/Firefox/Edge desktop. For best results, convert to MP4 (H.264) first \u2014 e.g. cloudconvert.com or HandBrake \u2014 then upload that instead.',
        });
      }
    }
    try { const data = await readAsDataURL(file); setForm((f) => ({ ...f, type: 'video', videoUrl: data })); } catch (err) { toast({ title: err?.message }); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isVideo = form.type === 'video' || !!form.videoUrl;
    if (isVideo && !form.videoUrl) { toast({ title: 'Choose a video file' }); return; }
    if (isVideo && !form.image) { toast({ title: 'Choose a cover photo for this video' }); return; }
    if (!isVideo && !form.image) { toast({ title: 'Choose a photo' }); return; }
    if (!form.title.trim()) { toast({ title: 'Give it a title', description: 'A little name goes a long way.' }); return; }
    try {
      await addMedia({
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        type: isVideo ? 'video' : 'photo',
        image: form.image,
        banner: form.banner,
        videoUrl: form.videoUrl,
      });
      toast({ title: 'Added to Netflix', description: `"${form.title}" is now in ${categories.find(c=>c.id===form.categoryId)?.title}.` });
      setForm({ title: '', description: '', categoryId: form.categoryId, type: 'photo', image: '', banner: '', videoUrl: '' });
      if (coverRef.current) coverRef.current.value = '';
      if (bannerRef.current) bannerRef.current.value = '';
      if (videoRef.current) videoRef.current.value = '';
    } catch (err) {
      toast({ title: 'Upload failed', description: err?.response?.data?.detail || err?.message || 'Try a smaller file.' });
    }
  };

  const handleHeroVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video')) { toast({ title: 'Please choose a video file' }); return; }
    setUploadingHero(true);
    try {
      const data = await readAsDataURL(file);
      await axios.put(`${API}/hero`, { video_url: data });
      await refetch();
      toast({ title: 'Featured video updated', description: 'It will autoplay on the home page.' });
      if (heroFileRef.current) heroFileRef.current.value = '';
    } catch (err) {
      toast({ title: 'Upload failed', description: err?.response?.data?.detail || err?.message || 'Try a smaller file (~5MB).' });
    } finally {
      setUploadingHero(false);
    }
  };

  const clearHeroVideo = async () => {
    try {
      await axios.put(`${API}/hero`, { video_url: '' });
      await refetch();
      toast({ title: 'Featured video removed' });
    } catch (err) {
      toast({ title: 'Failed to remove', description: err?.message });
    }
  };

  const handleHeroBackdrop = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image')) { toast({ title: 'Please choose an image file' }); return; }
    setUploadingBackdrop(true);
    try {
      const data = await readAsDataURL(file);
      await axios.put(`${API}/hero`, { backdrop: data });
      await refetch();
      toast({ title: 'Home background updated' });
      if (backdropFileRef.current) backdropFileRef.current.value = '';
    } catch (err) {
      toast({ title: 'Upload failed', description: err?.response?.data?.detail || err?.message });
    } finally {
      setUploadingBackdrop(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-28 px-[4%] pb-20 fade-in">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] text-red-600 uppercase mb-2">Manage Memories</p>
            <h1 className="text-4xl md:text-5xl font-light">Add photos & videos of Simran</h1>
            <p className="text-gray-400 mt-2 max-w-2xl">Upload favourite moments. They&apos;ll appear on Netflix home in the row you choose.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-transparent border-gray-600 hover:bg-white/10 hover:text-white text-gray-200" onClick={() => navigate('/browse')}>Go to Browse</Button>
            <Button variant="outline" className="bg-transparent border-gray-600 hover:bg-white/10 hover:text-white text-gray-200" onClick={async () => { await resetAll(); toast({ title: 'Reset done', description: 'Reverted to default memories.' }); }}>
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
          </div>
        </div>

        {/* Profiles editor */}
        <ProfilesEditor />

        {/* Hero backdrop */}
        <div className="mb-10 p-5 border border-neutral-800 rounded-lg bg-neutral-950">
          <div className="flex items-start gap-3 mb-4">
            <ImagePlus className="w-5 h-5 text-red-500 mt-1" />
            <div>
              <h2 className="text-xl font-semibold">Home Background Image</h2>
              <p className="text-sm text-gray-400">Change the big photo behind the Netflix-style hero on the home page.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-40 h-24 rounded overflow-hidden bg-neutral-900 shrink-0">
              {hero.backdrop ? <img src={hero.backdrop} alt="backdrop" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">no image</div>}
            </div>
            <input ref={backdropFileRef} type="file" accept="image/*" className="hidden" id="hero-backdrop" onChange={handleHeroBackdrop} />
            <label htmlFor="hero-backdrop" className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded ${uploadingBackdrop ? 'bg-neutral-700' : 'bg-white text-black hover:bg-white/90'} font-semibold`}>
              <Upload className="w-4 h-4" /> {uploadingBackdrop ? 'Uploading…' : 'Change background image'}
            </label>
          </div>
        </div>

        {/* Featured Hero Video */}
        <div className="mb-10 p-5 border border-red-600/40 rounded-lg bg-neutral-950">
          <div className="flex items-start gap-3 mb-4">
            <Star className="w-5 h-5 text-red-500 mt-1" />
            <div>
              <h2 className="text-xl font-semibold">Featured Home Video</h2>
              <p className="text-sm text-gray-400">Upload a short clip (~30 sec). It will autoplay muted at the top of the home page — Netflix-style trailer for Simran.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <input ref={heroFileRef} type="file" accept="video/*" className="hidden" id="hero-video" onChange={handleHeroVideo} />
            <label htmlFor="hero-video" className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded ${uploadingHero ? 'bg-red-800' : 'bg-red-600 hover:bg-red-700'} text-white font-semibold`}>
              <Upload className="w-4 h-4" /> {uploadingHero ? 'Uploading…' : 'Upload featured video'}
            </label>
            {hero.video_url ? (
              <>
                <span className="inline-flex items-center gap-1 text-green-500 text-sm"><CheckCircle2 className="w-4 h-4" /> A featured video is set</span>
                <Button variant="outline" className="bg-transparent border-gray-600 hover:bg-white/10 hover:text-white text-gray-200" onClick={clearHeroVideo}>Remove</Button>
              </>
            ) : (
              <span className="text-sm text-gray-500">No featured video set yet.</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Upload form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-xl font-semibold mb-1">Add a memory</h2>
            <div className="flex flex-wrap gap-2 text-xs mb-2">
              <button type="button" onClick={() => setForm({ ...form, type: 'photo', videoUrl: '' })} className={`px-3 py-1 rounded-full ${form.type !== 'video' && !form.videoUrl ? 'bg-red-600 text-white' : 'bg-neutral-800 text-gray-300'}`}>Photo</button>
              <button type="button" onClick={() => setForm({ ...form, type: 'video' })} className={`px-3 py-1 rounded-full ${form.type === 'video' || form.videoUrl ? 'bg-red-600 text-white' : 'bg-neutral-800 text-gray-300'}`}>Video</button>
            </div>

            {/* Cover / Poster */}
            <div className="dash-tile">
              <input ref={coverRef} type="file" accept="image/*" className="hidden" id="cover-upload" onChange={handleCover} />
              <label htmlFor="cover-upload" className="cursor-pointer inline-flex flex-col items-center gap-2 w-full">
                {form.image ? (
                  <img src={form.image} alt="cover" className="max-h-40 rounded object-cover" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-red-600" />
                    <span className="text-sm font-semibold">{(form.type === 'video' || form.videoUrl) ? 'Upload COVER photo (thumbnail)' : 'Upload PHOTO'}</span>
                    <span className="text-xs text-gray-500">Shown on cards and detail modal</span>
                  </>
                )}
              </label>
            </div>

            {(form.type === 'video' || form.videoUrl) && (
              <>
                {/* Banner (optional) */}
                <div className="dash-tile">
                  <input ref={bannerRef} type="file" accept="image/*" className="hidden" id="banner-upload" onChange={handleBanner} />
                  <label htmlFor="banner-upload" className="cursor-pointer inline-flex flex-col items-center gap-2 w-full">
                    {form.banner ? (
                      <img src={form.banner} alt="banner" className="max-h-32 w-full object-cover rounded" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-red-600" />
                        <span className="text-sm font-semibold">Upload BANNER image (optional)</span>
                        <span className="text-xs text-gray-500">Wide image used at the top of the detail modal</span>
                      </>
                    )}
                  </label>
                </div>

                {/* Video */}
                <div className="dash-tile">
                  <input ref={videoRef} type="file" accept="video/*" className="hidden" id="video-upload" onChange={handleVideo} />
                  <label htmlFor="video-upload" className="cursor-pointer inline-flex flex-col items-center gap-2 w-full">
                    {form.videoUrl ? (
                      <video src={form.videoUrl} controls className="max-h-40 rounded" />
                    ) : (
                      <>
                        <Film className="w-8 h-8 text-red-600" />
                        <span className="text-sm font-semibold">Upload VIDEO file</span>
                        <span className="text-xs text-gray-500">MP4 / WebM · plays in Netflix-style player</span>
                      </>
                    )}
                  </label>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-gray-300">Title</Label>
                <Input id="title" className="bg-neutral-900 border-neutral-700 mt-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Birthday cake cutting" />
              </div>
              <div>
                <Label className="text-gray-300">Category</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger className="bg-neutral-900 border-neutral-700 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 text-white border-neutral-700">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Description</Label>
              <Textarea className="bg-neutral-900 border-neutral-700 mt-2" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Say something sweet about this memory…" />
            </div>

            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-semibold">
              <Plus className="w-4 h-4 mr-1" /> Add to Netflix
            </Button>
          </form>

          {/* Manage existing */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Memories</h2>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {categories.map((c) => (
                <div key={c.id}>
                  <p className="text-sm text-gray-400 mb-2">{c.title} · <span className="text-gray-600">{c.items.length} items</span></p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {c.items.map((i) => (
                      <div key={i.id} className="relative group rounded overflow-hidden bg-neutral-900">
                        <img src={i.image && !i.image.startsWith('data:video') ? i.image : 'https://placehold.co/300x160/181818/e50914?text=Video'} alt={i.title} className="w-full h-24 object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => removeMedia(c.id, i.id)} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs inline-flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent">
                          <p className="text-xs truncate flex items-center gap-1">
                            {i.type === 'video' ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                            {i.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
