import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Star, Car, DollarSign, ChevronRight, User, ShieldCheck, Zap } from 'lucide-react';
import KafrawyLayout from '../../components/KafrawyLayout';
import { motion } from 'motion/react';

const mockDrivers = [
  { id: 1, name: 'محمد علي', rating: 4.8, car: 'هيونداي فيرنا - فضي', price: 80, trips: 1250, photo: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'أحمد حسن', rating: 4.9, car: 'كيا سيراتو - أسود', price: 85, trips: 840, photo: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'محمود إبراهيم', rating: 4.7, car: 'تويوتا كورولا - أبيض', price: 75, trips: 2100, photo: 'https://i.pravatar.cc/150?u=3' },
];

import socket from '../../services/socket';

export default function RideMatching() {
  const navigate = useNavigate();
  const location = useLocation();
  const requestData = location.state || {};
  
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    // Timeout if no drivers respond within 45 seconds
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 45000);

    // Listen for driver responses

    socket.on('ride_response', ({ rideId, response }) => {
      console.log('Received driver response:', response);
      setDrivers(prev => {
        // Check if driver already responded
        if (prev.find(d => d.driverId === response.driverId)) return prev;
        return [...prev, response];
      });
      setLoading(false);
    });

    // Cleanup on unmount
    return () => {
      socket.off('ride_response');
    };
  }, []);

  const handleAccept = (driver: any) => {
    // Notify the server about the selected driver
    socket.emit('select_driver', { 
      rideId: requestData.id || `ride_${Date.now()}`, // Fallback if id missing
      driverSocketId: driver.driverId 
    });

    navigate('/kafrawy-go/active', { state: { driver, requestData } });
  };

  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full" dir="rtl">
        <div className="max-w-3xl mx-auto px-4 pt-8">
          {/* Header */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 mb-8 flex items-center gap-4">
            <button onClick={() => navigate('/kafrawy-go/request')} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>
            <h1 className="text-2xl font-black text-slate-900">عروض الكباتن</h1>
          </div>

          {loading && !timeoutReached ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-8">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {requestData.serviceType === 'delivery' ? (
                    <Loader2 className="w-8 h-8 text-blue-600 animate-pulse" />
                  ) : requestData.serviceType === 'tuktuk' ? (
                    <Zap className="w-8 h-8 text-yellow-600 animate-pulse" />
                  ) : (
                    <Car className="w-8 h-8 text-blue-600 animate-pulse" />
                  )}
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-black text-slate-900">جاري البحث عن أفضل العروض...</p>
                <p className="text-slate-500 font-bold">طلبك متاح الآن لـ 15 كابتن قريب منك</p>
              </div>
            </div>
          ) : timeoutReached && drivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <Car size={48} className="opacity-50" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">عذراً، لا يوجد كباتن متاحين</h2>
              <p className="text-slate-500 font-bold max-w-xs">
                جميع الكباتن في منطقتك مشغولون حالياً. يرجى المحاولة مرة أخرى بعد قليل.
              </p>
              <button 
                onClick={() => navigate('/kafrawy-go/request')}
                className="w-full max-w-xs bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 mt-4"
              >
                إعادة البحث
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {requestData.serviceType === 'delivery' && requestData.productType && (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Loader2 size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-black mb-1">تفاصيل الطلب</p>
                      <p className="font-black text-slate-900">{requestData.productType} ({requestData.weight})</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-400 font-black mb-1">من: {requestData.pickup}</p>
                    <p className="text-xs text-slate-400 font-black">إلى: {requestData.destination}</p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3 mb-2">
                <ShieldCheck className="text-blue-600 shrink-0" />
                <p className="text-sm font-bold text-blue-800">جميع الكباتن موثقون لدينا لضمان أمان رحلتك</p>
              </div>

              {drivers.map((driver, index) => (
                <motion.div 
                  key={driver.driverId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={driver.photo} 
                          alt={driver.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-50 shadow-sm"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{driver.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-lg text-xs font-black">
                            <Star className="w-3 h-3 fill-current" />
                            {driver.rating}
                          </div>
                          <span className="text-xs text-slate-400 font-bold">{driver.trips} رحلة</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl font-black text-xl shadow-inner">
                        {driver.price} <span className="text-xs">ج.م</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                    {requestData.serviceType === 'tuktuk' ? (
                      <Zap className="text-yellow-600" size={20} />
                    ) : (
                      <Car className="text-slate-400" size={20} />
                    )}
                    <p className="font-bold text-slate-700">{driver.car}</p>
                  </div>

                  <button 
                    onClick={() => handleAccept(driver)}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                  >
                    قبول العرض
                  </button>
                </motion.div>
              ))}

              <button 
                onClick={() => navigate('/kafrawy-go/request')}
                className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
              >
                إلغاء الطلب
              </button>
            </div>
          )}
        </div>
      </div>
    </KafrawyLayout>
  );
}
