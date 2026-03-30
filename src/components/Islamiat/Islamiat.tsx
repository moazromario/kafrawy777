import React, { useState, useEffect } from 'react';
import { 
  Moon, Sun, Compass, BookOpen, Clock, ChevronLeft, 
  Play, Pause, Volume2, MapPin, Bell, BellOff, 
  RefreshCw, Heart, Share2, Info, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import Quran from './Quran';
import Azkar from './Azkar';
import PrayerTimes from './PrayerTimes';
import Qibla from './Qibla';
import MainLayout from '../MainLayout';

type Tab = 'prayer' | 'quran' | 'azkar' | 'qibla';

export default function Islamiat() {
  const [activeTab, setActiveTab] = useState<Tab>('prayer');

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 pb-20" dir="rtl">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-8 rounded-b-[3rem] shadow-2xl mb-8 relative">
          <Link 
            to="/islamiat/showcase"
            className="absolute top-8 left-8 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
            title="عرض التصاميم"
          >
            <ImageIcon className="w-6 h-6" />
          </Link>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight mb-1">الركن الإسلامي</h1>
              <p className="text-emerald-100 font-medium">تطبيق كفراوي - رفيقك في العبادة</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <Moon className="w-10 h-10 text-white" />
            </div>
          </div>
          
          {/* Quick Stats / Date */}
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex-shrink-0">
              <p className="text-xs font-bold text-emerald-200">التاريخ الهجري</p>
              <p className="font-black">١٠ رمضان ١٤٤٧</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex-shrink-0">
              <p className="text-xs font-bold text-emerald-200">المدينة</p>
              <p className="font-black">القاهرة، مصر</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 mb-8">
          <div className="bg-white p-2 rounded-3xl shadow-xl shadow-slate-200/50 flex gap-2 border border-slate-100">
            <TabButton 
              active={activeTab === 'prayer'} 
              onClick={() => setActiveTab('prayer')} 
              icon={<Clock />} 
              label="الصلاة" 
            />
            <TabButton 
              active={activeTab === 'quran'} 
              onClick={() => setActiveTab('quran')} 
              icon={<BookOpen />} 
              label="القرآن" 
            />
            <TabButton 
              active={activeTab === 'azkar'} 
              onClick={() => setActiveTab('azkar')} 
              icon={<Sun />} 
              label="الأذكار" 
            />
            <TabButton 
              active={activeTab === 'qibla'} 
              onClick={() => setActiveTab('qibla')} 
              icon={<Compass />} 
              label="القبلة" 
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'prayer' && <PrayerTimes />}
              {activeTab === 'quran' && <Quran />}
              {activeTab === 'azkar' && <Azkar />}
              {activeTab === 'qibla' && <Qibla />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all gap-1 ${
        active 
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })}
      <span className="text-xs font-black">{label}</span>
    </button>
  );
}
