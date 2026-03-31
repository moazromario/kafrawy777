import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Plus, Minus } from 'lucide-react';
import BackButton from '../../components/BackButton';

export default function RequestRide() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [fare, setFare] = useState<number | null>(null);

  const handleRequest = () => {
    navigate('/kafrawy-go/matching');
  };

  const calculateFare = () => {
    if (pickup && destination) {
      // Simulate distance (1-20 km)
      const distance = Math.floor(Math.random() * 20) + 1;
      const baseRate = 5; // 5 EGP per km
      setFare(distance * baseRate);
    }
  };

  const adjustFare = (amount: number) => {
    if (fare !== null) {
      setFare(Math.max(10, fare + amount));
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <BackButton />
      <h1 className="text-2xl font-bold text-slate-900">طلب رحلة</h1>
      
      {/* Map Placeholder */}
      <div className="w-full h-64 bg-slate-200 rounded-2xl flex items-center justify-center border border-slate-300 relative overflow-hidden">
        <MapPin className="text-blue-600 w-12 h-12 animate-bounce" />
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
          موقعك الحالي
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="relative">
          <MapPin className="absolute right-3 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="موقع الالتقاط" 
            value={pickup}
            onChange={(e) => { setPickup(e.target.value); calculateFare(); }}
            className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute right-3 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="الوجهة" 
            value={destination}
            onChange={(e) => { setDestination(e.target.value); calculateFare(); }}
            className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {fare !== null && (
          <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center">
            <span className="text-blue-800 font-semibold">الأجرة:</span>
            <div className="flex items-center gap-4">
              <button onClick={() => adjustFare(-5)} className="bg-white p-2 rounded-full shadow-sm"><Minus size={16} /></button>
              <span className="text-2xl font-bold text-blue-900">{fare} ج.م</span>
              <button onClick={() => adjustFare(5)} className="bg-white p-2 rounded-full shadow-sm"><Plus size={16} /></button>
            </div>
          </div>
        )}

        <button 
          onClick={handleRequest}
          disabled={fare === null}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-slate-300"
        >
          البحث عن كابتن <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
