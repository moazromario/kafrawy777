import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, MapPin, Bell, BellOff, RefreshCw, 
  Loader2, Info, Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface Timings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: { en: string; ar: string };
  month: { en: string; ar: string };
  year: string;
}

export default function PrayerTimes() {
  const [timings, setTimings] = useState<Timings | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('جاري تحديد الموقع...');
  const [nextPrayer, setNextPrayer] = useState<{ name: string, time: string, remaining: string } | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    getUserLocation();
    const interval = setInterval(() => {
      if (timings) calculateNextPrayer(timings);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getUserLocation = () => {
    setLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchPrayerTimesByCoords(latitude, longitude);
        },
        (err) => {
          console.error('Geolocation error:', err);
          fetchPrayerTimesByCity('Cairo', 'Egypt');
        }
      );
    } else {
      fetchPrayerTimesByCity('Cairo', 'Egypt');
    }
  };

  const fetchPrayerTimesByCoords = async (lat: number, lng: number) => {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `prayerTimes_${lat}_${lng}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const { data, date } = JSON.parse(cached);
      if (date === today) {
        setTimings(data.timings);
        setHijriDate(data.date.hijri);
        setLocationName(data.meta.timezone.split('/')[1] || 'موقعك الحالي');
        calculateNextPrayer(data.timings);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=5`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      localStorage.setItem(cacheKey, JSON.stringify({ data: data.data, date: today }));
      setTimings(data.data.timings);
      setHijriDate(data.data.date.hijri);
      setLocationName(data.data.meta.timezone.split('/')[1] || 'موقعك الحالي');
      calculateNextPrayer(data.data.timings);
    } catch (err) {
      setError('تعذر جلب مواقيت الصلاة.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrayerTimesByCity = async (city: string, country: string) => {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `prayerTimes_${city}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const { data, date } = JSON.parse(cached);
      if (date === today) {
        setTimings(data.timings);
        setHijriDate(data.date.hijri);
        setLocationName(`${city}، ${country}`);
        calculateNextPrayer(data.timings);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=5`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      localStorage.setItem(cacheKey, JSON.stringify({ data: data.data, date: today }));
      setTimings(data.data.timings);
      setHijriDate(data.data.date.hijri);
      setLocationName(`${city}، ${country}`);
      calculateNextPrayer(data.data.timings);
    } catch (err) {
      setError('تعذر جلب مواقيت الصلاة.');
    } finally {
      setLoading(false);
    }
  };

  const calculateNextPrayer = (timings: Timings) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { name: 'الفجر', time: timings.Fajr },
      { name: 'الشروق', time: timings.Sunrise },
      { name: 'الظهر', time: timings.Dhuhr },
      { name: 'العصر', time: timings.Asr },
      { name: 'المغرب', time: timings.Maghrib },
      { name: 'العشاء', time: timings.Isha },
    ];

    let next = null;
    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = hours * 60 + minutes;
      if (prayerTime > currentTime) {
        const diff = prayerTime - currentTime;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        next = { 
          ...prayer, 
          remaining: `متبقي ${h > 0 ? `${h} ساعة و ` : ''}${m} دقيقة`
        };
        
        // Check if it's time to play Adhan
        if (diff === 0 && notifications.includes(prayer.name)) {
          playAdhan();
        }
        break;
      }
    }

    if (!next) {
      const [hours, minutes] = prayers[0].time.split(':').map(Number);
      const prayerTime = (hours + 24) * 60 + minutes;
      const diff = prayerTime - currentTime;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      next = { 
        ...prayers[0], 
        remaining: `متبقي ${h} ساعة و ${m} دقيقة`
      };
    }
    setNextPrayer(next);
  };

  const playAdhan = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const toggleNotification = (prayer: string) => {
    setNotifications(prev => 
      prev.includes(prayer) ? prev.filter(p => p !== prayer) : [...prev, prayer]
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold">جاري تحميل مواقيت الصلاة...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-8 rounded-[3rem] border border-red-100 flex flex-col items-center gap-4 text-center">
        <Info className="w-12 h-12 text-red-600" />
        <p className="text-red-700 font-bold text-lg">{error}</p>
        <button 
          onClick={getUserLocation}
          className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200 active:scale-95 transition-transform"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <audio ref={audioRef} src="https://www.islamcan.com/audio/adhan/azan1.mp3" />
      
      {/* Hijri Date */}
      {hijriDate && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center gap-2 text-slate-600 font-bold">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <span>{hijriDate.day} {hijriDate.month.ar} {hijriDate.year} هـ</span>
        </div>
      )}

      {/* Next Prayer Card */}
      {nextPrayer && (
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-[3rem] shadow-2xl shadow-emerald-200 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <p className="text-emerald-100 font-black text-sm uppercase tracking-widest mb-2">الصلاة القادمة</p>
            <h2 className="text-5xl font-black mb-4">{nextPrayer.name}</h2>
            <div className="text-6xl font-black tracking-tighter mb-6 flex items-baseline gap-2">
              {nextPrayer.time}
            </div>
            
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
              <Clock className="w-4 h-4" />
              <p className="text-sm font-bold">{nextPrayer.remaining}</p>
            </div>
          </div>
        </div>
      )}

      {/* Prayer Times List */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-black text-slate-900">{locationName}</h3>
          </div>
          <button 
            onClick={getUserLocation}
            className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {timings && Object.entries({
            'الفجر': timings.Fajr,
            'الشروق': timings.Sunrise,
            'الظهر': timings.Dhuhr,
            'العصر': timings.Asr,
            'المغرب': timings.Maghrib,
            'العشاء': timings.Isha,
          }).map(([name, time]) => (
            <div 
              key={name}
              className={`flex items-center justify-between p-5 rounded-2xl transition-all ${
                nextPrayer?.name === name ? 'bg-emerald-50 border border-emerald-100' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                  nextPrayer?.name === name ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400'
                }`}>
                  {name[0]}
                </div>
                <div>
                  <p className={`text-lg font-black ${nextPrayer?.name === name ? 'text-emerald-700' : 'text-slate-800'}`}>{name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <p className={`text-2xl font-black tracking-tighter ${nextPrayer?.name === name ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {time}
                </p>
                <button 
                  onClick={() => toggleNotification(name)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    notifications.includes(name) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-300 hover:text-slate-400'
                  }`}
                >
                  {notifications.includes(name) ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
