import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, User, CheckCircle, MapPin, Clock, Share2, AlertTriangle, MessageSquare, Shield, ChevronRight, Star, Car, Loader2, Zap, Navigation } from 'lucide-react';
import KafrawyLayout from '../../components/KafrawyLayout';
import { motion, AnimatePresence } from 'motion/react';

import socket from '../../services/socket';
import ChatModal from '../../components/ChatModal';
import MapComponent from '../../components/MapComponent';

export default function RideActive() {
  const navigate = useNavigate();
  const location = useLocation();
  const { driver, requestData } = location.state || { 
    driver: { name: 'محمد علي', car: 'هيونداي فيرنا - فضي', photo: 'https://i.pravatar.cc/150?u=1', rating: 4.8 },
    requestData: { pickup: 'وسط البلد', destination: 'محطة القطار', fare: 80, serviceType: 'ride' }
  };

  const [distance, setDistance] = useState(2.5);
  const [eta, setEta] = useState(5);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    // Listen for location updates from driver
    socket.on('ride_update', ({ rideId, location }) => {
      console.log('Received ride update:', location);
      setDistance(location.distance);
      setEta(location.eta);
      if (location.lat && location.lng) {
        setDriverLocation({ lat: location.lat, lng: location.lng });
      }
    });

    // Listen for ride completion
    socket.on('ride_completed', (rideId) => {
      console.log('Ride completed:', rideId);
      navigate('/kafrawy-go/rate', { state: { driver, requestData } });
    });

    // Listen for ride cancellation
    socket.on('ride_cancelled', ({ rideId }) => {
      console.log('Ride cancelled:', rideId);
      setIsCancelled(true);
    });

    return () => {
      socket.off('ride_update');
      socket.off('ride_completed');
      socket.off('ride_cancelled');
    };
  }, [driver, requestData, navigate]);

  return (
    <KafrawyLayout>
      <AnimatePresence>
        {isCancelled && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-sm p-8 rounded-[2.5rem] flex flex-col items-center text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">عذراً، تم إلغاء الرحلة</h2>
              <p className="text-slate-500 font-bold mb-8">
                قام الكابتن بإلغاء الرحلة. نعتذر عن هذا الإزعاج، يمكنك طلب رحلة جديدة الآن.
              </p>
              <button 
                onClick={() => navigate('/kafrawy-go')}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
              >
                العودة للرئيسية
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ChatModal 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        rideId={requestData.id || `ride_${Date.now()}`}
        senderId={socket.id || 'user'}
        recipientName={driver.name}
      />
      <div className="pb-24 min-h-screen bg-slate-50 w-full" dir="rtl">
        <div className="max-w-3xl mx-auto px-4 pt-8">
          {/* Header */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900">
                  {requestData.serviceType === 'tuktuk' ? 'توكتوك آمن' : 'رحلة آمنة'}
                </h1>
                <p className="text-xs text-slate-500 font-bold">جاري تتبع رحلتك الآن</p>
              </div>
            </div>
            <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black">
              {requestData.fare} ج.م
            </div>
          </div>

          {requestData.serviceType === 'delivery' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 text-white p-6 rounded-[2rem] mb-8 shadow-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <CheckCircle size={24} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-300 font-bold">كود استلام الطلب</p>
                  <p className="text-2xl font-black tracking-widest">4852</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs text-blue-300 font-bold">أعط الكود للكابتن</p>
                <p className="text-xs text-blue-300 font-bold">عند استلام المنتج</p>
              </div>
            </motion.div>
          )}
          
          {/* Real OpenStreetMap */}
          <div className="w-full h-80 bg-slate-200 rounded-[2.5rem] mb-8 flex items-center justify-center border-4 border-white shadow-xl relative overflow-hidden">
            <MapComponent 
              origin={requestData.pickupCoords}
              destination={requestData.destinationCoords}
              driverLocation={driverLocation}
              showDirections={true}
            />
            
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white flex items-center gap-2 z-[1000]">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-black text-slate-900">تتبع حي</span>
            </div>

            <button 
              onClick={() => {
                if (driverLocation) {
                  // This will trigger the MapComponent's mapCenter update
                  setDriverLocation({ ...driverLocation });
                }
              }}
              className="absolute bottom-6 right-6 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all active:scale-95 z-[1000]"
            >
              <Navigation size={20} />
            </button>

            <div className="absolute bottom-6 left-6 right-20 flex justify-between items-end z-[1000]">
              <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black shadow-lg border border-white flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                مباشر الآن
              </div>
              <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-xl flex flex-col items-center">
                <span className="text-2xl font-black">{eta}</span>
                <span className="text-[10px] font-bold uppercase opacity-80">دقائق للوصول</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
            {/* Driver Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={driver.photo || 'https://i.pravatar.cc/150?u=1'} 
                  alt={driver.name}
                  className="w-20 h-20 rounded-[2rem] object-cover border-4 border-slate-50 shadow-sm"
                />
                <div>
                  <h2 className="text-xl font-black text-slate-900">{driver.name}</h2>
                  <p className="text-slate-500 font-bold text-sm">{driver.car}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-black text-slate-700">{driver.rating}</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl text-center min-w-[100px]">
                <p className="text-[10px] text-slate-400 font-black mb-1">رقم السيارة</p>
                <p className="font-black text-slate-900">أ ب ج 1234</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="bg-green-600 text-white py-4 rounded-2xl font-black hover:bg-green-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-100 active:scale-95">
                <Phone size={20} /> اتصـال
              </button>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="bg-blue-50 text-blue-700 py-4 rounded-2xl font-black hover:bg-blue-100 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <MessageSquare size={20} /> شـات
              </button>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-4 text-slate-600">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400">وجهتك</p>
                  <p className="font-black text-sm truncate">{requestData.destination}</p>
                </div>
              </div>

              {requestData.serviceType === 'delivery' && (
                <div className="flex items-center gap-4 text-slate-600">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                    <Loader2 size={20} className="text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400">المنتج</p>
                    <p className="font-black text-sm truncate">{requestData.productType} ({requestData.weight})</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-red-50 text-red-600 py-4 rounded-2xl font-black hover:bg-red-100 transition-all flex items-center justify-center gap-3 active:scale-95">
                <AlertTriangle size={20} /> طوارئ (SOS)
              </button>
              <button className="bg-slate-50 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-3 active:scale-95">
                <Share2 size={20} /> مشاركة
              </button>
            </div>

            <button 
              onClick={() => navigate('/kafrawy-go/rate', { state: { driver, requestData } })}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
            >
              <CheckCircle size={24} /> إنهاء الرحلة
            </button>
          </div>
        </div>
      </div>
    </KafrawyLayout>
  );
}
