import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Navigation, ChevronRight, AlertCircle, User, DollarSign, Clock, CheckCircle, Shield, Package, Zap } from 'lucide-react';
import KafrawyLayout from '../../components/KafrawyLayout';
import { motion } from 'motion/react';

import socket from '../../services/socket';

export default function DriverRideActive() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDelivery = location.state?.serviceType === 'delivery';
  const isTuktuk = location.state?.serviceType === 'tuktuk';
  const ride = location.state?.ride;
  const [otp, setOtp] = useState('');
  const [distance, setDistance] = useState(4.5);
  const [eta, setEta] = useState(12);

  // Simulate moving towards destination
  useEffect(() => {
    const interval = setInterval(() => {
      setDistance(prev => Math.max(0, prev - 0.1));
      setEta(prev => Math.max(0, prev - 0.5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleEndRide = () => {
    if (ride) {
      socket.emit('end_ride', ride.id);
    }
    navigate('/kafrawy-go/driver/earnings');
  };

  const handleCancelRide = () => {
    if (window.confirm('هل أنت متأكد من إلغاء الرحلة؟ سيؤثر هذا على تقييمك.')) {
      if (ride) {
        socket.emit('cancel_ride', { rideId: ride.id, cancelledBy: 'driver' });
      }
      navigate('/kafrawy-go/driver-dashboard');
    }
  };

  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full" dir="rtl">
        {/* Map Background Simulation */}
        <div className="h-[50vh] bg-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/31.4175,31.0369,14,0/800x600?access_token=mock')] bg-cover bg-center opacity-50"></div>
          
          {/* Simulated Route Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path d="M 100 400 Q 200 300 300 200" stroke="#2563eb" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-pulse" />
          </svg>

          {/* Car Marker */}
          <motion.div 
            animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 p-2 rounded-full shadow-xl border-4 border-white z-20"
          >
            <Navigation className="text-white rotate-45" size={24} />
          </motion.div>

          {/* Destination Marker */}
          <div className="absolute top-1/4 left-1/3 bg-red-600 p-2 rounded-full shadow-xl border-4 border-white z-10">
            <MapPin className="text-white" size={20} />
          </div>

          {/* Floating Navigation Card */}
          <div className="absolute top-6 left-4 right-4 bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                {isDelivery ? <Package size={28} className="text-orange-400" /> : isTuktuk ? <Zap size={28} className="text-yellow-400" /> : <Navigation size={28} className="text-blue-400" />}
              </div>
              <div>
                <h3 className="text-lg font-black">{isDelivery ? 'جاري توصيل الطلب' : isTuktuk ? 'رحلة توكتوك جارية' : 'الرحلة جارية'}</h3>
                <p className="text-blue-200 font-bold">محطة القطار - كفر البطيخ</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-2xl font-black">{distance.toFixed(1)} كم</p>
              <p className="text-xs text-blue-300 font-bold">{eta.toFixed(0)} دقيقة</p>
            </div>
          </div>
        </div>

        {/* Bottom Details Card */}
        <div className="max-w-2xl mx-auto px-4 -mt-10 relative z-30">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            {isDelivery && (
              <div className="mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-4">
                <Package className="text-orange-600" size={24} />
                <div>
                  <p className="text-xs text-orange-400 font-black">المنتج</p>
                  <p className="font-black text-orange-900">وجبة غداء (٢ كجم)</p>
                </div>
              </div>
            )}
            {isTuktuk && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-center gap-4">
                <Zap className="text-yellow-600" size={24} />
                <div>
                  <p className="text-xs text-yellow-600 font-black">نوع الخدمة</p>
                  <p className="font-black text-yellow-900">توكتوك سريع</p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <img 
                  src="https://i.pravatar.cc/150?u=user123" 
                  alt="Customer" 
                  className="w-16 h-16 rounded-2xl object-cover"
                />
                <div>
                  <h2 className="text-xl font-black text-slate-900">أحمد محمد</h2>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <Shield size={14} />
                    <span>{isDelivery ? 'توصيل آمن' : 'رحلة آمنة'}</span>
                  </div>
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-black mb-1">السعر المتفق عليه</p>
                <p className="text-2xl font-black text-slate-900">٨٠ ج.م</p>
              </div>
            </div>

            {isDelivery && (
              <div className="mb-8 p-6 bg-blue-50 rounded-3xl border border-blue-100">
                <p className="text-sm font-black text-blue-900 mb-3">أدخل كود استلام الطلب من العميل:</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <input 
                      key={i}
                      type="text" 
                      maxLength={1}
                      className="w-full h-14 bg-white border border-blue-200 rounded-xl text-center text-2xl font-black text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleEndRide}
                className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95"
              >
                {isDelivery ? 'تأكيد التسليم وتحصيل المبلغ' : isTuktuk ? 'إنهاء رحلة التوكتوك وتحصيل المبلغ' : 'إنهاء الرحلة وتحصيل المبلغ'}
              </button>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleCancelRide}
                  className="w-full bg-white text-slate-500 py-4 rounded-[2rem] font-black text-lg border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  إلغاء الرحلة
                </button>
                <button 
                  onClick={() => navigate('/kafrawy-go/driver-dashboard')}
                  className="w-full bg-red-50 text-red-600 py-4 rounded-[2rem] font-black text-lg border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <AlertCircle size={20} />
                  طوارئ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </KafrawyLayout>
  );
}
