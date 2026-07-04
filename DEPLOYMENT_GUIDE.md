# Simran Birthday Netflix Clone — Fixes + Vercel Deployment Guide

## Latest update (is zip me naya kya hai)
- **PostHog analytics script hataya:** `frontend/public/index.html` me emergent.sh ka
  hardcoded PostHog tracking snippet (analytics key `phc_xAvL2...`) tha jo har visitor
  ka session data unke analytics project me bhej raha tha. Poori tarah hata diya gaya.
- **CORS ab env-driven hai:** `backend/server.py` pehle hamesha `allow_origins=["*"]`
  hardcoded use karta tha, `.env` ka `CORS_ORIGINS` value ignore ho raha tha. Ab code
  actually `CORS_ORIGINS` env var padhta hai — deploy karte waqt apna Vercel domain
  set karke thoda zyada secure rakh sakte ho (ya `*` hi rehne do, dono chalega).
- `frontend/.env` aur `backend/.env` me comments add kiye hain taaki deploy karte waqt
  yaad rahe ki kaunsi values production ke liye replace karni hain.

## Kya-kya fix kiya (is zip me already apply hai)

### 1. "Made with Emergent" badge hata diya
`frontend/public/index.html` se badge `<a id="emergent-badge">`, uska script `emergent-main.js`,
aur `frontend/package.json` + `craco.config.js` se `@emergentbase/visual-edits` dependency
(jo emergent.sh se aati thi) — sab remove kar diya. Ab build/deploy karte waqt kahin bhi
emergent.sh ka reference nahi hai.

### 2. Profile photo "purani pehle, DB wali baad me" wala bug
Root cause: profile choose karte waqt uska data browser ke `localStorage` me cache ho jata tha
(`activeProfile`). Jab aap Dashboard me jaake profile photo change karte the, database (`profiles`
list) turant update ho jata tha, lekin **`activeProfile` (jo Navbar avatar dikhata hai) kabhi refresh
nahi hota tha** — wo localStorage ke purane snapshot par hi atka rehta tha. Isiliye Navbar/top-right
avatar hamesha purani photo dikhata rehta tha jab tak aap profile-select screen par wapas jaakar
profile dobara select na karo.

Fix: `frontend/src/context/MediaContext.js` me ek naya `useEffect` add kiya jo har baar `profiles`
list database se refresh hone par, active profile ko us fresh data se sync kar deta hai (aur
localStorage bhi update kar deta hai). Ab avatar hamesha DB wali latest photo dikhayega, koi flicker
nahi.

### 3. Player error (desktop par) — asli wajah
Ye app videos ko **base64 data URL ke roop me seedha MongoDB me** store karta hai (koi S3/Cloudinary
nahi hai abhi). Isse do problems ho sakti hain:

- **Codec/format issue (sabse common wajah):** Agar aapne iPhone se seedha `.mov` (HEVC) video upload
  kiya hai, wo mobile Safari me chal jata hai lekin desktop Chrome/Firefox/Edge us codec ko decode
  nahi kar paate — isse exactly wahi error aata hai jo aap dekh rahe ho. Maine ab do cheezein add ki
  hain:
  - Upload karte waqt hi warning dikhega agar file `.mov`/HEVC lagti hai (`Dashboard.js`).
  - Player ka error message ab specific bata dega ki decode issue hai ya format issue
    (`NetflixPlayer.js`), taaki debug karna asaan ho.
  - **Immediate fix aapke liye:** jo bhi video chal nahi raha, usse ek baar
    [cloudconvert.com](https://cloudconvert.com) ya **HandBrake** (free desktop app) se **MP4 (H.264
    video + AAC audio)** me convert karke dobara upload karein — 99% cases me ye chal jaayega.

- **Long-term / scale issue:** Base64 video Mongo document me store karna production-safe nahi hai
  (MongoDB ka per-document limit 16MB hai, aur base64 encoding size ~33% badha deta hai, plus poore
  page load slow ho jate hain kyunki har category-fetch me pura video data bhi aata hai). Agar aage
  aur videos add karne hain ya app scale karna hai, to recommend karunga ki videos ko Cloudinary ya
  S3/R2 jaisi file storage service par upload karo aur sirf uska URL Mongo me save karo — agar chaho
  to main ye migration bhi kar sakta hoon, bas bataiye.

---

## Vercel par Deploy kaise karein

**Important samajhne wali baat:** Vercel bohot accha hai **React frontend** ke liye, lekin aapka
backend **FastAPI + MongoDB** hai — ye ek "always-on" Python server hai, Vercel serverless functions
is tarah ke persistent DB-connection wale app ke liye ideal nahi hote (aur inka request size bhi
sirf ~4.5MB tak allowed hota hai, jo aapke video uploads todh dega). Isliye best/stable setup ye hai:

- **Frontend → Vercel**
- **Backend → Render / Railway** (dono ke free tier available hain, FastAPI ke liye perfect)
- **Database → MongoDB Atlas** (free M0 cluster) — abhi aapka `MONGO_URL` local (`localhost:27017`)
  hai jo deploy hone par kaam nahi karega, isliye Atlas par cluster banana zaroori hai.

### Step 1 — MongoDB Atlas (database)
1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) par free account banayein.
2. Free M0 cluster create karein (koi credit card nahi chahiye).
3. Database Access me ek user banayein (username/password).
4. Network Access me `0.0.0.0/0` allow karein (ya Render/Railway ke IP ranges).
5. "Connect → Drivers" se connection string copy karein, kuch aisa dikhega:
   `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### Step 2 — Backend deploy (Render.com example)
1. Apna code GitHub par push karein (poora `aj-main` folder, ya alag repo bhi bana sakte hain).
2. Render par "New → Web Service" → apna repo connect karein, **Root Directory = `backend`**.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Environment Variables set karein:
   - `MONGO_URL` = aapka Atlas connection string
   - `DB_NAME` = `simran_birthday` (ya jo naam chahiye)
   - `CORS_ORIGINS` = `*` (ya specifically apne Vercel domain ka URL, jyada secure ke liye)
6. Deploy hone ke baad aapko ek URL milega jaise `https://your-app.onrender.com` — isse note kar lein.

### Step 3 — Frontend deploy (Vercel)
1. [vercel.com](https://vercel.com) par New Project → apna repo import karein.
2. **Root Directory = `frontend`** set karein (Vercel project settings me).
3. Build Command: `craco build` (already `vercel.json` me set kar diya hai isliye auto-detect ho
   jayega).
4. Output Directory: `build`
5. Environment Variable add karein:
   - `REACT_APP_BACKEND_URL` = Step 2 wala backend URL, e.g. `https://your-app.onrender.com`
     (⚠️ trailing slash `/` mat lagayein — code khud `/api` append karta hai)
6. Deploy dabaayein.

### Step 4 — Verify
- `https://your-app.onrender.com/api/` khol kar dekhein — `{"message": "Birthdayflix API is alive"}`
  aana chahiye.
- Vercel wala frontend URL kholein, profile select karein, browse/dashboard check karein.
- Agar CORS error aaye browser console me, to Step 2 ke `CORS_ORIGINS` me apna exact Vercel domain
  add karein (comma-separated agar multiple).

---

## Agla kya karein (optional but recommended)
- Bade video files ke liye Cloudinary/S3 migration (base64-in-Mongo hata kar) — batayein to kar
  dunga.
- `.env` files ko kabhi bhi GitHub par public repo me commit na karein (Mongo credentials leak ho
  sakte hain) — `.gitignore` me already `.env` add hai ya check kar lein.
