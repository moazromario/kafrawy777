import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, DollarSign, Star, MapPin, ToggleLeft, ToggleRight, Clock, Shield, TrendingUp, Wallet, Bell, ChevronLeft, Package, Zap } from 'lucide-react';
import KafrawyLayout from '../../components/KafrawyLayout';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase'; // Import supabase client

import socket from '../../services/socket';

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [requestType, setRequestType] = useState<'ride' | 'delivery' | 'tuktuk'>('ride');
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let locationInterval: any;
    let rideSubscription: any;

    if (isOnline) {
      // Get initial location
      navigator.geolocation.getCurrentPosition((pos) => {
        const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        
        // Notify server that driver is online
        socket.emit('driver_online', {
          name: 'كابتن محمد',
          rating: 4.8,
          car: 'هيونداي فيرنا - فضي',
          location
        });
      }, () => {
        // Fallback location
        const location = { lat: 31.4175, lng: 31.0369 };
        socket.emit('driver_online', {
          name: 'كابتن محمد',
          rating: 4.8,
          car: 'هيونداي فيرنا - فضي',
          location
        });
      });

      // Periodically sync location
      locationInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
          socket.emit('driver_location_sync', { 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude 
          });
        });
      }, 10000);

      // Listen for new ride requests via Socket.io
      socket.on('new_ride_request', (ride) => {
        console.log('Received new ride request via Socket:', ride);
        setCurrentRequest(ride);
        setRequestType(ride.serviceType);
        setShowRequest(true);
      });

      // Listen for new ride requests via Supabase Realtime
      rideSubscription = supabase
        .channel('rides_channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rides', filter: 'status=eq.searching' }, (payload) => {
          console.log('Received new ride request via Supabase:', payload.new);
          // Map DB columns back to the frontend expected format
          const ride = {
            id: payload.new.id,
            serviceType: payload.new.service_type,
            pickup: payload.new.pickup_address,
            destination: payload.new.destination_address,
            suggestedPrice: payload.new.suggested_price
          };
          setCurrentRequest(ride);
          setRequestType(ride.serviceType as any);
          setShowRequest(true);
        })
        .subscribe();

      // Listen for active rides list (for drivers who just joined)
      socket.on('active_rides_list', (rides) => {
        if (rides.length > 0) {
          setCurrentRequest(rides[0]);
          setRequestType(rides[0].serviceType);
          setShowRequest(true);
        }
      });
    } else {
      socket.emit('driver_offline');
      socket.off('new_ride_request');
      socket.off('active_rides_list');
      clearInterval(locationInterval);
      if (rideSubscription) supabase.removeChannel(rideSubscription);
      setShowRequest(false);
    }

    return () => {
      socket.off('new_ride_request');
      socket.off('active_rides_list');
      clearInterval(locationInterval);
      if (rideSubscription) supabase.removeChannel(rideSubscription);
    };
  }, [isOnline]);

  const handleRequestClick = () => {
    navigate('/kafrawy-go/ride-request', { 
      state: { 
        serviceType: requestType,
        ride: currentRequest 
      } 
    });
  };

  const stats = [
    { label: 'أرباح اليوم', value: '٤٥٠', unit: 'ج.م', icon: <DollarSign className="text-emerald-600" />, color: 'bg-emerald-50' },
    { label: 'التقييم', value: '٤.٨', unit: '/ ٥', icon: <Star className="text-yellow-500" />, color: 'bg-yellow-50' },
    { label: 'رحلات اليوم', value: '١٢', unit: 'رحلة', icon: <Car className="text-blue-600" />, color: 'bg-blue-50' },
    { label: 'ساعات العمل', value: '٦.٥', unit: 'ساعة', icon: <Clock className="text-purple-600" />, color: 'bg-purple-50' },
  ];

  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src="https://i.pravatar.cc/150?u=driver1" 
                  alt="Driver" 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-slate-400'}`}></div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">أهلاً كابتن محمد!</h1>
                <p className="text-slate-500 font-bold text-sm">هيونداي فيرنا (أ ب ج ١٢٣٤)</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black transition-all shadow-lg ${
                isOnline 
                  ? 'bg-green-600 text-white shadow-green-100' 
                  : 'bg-white text-slate-600 border border-slate-100'
              }`}
            >
              {isOnline ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              {isOnline ? 'متصل الآن' : 'غير متصل'}
            </button>
          </div>

          {/* New Request Notification */}
          <AnimatePresence>
            {showRequest && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                onClick={handleRequestClick}
                className={`${requestType === 'delivery' ? 'bg-orange-600 shadow-orange-100' : requestType === 'tuktuk' ? 'bg-yellow-500 shadow-yellow-100' : 'bg-blue-600 shadow-blue-100'} text-white p-6 rounded-[2rem] mb-8 shadow-xl flex items-center justify-between cursor-pointer group relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${requestType === 'delivery' ? 'from-orange-500' : requestType === 'tuktuk' ? 'from-yellow-400' : 'from-blue-500'} to-transparent opacity-50`}></div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                    {requestType === 'delivery' ? <Package className="text-white" size={28} /> : requestType === 'tuktuk' ? <Zap className="text-white" size={28} /> : <Bell className="text-white" size={28} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black">
                      {requestType === 'delivery' ? 'طلب دليفري جديد!' : requestType === 'tuktuk' ? 'طلب توكتوك جديد!' : 'طلب رحلة جديد!'}
                    </h3>
                    <p className={`${requestType === 'delivery' ? 'text-orange-100' : requestType === 'tuktuk' ? 'text-yellow-50' : 'text-blue-100'} font-bold`}>
                      {requestType === 'delivery' ? 'توصيل: وجبة غداء' : 'وسط البلد ← محطة القطار'}
                    </p>
                  </div>
                </div>
                <div className={`relative z-10 bg-white ${requestType === 'delivery' ? 'text-orange-600' : requestType === 'tuktuk' ? 'text-yellow-600' : 'text-blue-600'} px-6 py-3 rounded-xl font-black group-hover:scale-105 transition-transform`}>
                  عرض الطلب
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
                <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-xs text-slate-400 font-black mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">
                  {stat.value} <span className="text-xs font-bold text-slate-400">{stat.unit}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Main Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <button 
              onClick={() => navigate('/kafrawy-go/driver/earnings')}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet size={28} />
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-black text-slate-900">المحفظة والأرباح</h3>
                  <p className="text-sm text-slate-500 font-bold">إجمالي الرصيد: ١,٢٥٠ ج.م</p>
                </div>
              </div>
              <ChevronLeft className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </button>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-[2.5rem] text-white shadow-lg shadow-blue-100 relative overflow-hidden">
              <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
              <h3 className="text-lg font-black mb-1">حقق أرباحاً أكثر!</h3>
              <p className="text-blue-100 text-sm font-bold mb-4">أكمل ٥ رحلات اليوم واحصل على بونص ٥٠ ج.م</p>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full w-3/5"></div>
              </div>
              <p className="text-right text-xs font-bold mt-2">٣ / ٥ رحلات</p>
            </div>
          </div>

          {/* Recent Trips */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-slate-900">آخر الرحلات</h3>
              <button className="text-blue-600 font-black text-sm hover:underline">عرض الكل</button>
            </div>
            
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-slate-900">من: وسط البلد</p>
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-lg font-bold">مكتملة</span>
                    </div>
                    <p className="text-sm text-slate-500 font-bold">إلى: محطة القطار</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-900">٨٠ ج.م</p>
                  <p className="text-xs text-slate-400 font-bold">منذ ٣ ساعات</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </KafrawyLayout>
  );
}
