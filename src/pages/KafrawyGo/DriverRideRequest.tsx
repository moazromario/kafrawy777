import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, DollarSign, Check, X, ArrowRight } from 'lucide-react';
import BackButton from '../../components/BackButton';

export default function DriverRideRequest() {
  const navigate = useNavigate();
  const [counterOffer, setCounterOffer] = useState<number>(80);

  return (
    <div className="p-4 space-y-6 pb-24">
      <BackButton />
      <h1 className="text-2xl font-bold text-slate-900">طلب رحلة جديد</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center gap-3">
          <User className="text-blue-600" />
          <span className="font-semibold">أحمد محمد</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="text-slate-400" />
          <span>من: وسط البلد</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="text-slate-400" />
          <span>إلى: محطة القطار</span>
        </div>
        <div className="flex items-center gap-3">
          <DollarSign className="text-green-600" />
          <span className="font-bold text-lg">٨٠ ج.م (عرض العميل)</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <h3 className="font-bold text-slate-700">تقديم عرض خاص (مزايدة)</h3>
        <div className="flex items-center gap-4">
          <input 
            type="number" 
            value={counterOffer}
            onChange={(e) => setCounterOffer(Number(e.target.value))}
            className="w-full p-3 border border-slate-200 rounded-xl"
          />
          <span className="font-bold">ج.م</span>
        </div>
        <button 
          onClick={() => navigate('/kafrawy-go/active')}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          تقديم عرض بـ {counterOffer} ج.م
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => navigate('/kafrawy-go/driver-dashboard')}
          className="bg-red-100 text-red-700 py-4 rounded-xl font-semibold hover:bg-red-200 transition flex items-center justify-center gap-2"
        >
          <X size={20} /> رفض
        </button>
        <button 
          onClick={() => navigate('/kafrawy-go/active')}
          className="bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
        >
          <Check size={20} /> قبول العرض
        </button>
      </div>
    </div>
  );
}
