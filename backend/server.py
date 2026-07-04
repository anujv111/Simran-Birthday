from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
import os, uuid, logging

from seed_data import PROFILES, CATEGORIES_META, HERO, MEDIA_ITEMS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# CORS_ORIGINS env var: comma-separated list of allowed origins, e.g.
# "https://your-app.vercel.app,https://www.yourdomain.com"
# Use "*" to allow all origins (fine for testing, less strict for production).
_cors_origins_raw = os.environ.get('CORS_ORIGINS', '*')
CORS_ORIGINS = [o.strip() for o in _cors_origins_raw.split(',')] if _cors_origins_raw != '*' else ['*']
_allow_credentials = '*' not in CORS_ORIGINS  # wildcard + credentials is invalid per CORS spec

app = FastAPI(title="Birthdayflix API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------- Models ----------
class Profile(BaseModel):
    id: str
    name: str
    avatar: str
    color: str

class MediaItem(BaseModel):
    id: str = Field(default_factory=lambda: 'u_' + uuid.uuid4().hex[:12])
    title: str
    description: str = ''
    category_id: str
    type: str = 'photo'  # 'photo' | 'video'
    image: str  # cover / poster (URL or base64 data URL) — always used for cards
    banner: str = ''  # optional large banner used in the detail modal hero
    video_url: str = ''  # optional; when set, item is playable as video
    year: str = str(datetime.utcnow().year)
    duration: str = '1 min'
    tag: str = 'NEW'
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MediaCreate(BaseModel):
    title: str
    description: Optional[str] = ''
    category_id: str
    type: Optional[str] = 'photo'
    image: str
    banner: Optional[str] = ''
    video_url: Optional[str] = ''
    year: Optional[str] = None
    duration: Optional[str] = None
    tag: Optional[str] = 'NEW'


class HeroUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    backdrop: Optional[str] = None
    video_url: Optional[str] = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    color: Optional[str] = None


# ---------- Helpers ----------
def clean(doc):
    if not doc:
        return doc
    doc.pop('_id', None)
    if isinstance(doc.get('created_at'), datetime):
        doc['created_at'] = doc['created_at'].isoformat()
    return doc

async def seed_if_empty():
    if await db.profiles.count_documents({}) == 0:
        await db.profiles.insert_many([p.copy() for p in PROFILES])
        logger.info('Seeded profiles')
    if await db.media_items.count_documents({}) == 0:
        docs = []
        for it in MEDIA_ITEMS:
            d = it.copy()
            d['created_at'] = datetime.utcnow()
            d.setdefault('video_url', '')  # Ensure video_url field exists
            d.setdefault('banner', '')  # Ensure banner field exists
            docs.append(d)
        await db.media_items.insert_many(docs)
        logger.info('Seeded media items')
    if await db.hero.count_documents({}) == 0:
        await db.hero.insert_one(HERO.copy())
        logger.info('Seeded hero')


# ---------- Routes ----------
@api.get('/')
async def root():
    return {"message": "Birthdayflix API is alive"}

@api.get('/profiles', response_model=List[Profile])
async def get_profiles():
    docs = await db.profiles.find().to_list(100)
    return [clean(d) for d in docs]

@api.put('/profiles/{profile_id}')
async def update_profile(profile_id: str, payload: ProfileUpdate):
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail='No fields to update')
    res = await db.profiles.update_one({'id': profile_id}, {'$set': updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail='Profile not found')
    doc = await db.profiles.find_one({'id': profile_id})
    return clean(doc)

@api.get('/hero')
async def get_hero():
    doc = await db.hero.find_one({})
    return clean(doc) or HERO

@api.put('/hero')
async def update_hero(payload: HeroUpdate):
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail='No fields to update')
    existing = await db.hero.find_one({})
    if existing:
        await db.hero.update_one({'_id': existing['_id']}, {'$set': updates})
    else:
        base = HERO.copy()
        base.update(updates)
        await db.hero.insert_one(base)
    doc = await db.hero.find_one({})
    return clean(doc)

@api.get('/categories')
async def get_categories():
    result = []
    for meta in sorted(CATEGORIES_META, key=lambda m: m['order']):
        items_cursor = db.media_items.find({'category_id': meta['id']}).sort('created_at', -1)
        items = [clean(it) for it in await items_cursor.to_list(500)]
        result.append({'id': meta['id'], 'title': meta['title'], 'items': items})
    return result

@api.post('/media')
async def create_media(payload: MediaCreate):
    if not any(c['id'] == payload.category_id for c in CATEGORIES_META):
        raise HTTPException(status_code=400, detail='Invalid category_id')
    item = MediaItem(
        title=payload.title,
        description=payload.description or '',
        category_id=payload.category_id,
        type=payload.type or 'photo',
        image=payload.image,
        banner=payload.banner or '',
        video_url=payload.video_url or '',
        year=payload.year or str(datetime.utcnow().year),
        duration=payload.duration or '1 min',
        tag=payload.tag or 'NEW',
    )
    doc = item.dict()
    await db.media_items.insert_one(doc)
    return clean(doc)

@api.delete('/media/{item_id}')
async def delete_media(item_id: str):
    res = await db.media_items.delete_one({'id': item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Not found')
    return {'ok': True}

@api.post('/reset')
async def reset_all():
    await db.media_items.delete_many({})
    await db.profiles.delete_many({})
    await db.hero.delete_many({})
    await seed_if_empty()
    return {'ok': True}

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=_allow_credentials,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event('startup')
async def on_startup():
    await seed_if_empty()

@app.on_event('shutdown')
async def on_shutdown():
    client.close()
