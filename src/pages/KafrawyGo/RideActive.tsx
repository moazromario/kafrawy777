import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, CheckCircle, MapPin, Clock, Share2, AlertTriangle } from 'lucide-react';
import BackButton from '../../components/BackButton';

export default function RideActive() {
  const navigate = useNavigate();
  const [distance, setDistance] = useState(2.5);

  useEffect(() => {
    const interval = setInterval(() => {
      setDistance(prev => Math.max(0.1, prev - 0.1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 space-y-6 pb-24">
      <BackButton />
      <h1 className="text-2xl font-bold text-slate-900">رحلتك في الطريق</h1>
      
      {/* Map Placeholder */}
      <div className="w-full h-64 bg-slate-200 rounded-2xl flex items-center justify-center border border-slate-300 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" />
        </div>
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
          الكابتن يقترب...
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <User className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">الكابتن: محمد علي</h2>
            <p className="text-slate-500 text-sm">هيونداي فيرنا - فضي (أ ب ج 1234)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Clock className="w-4 h-4" /> وصول الكابتن
            </div>
            <p className="font-bold text-lg">{Math.round(distance * 2)} دقائق</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <MapPin className="w-4 h-4" /> المسافة
            </div>
            <p className="font-bold text-lg">{distance.toFixed(1)} كم</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
            <Phone className="w-5 h-5" /> اتصل
          </button>
          <button className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-xl font-semibold hover:bg-blue-200 transition flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" /> مشاركة
          </button>
        </div>
        
        <button className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2">
          <AlertTriangle className="w-5 h-5" /> طوارئ (SOS)
        </button>

        <button 
          onClick={() => navigate('/kafrawy-go/rate')}
          className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" /> إنهاء الرحلة
        </button>
      </div>
    </div>
  );
}
