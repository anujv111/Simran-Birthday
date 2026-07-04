import React, { useRef, useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { Upload, Save, Image as ImageIcon } from 'lucide-react';
import { Input } from './ui/input';
import { toast } from '../hooks/use-toast';

const readAsDataURL = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = reject;
  r.readAsDataURL(file);
});

const ProfileEditor = ({ profile }) => {
  const { updateProfile } = useMedia();
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const dirty = name !== profile.name || avatar !== profile.avatar;

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image')) { toast({ title: 'Choose an image' }); return; }
    try {
      const data = await readAsDataURL(f);
      setAvatar(data);
    } catch (err) {
      toast({ title: 'Failed to read image', description: err?.message });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(profile.id, { name: name.trim() || profile.name, avatar });
      toast({ title: 'Profile updated', description: `${name} looks great!` });
    } catch (err) {
      toast({ title: 'Update failed', description: err?.response?.data?.detail || err?.message });
    } finally { setSaving(false); }
  };

  return (
    <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded overflow-hidden bg-neutral-800 shrink-0">
          {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-neutral-600" /></div>}
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 uppercase tracking-widest">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-neutral-950 border-neutral-700 mt-1" />
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" id={`avatar-${profile.id}`} onChange={handleFile} />
      <div className="flex gap-2">
        <label htmlFor={`avatar-${profile.id}`} className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded text-sm bg-neutral-800 hover:bg-neutral-700 text-white">
          <Upload className="w-4 h-4" /> Change photo
        </label>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${dirty ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};

const ProfilesEditor = () => {
  const { profiles } = useMedia();
  return (
    <div className="mb-10 p-5 border border-neutral-800 rounded-lg bg-neutral-950">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Profiles</h2>
        <p className="text-sm text-gray-400">Change each profile&apos;s name and photo. Shown on the &quot;Who&apos;s watching?&quot; screen.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {profiles.map((p) => <ProfileEditor key={p.id} profile={p} />)}
      </div>
    </div>
  );
};

export default ProfilesEditor;
