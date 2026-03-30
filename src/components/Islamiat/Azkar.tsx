import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, RefreshCw, ChevronLeft, 
  ChevronRight, Heart, Share2, Info, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { addToFavorites, removeFromFavorites, getUserFavorites, getAzkarByCategory, Zikr } from '../../services/islamicDatabase';
import { Loader2 } from 'lucide-react';

export default function Azkar() {
  const { user } = useAuth();
  const [view, setView] = useState<'menu' | 'morning' | 'evening' | 'tasbih'>('menu');
  const [tasbihCount, setTasbihCount] = useState(0);
  const [currentZikrIndex, setCurrentZikrIndex] = useState(0);
  const [zikrCount, setZikrCount] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [azkar, setAzkar] = useState<Zikr[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    if (view === 'morning' || view === 'evening') {
      loadAzkar(view === 'morning' ? 'صباح' : 'مساء');
    }
  }, [view]);

  const loadAzkar = async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAzkarByCategory(category);
      setAzkar(data);
      setCurrentZikrIndex(0);
      setZikrCount(0);
    } catch (err) {
      console.error('Error loading azkar:', err);
      setError('حدث خطأ أثناء تحميل الأذكار. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const favs = await getUserFavorites(user.id);
      setFavorites(favs.filter(f => f.type === 'ذكر').map(f => f.ref_id));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (refId: string) => {
    if (!user) return;
    const isFav = favorites.includes(refId);
    try {
      if (isFav) {
        await removeFromFavorites(user.id, 'ذكر', refId);
        setFavorites(prev => prev.filter(id => id !== refId));
      } else {
        await addToFavorites(user.id, 'ذكر', refId);
        setFavorites(prev => [...prev, refId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleZikrClick = (maxCount: number) => {
    if (zikrCount < maxCount - 1) {
      setZikrCount(prev => prev + 1);
    } else {
      setZikrCount(0);
      if (currentZikrIndex < azkar.length - 1) {
        setCurrentZikrIndex(prev => prev + 1);
      } else {
        setView('menu');
        setCurrentZikrIndex(0);
      }
    }
  };

  if (view === 'tasbih') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-12">
        <div className="flex items-center justify-between w-full mb-8">
          <button 
            onClick={() => setView('menu')}
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm border border-slate-100"
          >
            <ChevronLeft className="w-6 h-6 rotate-180" />
          </button>
          <h2 className="text-2xl font-black text-emerald-700">المسبحة الإلكترونية</h2>
          <button 
            onClick={() => setTasbihCount(0)}
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm border border-slate-100"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <div className="w-64 h-64 bg-white rounded-full shadow-2xl shadow-emerald-200 border-8 border-emerald-50 flex flex-col items-center justify-center">
            <p className="text-6xl font-black text-emerald-600 mb-2">{tasbihCount}</p>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest">تسبيحة</p>
          </div>
          <button 
            onClick={() => setTasbihCount(prev => prev + 1)}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-300 active:scale-90 transition-transform"
          >
            <Plus className="w-10 h-10" />
          </button>
        </div>

        <div className="text-center space-y-4">
          <p className="text-2xl font-serif text-slate-800">سُبْحَانَ اللَّهِ وَبِحَمْدِهِ</p>
          <p className="text-slate-400 font-medium">اضغط على الزر للعد</p>
        </div>
      </div>
    );
  }

  if (view === 'morning' || view === 'evening') {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
          <p className="text-slate-500 font-bold">جاري تحميل الأذكار...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 p-6 rounded-[2.5rem] border border-red-100 flex flex-col items-center gap-4 text-center">
          <Info className="w-10 h-10 text-red-600" />
          <p className="text-red-700 font-bold">{error}</p>
          <button 
            onClick={() => loadAzkar(view === 'morning' ? 'صباح' : 'مساء')}
            className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold"
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }

    if (azkar.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-500 font-bold">لا توجد أذكار متوفرة حالياً.</p>
          <button onClick={() => setView('menu')} className="mt-4 text-emerald-600 font-bold underline">العودة للقائمة</button>
        </div>
      );
    }

    const currentZikr = azkar[currentZikrIndex];

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => {
              setView('menu');
              setCurrentZikrIndex(0);
              setZikrCount(0);
            }}
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm border border-slate-100"
          >
            <ChevronLeft className="w-6 h-6 rotate-180" />
          </button>
          <h2 className="text-2xl font-black text-emerald-700">
            {view === 'morning' ? 'أذكار الصباح' : 'أذكار المساء'}
          </h2>
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-black text-sm border border-emerald-100">
            {currentZikrIndex + 1}/{azkar.length}
          </div>
        </div>

        <button 
          onClick={() => handleZikrClick(currentZikr.count)}
          className="w-full bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 text-right space-y-8 active:scale-[0.98] transition-transform"
        >
          <p className="text-3xl font-serif text-slate-800 leading-[1.8]" dir="rtl">
            {currentZikr.content}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <Share2 className="w-5 h-5" />
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(`${view}-${currentZikr.id}`);
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  favorites.includes(`${view}-${currentZikr.id}`) 
                    ? 'bg-rose-50 text-rose-500' 
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorites.includes(`${view}-${currentZikr.id}`) ? 'fill-current' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-slate-400 font-black text-sm uppercase tracking-widest">التكرار</p>
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-emerald-200">
                {zikrCount}/{currentZikr.count}
              </div>
            </div>
          </div>
        </button>

        <div className="flex justify-center gap-4">
          <button 
            disabled={currentZikrIndex === 0}
            onClick={() => {
              setCurrentZikrIndex(prev => prev - 1);
              setZikrCount(0);
            }}
            className="p-4 bg-white rounded-2xl border border-slate-100 text-slate-400 disabled:opacity-30"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button 
            disabled={currentZikrIndex === azkar.length - 1}
            onClick={() => {
              setCurrentZikrIndex(prev => prev + 1);
              setZikrCount(0);
            }}
            className="p-4 bg-white rounded-2xl border border-slate-100 text-slate-400 disabled:opacity-30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <MenuCard 
        onClick={() => setView('morning')}
        icon={<Sun className="text-amber-500" />}
        title="أذكار الصباح"
        description="نور يومك بذكر الله"
        color="bg-amber-50"
      />
      <MenuCard 
        onClick={() => setView('evening')}
        icon={<Moon className="text-blue-500" />}
        title="أذكار المساء"
        description="اختم يومك بذكر الله"
        color="bg-blue-50"
      />
      <MenuCard 
        onClick={() => setView('tasbih')}
        icon={<RefreshCw className="text-emerald-500" />}
        title="المسبحة الإلكترونية"
        description="سبح واستغفر"
        color="bg-emerald-50"
      />
    </div>
  );
}

function MenuCard({ onClick, icon, title, description, color }: { onClick: () => void, icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all flex items-center gap-6 group text-right"
    >
      <div className={`w-20 h-20 ${color} rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-10 h-10" })}
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-black text-slate-900 mb-1">{title}</h3>
        <p className="text-slate-500 font-medium">{description}</p>
      </div>
      <ChevronLeft className="w-6 h-6 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
    </button>
  );
}
