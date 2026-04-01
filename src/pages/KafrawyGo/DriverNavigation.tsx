import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Navigation, ChevronRight, AlertCircle, User, Package, Zap } from 'lucide-react';
import KafrawyLayout from '../../components/KafrawyLayout';
import { motion } from 'motion/react';

import socket from '../../services/socket';
import ChatModal from '../../components/ChatModal';
import MapComponent from '../../components/MapComponent';

export default function DriverNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const serviceType = location.state?.serviceType || 'ride';
  const ride = location.state?.ride;
  
  const [distance, setDistance] = useState(1.2);
  const [eta, setEta] = useState(4);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number }>({ lat: 31.4175, lng: 31.0369 });
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [pointIndex, setPointIndex] = useState(0);

  // Fetch route to customer
  useEffect(() => {
    if (ride?.pickupCoords) {
      const fetchRoute = async () => {
        try {
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${currentLocation.lng},${currentLocation.lat};${ride.pickupCoords.lng},${ride.pickupCoords.lat}?overview=full&geometries=geojson`
          );
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const coordinates = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
            setRoutePoints(coordinates);
            setDistance(data.routes[0].distance / 1000);
            setEta(Math.ceil(data.routes[0].duration / 60));
          }
        } catch (error) {
          console.error("Error fetching route:", error);
        }
      };
      fetchRoute();
    }
  }, [ride]);

  // Simulate moving towards customer along the route
  useEffect(() => {
    if (routePoints.length === 0) return;

    const interval = setInterval(() => {
      setPointIndex(prev => {
        const nextIndex = Math.min(prev + 1, routePoints.length - 1);
        const nextPoint = routePoints[nextIndex];
        
        const newLocation = { lat: nextPoint[0], lng: nextPoint[1] };
        setCurrentLocation(newLocation);

        // Calculate remaining distance and eta (simplified)
        const remainingPoints = routePoints.length - nextIndex;
        const nextDist = (remainingPoints / routePoints.length) * distance;
        const nextEta = (remainingPoints / routePoints.length) * eta;

        if (ride) {
          socket.emit('driver_location_update', { 
            rideId: ride.id, 
            lat: newLocation.lat,
            lng: newLocation.lng,
            distance: nextDist.toFixed(1), 
            eta: Math.ceil(nextEta) 
          });
        }

        if (nextIndex === routePoints.length - 1) {
          clearInterval(interval);
        }

        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [routePoints, ride, distance, eta]);

  const handleArrival = () => {
    navigate('/kafrawy-go/driver/active', { state: { serviceType, ride } });
  };

  return (
    <KafrawyLayout>
      <ChatModal 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        rideId={ride?.id || `ride_${Date.now()}`}
        senderId={socket.id || 'driver'}
        recipientName="أحمد محمد"
      />
      <div className="pb-24 min-h-screen bg-slate-50 w-full" dir="rtl">
        {/* Real OpenStreetMap */}
        <div className="h-[50vh] bg-slate-200 relative overflow-hidden">
          <MapComponent 
            origin={currentLocation}
            destination={ride?.pickupCoords || { lat: 31.4175, lng: 31.0369 }}
            driverLocation={currentLocation}
            showDirections={true}
          />

          <button 
            onClick={() => {
              setCurrentLocation({ ...currentLocation });
            }}
            className="absolute bottom-6 right-6 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all active:scale-95 z-[1000]"
          >
            <Navigation size={20} />
          </button>

          {/* Floating Navigation Card */}
          <div className="absolute top-6 left-4 right-4 bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between z-[1000]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Navigation size={28} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-black">
                  {serviceType === 'delivery' ? 'اتجه لاستلام الطلب' : serviceType === 'tuktuk' ? 'اتجه نحو العميل (توكتوك)' : 'اتجه نحو العميل'}
                </h3>
                <p className="text-blue-200 font-bold">شارع الجمهورية - وسط البلد</p>
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
            {serviceType === 'delivery' && (
              <div className="mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-4">
                <Package className="text-orange-600" size={24} />
                <div>
                  <p className="text-xs text-orange-400 font-black">المنتج المطلوب</p>
                  <p className="font-black text-orange-900">وجبة غداء (٢ كجم)</p>
                </div>
              </div>
            )}
            {serviceType === 'tuktuk' && (
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
                  <p className="text-slate-500 font-bold">
                    {serviceType === 'delivery' ? 'صاحب الطلب في انتظارك' : 'العميل في انتظارك'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                  <Phone size={24} />
                </button>
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  <MessageCircle size={24} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleArrival}
                className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
              >
                {serviceType === 'delivery' ? 'لقد استلمت الطلب' : 'لقد وصلت للعميل'}
              </button>
              <button 
                onClick={() => navigate('/kafrawy-go/driver-dashboard')}
                className="w-full bg-white text-red-600 py-4 rounded-[2rem] font-black text-lg border border-red-50 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <AlertCircle size={20} />
                إلغاء الرحلة
              </button>
            </div>
          </div>
        </div>
      </div>
    </KafrawyLayout>
  );
}
