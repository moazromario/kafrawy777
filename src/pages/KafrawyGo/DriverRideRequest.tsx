import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, User, DollarSign, Check, X, ArrowRight, ChevronRight, Clock, Star, ShieldCheck, Package, Zap } from 'lucide-react';
import KafrawyLayout from '../../components/KafrawyLayout';
import { motion, AnimatePresence } from 'motion/react';

import socket from '../../services/socket';

export default function DriverRideRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const serviceType = location.state?.serviceType || 'ride';
  const ride = location.state?.ride;
  const [counterOffer, setCounterOffer] = useState<number>(serviceType === 'tuktuk' ? 35 : 85);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isWaiting) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isWaiting) {
      navigate('/kafrawy-go/driver-dashboard');
    }
  }, [timeLeft, navigate, isWaiting]);

  useEffect(() => {
    // Listen for ride matched event
    socket.on('ride_matched', (matchedRide) => {
      console.log('Ride matched!', matchedRide);
      navigate('/kafrawy-go/driver/navigation', { state: { serviceType, ride: matchedRide } });
    });

    return () => {
      socket.off('ride_matched');
    };
  }, [navigate, serviceType]);

  const handleResponse = (type: 'accept' | 'counter', price?: number) => {
    if (!ride) return;
    
    socket.emit('driver_response', {
      rideId: ride.id,
      responseType: type,
      price: price || ride.suggestedPrice
    });
    
    setIsWaiting(true);
  };

  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full" dir="rtl">
        <div className="max-w-2xl mx-auto px-4 pt-8">
          {/* Header */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/kafrawy-go/driver-dashboard')} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <ChevronRight className="w-6 h-6 text-slate-900" />
              </button>
              <h1 className="text-2xl font-black text-slate-900">
                {serviceType === 'delivery' ? 'طلب دليفري جديد' : serviceType === 'tuktuk' ? 'طلب توكتوك جديد' : 'طلب رحلة جديد'}
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-black">
              <Clock size={20} />
              <span>٠٠:{timeLeft < 10 ? `٠${timeLeft}` : timeLeft}</span>
            </div>
          </div>

          {/* Delivery Info if applicable */}
          {serviceType === 'delivery' && (
            <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
                <Package size={24} />
              </div>
              <div>
                <p className="text-xs text-orange-400 font-black mb-1">المنتج المطلوب توصيله</p>
                <p className="font-black text-orange-900">وجبة غداء (٢ كجم تقريباً)</p>
              </div>
            </div>
          )}

          {/* TukTuk Info if applicable */}
          {serviceType === 'tuktuk' && (
            <div className="bg-yellow-50 p-6 rounded-[2rem] border border-yellow-100 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-yellow-600 shadow-sm">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-xs text-yellow-600 font-black mb-1">نوع الخدمة</p>
                <p className="font-black text-yellow-900">توكتوك سريع (بحد أقصى ٣ ركاب)</p>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <img 
                  src="https://i.pravatar.cc/150?u=user123" 
                  alt="Customer" 
                  className="w-16 h-16 rounded-2xl object-cover"
                />
                <div>
                  <h2 className="text-xl font-black text-slate-900">أحمد محمد</h2>
                  <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                    <Star size={14} fill="currentColor" />
                    <span>٤.٩</span>
                    <span className="text-slate-400 mr-1">(١٢٠ رحلة)</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                <ShieldCheck size={24} />
              </div>
            </div>

            <div className="space-y-6 relative">
              <div className="absolute top-8 bottom-8 right-4 w-0.5 bg-slate-100"></div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-black mb-1">نقطة الانطلاق</p>
                  <p className="font-black text-slate-900">وسط البلد - شارع الجمهورية</p>
                </div>
              </div>

              <div className="flex items-start gap-4 relative z-10">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mt-1">
                  <MapPin className="text-red-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-black mb-1">وجهة الوصول</p>
                  <p className="font-black text-slate-900">محطة القطار - كفر البطيخ</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-black mb-1">المسافة التقديرية</p>
                <p className="font-black text-slate-900">٤.٥ كم (١٢ دقيقة)</p>
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-black mb-1">السعر المقترح</p>
                <p className="text-3xl font-black text-emerald-600">
                  {serviceType === 'tuktuk' ? '٣٠' : '٨٠'} <span className="text-sm">ج.م</span>
                </p>
              </div>
            </div>
          </div>

          {/* Counter Offer Section */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
            <h3 className="text-lg font-black text-slate-900 mb-4">تقديم عرض سعر جديد</h3>
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setCounterOffer(Math.max(80, counterOffer - 5))}
                disabled={isWaiting}
                className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl font-black text-slate-900 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
              >
                -
              </button>
              <div className="flex-1 bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                <span className="text-3xl font-black text-slate-900">{counterOffer}</span>
                <span className="text-sm font-bold text-slate-400 mr-2">ج.م</span>
              </div>
              <button 
                onClick={() => setCounterOffer(counterOffer + 5)}
                disabled={isWaiting}
                className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl font-black text-slate-900 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
              >
                +
              </button>
            </div>
            <button 
              onClick={() => handleResponse('counter', counterOffer)}
              disabled={isWaiting}
              className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:bg-slate-400"
            >
              {isWaiting ? 'جاري انتظار رد العميل...' : `إرسال العرض بـ ${counterOffer} ج.م`}
            </button>
          </div>

          {/* Quick Actions */}
          {!isWaiting && (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/kafrawy-go/driver-dashboard')}
                className="bg-white text-red-600 py-5 rounded-[2rem] font-black text-xl border border-red-100 hover:bg-red-50 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <X size={24} />
                رفض
              </button>
              <button 
                onClick={() => handleResponse('accept')}
                className="bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95"
              >
                <Check size={24} />
                قبول بـ {ride?.suggestedPrice || 80} ج.م
              </button>
            </div>
          )}
        </div>
      </div>
    </KafrawyLayout>
  );
}
