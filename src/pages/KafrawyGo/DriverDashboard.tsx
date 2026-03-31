import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, DollarSign, Star, MapPin, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">لوحة تحكم الكابتن</h1>
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${isOnline ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
        >
          {isOnline ? <ToggleRight className="text-green-600" /> : <ToggleLeft />}
          {isOnline ? 'أنت متصل' : 'أنت غير متصل'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <DollarSign size={16} />
            <span className="text-sm">أرباح اليوم</span>
          </div>
          <p className="text-2xl font-black text-slate-900">٤٥٠ <span className="text-sm font-normal text-slate-500">ج.م</span></p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Star size={16} />
            <span className="text-sm">التقييم</span>
          </div>
          <p className="text-2xl font-black text-slate-900">٤.٨ <span className="text-sm font-normal text-slate-500">/ ٥</span></p>
        </div>
      </div>

      {/* Active Trip */}
      {isOnline ? (
        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <Car size={24} />
            </div>
            <h2 className="text-lg font-bold">في انتظار رحلة جديدة...</h2>
          </div>
          <p className="text-blue-100 text-sm">نظامنا يبحث عن أقرب طلب رحلة لك في كفر البطيخ.</p>
        </div>
      ) : (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg text-white text-center">
          <h2 className="text-lg font-bold mb-2">ابدأ العمل الآن</h2>
          <p className="text-slate-400 text-sm mb-4">قم بتغيير حالتك إلى "متصل" لاستقبال طلبات الرحلات.</p>
        </div>
      )}

      {/* Recent Trips */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-700">آخر الرحلات</h3>
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="text-blue-500" />
              <div>
                <p className="font-medium">رحلة إلى محطة القطار</p>
                <p className="text-xs text-slate-500">منذ ٣ ساعات</p>
              </div>
            </div>
            <span className="font-bold text-slate-900">٨٠ ج.م</span>
          </div>
        ))}
      </div>
    </div>
  );
}
