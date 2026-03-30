import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Play, Pause, ChevronLeft, 
  Volume2, Heart, Share2, Info, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { addToFavorites, removeFromFavorites, getUserFavorites } from '../../services/islamicDatabase';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export default function Quran() {
  const { user } = useAuth();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchSurahs();
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const favs = await getUserFavorites(user.id);
      setFavorites(favs.filter(f => f.type === 'آية').map(f => f.ref_id));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (refId: string) => {
    if (!user) return;
    const isFav = favorites.includes(refId);
    try {
      if (isFav) {
        await removeFromFavorites(user.id, 'آية', refId);
        setFavorites(prev => prev.filter(id => id !== refId));
      } else {
        await addToFavorites(user.id, 'آية', refId);
        setFavorites(prev => [...prev, refId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const fetchSurahs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.alquran.cloud/v1/surah');
      if (!response.ok) throw new Error();
      const data = await response.json();
      setSurahs(data.data);
    } catch (error) {
      console.error('Error fetching surahs:', error);
      setError('تعذر تحميل قائمة السور. يرجى التحقق من اتصالك بالإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSurahDetails = async (number: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${number}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setAyahs(data.data.ayahs);
      setSelectedSurah(surahs.find(s => s.number === number) || null);
      
      // Set audio URL for the surah (using a specific reciter)
      setAudioUrl(`https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${number}.mp3`);
    } catch (error) {
      console.error('Error fetching surah details:', error);
      setError('تعذر تحميل تفاصيل السورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAudio = () => {
    if (!audioUrl) return;
    
    if (isPlaying) {
      audio?.pause();
      setIsPlaying(false);
    } else {
      if (!audio) {
        const newAudio = new Audio(audioUrl);
        newAudio.onended = () => setIsPlaying(false);
        setAudio(newAudio);
        newAudio.play();
      } else {
        audio.play();
      }
      setIsPlaying(true);
    }
  };

  const filteredSurahs = surahs.filter(s => 
    s.name.includes(searchQuery) || 
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedSurah) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => {
              setSelectedSurah(null);
              audio?.pause();
              setIsPlaying(false);
            }}
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm border border-slate-100"
          >
            <ChevronLeft className="w-6 h-6 rotate-180" />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-black text-emerald-700">{selectedSurah.name}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedSurah.englishNameTranslation}</p>
          </div>
          <button 
            onClick={toggleAudio}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border transition-all ${
              isPlaying ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-600 border-slate-100'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="text-center mb-12">
            <p className="text-4xl font-serif text-emerald-800 leading-relaxed mb-4">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
            <div className="w-24 h-1 bg-emerald-100 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-12">
            {ayahs.map((ayah) => (
              <div key={ayah.number} className="group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-black text-xs border border-emerald-100">
                    {ayah.numberInSurah}
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="text-3xl font-serif text-slate-800 leading-[1.8] text-right" dir="rtl">
                      {ayah.text}
                    </p>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleFavorite(`${selectedSurah.number}:${ayah.numberInSurah}`)}
                        className={`p-2 rounded-lg transition-colors ${
                          favorites.includes(`${selectedSurah.number}:${ayah.numberInSurah}`)
                            ? 'bg-rose-50 text-rose-500'
                            : 'bg-slate-50 text-slate-400 hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(`${selectedSurah.number}:${ayah.numberInSurah}`) ? 'fill-current' : ''}`} />
                      </button>
                      <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-emerald-600 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-slate-50 w-full group-last:hidden"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <input 
          type="text" 
          placeholder="ابحث عن سورة..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border-none rounded-2xl px-12 py-4 shadow-sm focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
          <p className="text-slate-500 font-bold">جاري التحميل...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-8 rounded-[3rem] border border-red-100 flex flex-col items-center gap-4 text-center">
          <Info className="w-12 h-12 text-red-600" />
          <p className="text-red-700 font-bold text-lg">{error}</p>
          <button 
            onClick={() => selectedSurah ? fetchSurahDetails(selectedSurah.number) : fetchSurahs()}
            className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200 active:scale-95 transition-transform"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSurahs.map((surah) => (
            <button 
              key={surah.number}
              onClick={() => fetchSurahDetails(surah.number)}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100 transition-all flex items-center gap-4 group text-right"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-lg border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                {surah.number}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-800 mb-0.5">{surah.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{surah.englishName} • {surah.numberOfAyahs} آية</p>
              </div>
              <ChevronLeft className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
