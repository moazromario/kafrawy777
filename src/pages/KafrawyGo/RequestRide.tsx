import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, ArrowRight, Plus, Minus, Home, Briefcase, Navigation, Clock, DollarSign, ChevronRight } from 'lucide-react';
import KafrawyLayout from '../../components/KafrawyLayout';
import { motion, AnimatePresence } from 'motion/react';
import socket from '../../services/socket';
import MapComponent from '../../components/MapComponent';
import { reverseGeocode, searchAddress } from '../../lib/geocoding';

export default function RequestRide() {
  const navigate = useNavigate();
  const location = useLocation();
  const serviceType = location.state?.serviceType || 'ride';
  
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [productType, setProductType] = useState('');
  const [weight, setWeight] = useState('');
  const [fare, setFare] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectingFor, setSelectingFor] = useState<'pickup' | 'destination'>('pickup');
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const query = selectingFor === 'pickup' ? pickup : destination;
      if (query.length > 3) {
        setIsSearching(true);
        const results = await searchAddress(query);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [pickup, destination, selectingFor]);

  useEffect(() => {
    socket.on('drivers_update', (drivers) => {
      setNearbyDrivers(drivers);
    });

    return () => {
      socket.off('drivers_update');
    };
  }, []);

  const suggestions = [
    { id: 'home', name: 'المنزل', address: 'شارع النيل، كفر البطيخ', coords: { lat: 31.4175, lng: 31.8144 }, icon: <Home size={18} /> },
    { id: 'work', name: 'العمل', address: 'منطقة الورش، دمياط الجديدة', coords: { lat: 31.4275, lng: 31.8244 }, icon: <Briefcase size={18} /> },
  ];

  const handleLocationSelect = async (lat: number, lng: number) => {
    const coords = { lat, lng };
    const address = await reverseGeocode(lat, lng);
    const displayAddress = address || `موقع محدد (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

    if (selectingFor === 'pickup') {
      setPickupCoords(coords);
      setPickup(displayAddress);
      setSelectingFor('destination');
    } else {
      setDestinationCoords(coords);
      setDestination(displayAddress);
    }
  };

  const handleRequest = () => {
    const requestData = {
      pickup,
      destination,
      pickupCoords,
      destinationCoords,
      productType,
      weight,
      suggestedPrice: fare,
      serviceType,
      distance,
      duration
    };

    // Emit the ride request to the server
    socket.emit('request_ride', requestData);

    navigate('/kafrawy-go/matching', { 
      state: { 
        ...requestData,
        fare // keep for backward compatibility if needed
      } 
    });
  };

  const calculateRoute = async () => {
    if (pickupCoords && destinationCoords) {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lng},${pickupCoords.lat};${destinationCoords.lng},${destinationCoords.lat}?overview=false`
        );
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distKm = parseFloat((route.distance / 1000).toFixed(1));
          const durationMin = Math.ceil(route.duration / 60);
          
          const baseRate = serviceType === 'shipping' ? 15 : serviceType === 'tuktuk' ? 4 : 7;
          
          setDistance(distKm);
          setDuration(durationMin);
          setFare(Math.ceil(distKm * baseRate + 10)); // Added base fee
        }
      } catch (error) {
        console.error("Error calculating route with OSRM:", error);
        // Fallback
        const dist = Math.floor(Math.random() * 15) + 2;
        const time = dist * 2;
        const baseRate = serviceType === 'shipping' ? 15 : serviceType === 'tuktuk' ? 4 : 7;
        setDistance(dist);
        setDuration(time);
        setFare(dist * baseRate);
      }
    }
  };

  useEffect(() => {
    if (pickupCoords && destinationCoords) {
      calculateRoute();
    }
  }, [pickupCoords, destinationCoords]);

  const adjustFare = (amount: number) => {
    if (fare !== null) {
      setFare(Math.max(10, fare + amount));
    }
  };

  const useCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        const address = await reverseGeocode(coords.lat, coords.lng);
        setPickupCoords(coords);
        setPickup(address || 'موقعي الحالي');
        setIsLocating(false);
        setSelectingFor('destination');
      }, () => {
        // Fallback
        setPickup('موقعي الحالي (وسط البلد)');
        setPickupCoords({ lat: 31.4175, lng: 31.8144 });
        setIsLocating(false);
        setSelectingFor('destination');
      });
    } else {
      setPickup('موقعي الحالي (وسط البلد)');
      setPickupCoords({ lat: 31.4175, lng: 31.8144 });
      setIsLocating(false);
      setSelectingFor('destination');
    }
  };

  const getServiceTitle = () => {
    switch(serviceType) {
      case 'delivery': return 'طلب دليفري';
      case 'shipping': return 'طلب شحن';
      case 'tuktuk': return 'طلب توكتوك';
      default: return 'طلب رحلة';
    }
  };

  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full" dir="rtl">
        <div className="max-w-3xl mx-auto px-4 pt-8">
          {/* Header */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 mb-8 flex items-center gap-4">
            <button onClick={() => navigate('/kafrawy-go')} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>
            <h1 className="text-2xl font-black text-slate-900">{getServiceTitle()}</h1>
          </div>
          
          {/* Real OpenStreetMap */}
          <div className="w-full h-80 bg-slate-200 rounded-[2.5rem] mb-8 flex items-center justify-center border-4 border-white shadow-xl relative overflow-hidden group">
            <MapComponent 
              onLocationSelect={handleLocationSelect}
              origin={pickupCoords}
              destination={destinationCoords}
              nearbyDrivers={nearbyDrivers}
              showDirections={!!(pickupCoords && destinationCoords)}
            />
            
            <div className="absolute top-6 left-6 right-6 pointer-events-none z-[1000]">
              <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl text-sm font-black shadow-lg border border-white inline-block">
                {isLocating ? 'جاري تحديد موقعك...' : 
                 selectingFor === 'pickup' ? 'حدد موقع الالتقاط على الخريطة' : 'حدد وجهتك على الخريطة'}
              </div>
            </div>
            
            <button 
              onClick={useCurrentLocation}
              className="absolute bottom-6 right-6 w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all active:scale-95 z-[1000]"
            >
              <Navigation size={24} className={isLocating ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
            <div className="space-y-4">
              {serviceType === 'delivery' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-4 mb-4"
                >
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="نوع المنتج" 
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="الوزن (تقريباً)" 
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </motion.div>
              )}

              <div className="relative">
                <button 
                  onClick={() => setSelectingFor('pickup')}
                  className={`absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectingFor === 'pickup' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${selectingFor === 'pickup' ? 'bg-white' : 'bg-blue-600'}`}></div>
                </button>
                <input 
                  type="text" 
                  placeholder="من أين؟ (موقع الالتقاط)" 
                  value={pickup}
                  onFocus={() => setSelectingFor('pickup')}
                  onChange={(e) => setPickup(e.target.value)}
                  className={`w-full pr-16 pl-6 py-5 bg-slate-50 border rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner ${selectingFor === 'pickup' ? 'border-blue-200 ring-2 ring-blue-100' : 'border-slate-100'}`}
                />
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <div className="w-10 h-10 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-300 shadow-sm">
                  <div className="w-0.5 h-4 bg-slate-200"></div>
                </div>
              </div>

              <div className="relative">
                <button 
                  onClick={() => setSelectingFor('destination')}
                  className={`absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectingFor === 'destination' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-600'}`}
                >
                  <MapPin size={18} />
                </button>
                <input 
                  type="text" 
                  placeholder="إلى أين؟ (الوجهة)" 
                  value={destination}
                  onFocus={() => setSelectingFor('destination')}
                  onChange={(e) => setDestination(e.target.value)}
                  className={`w-full pr-16 pl-6 py-5 bg-slate-50 border rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner ${selectingFor === 'destination' ? 'border-orange-200 ring-2 ring-orange-100' : 'border-slate-100'}`}
                />
              </div>
            </div>

            {/* Suggestions */}
            <div className="relative">
              <AnimatePresence>
                {isSearching && (
                  <motion.div 
                    key="searching-indicator"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 right-0 bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2 z-[2000]"
                  >
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-slate-600">جاري البحث...</span>
                  </motion.div>
                )}
                {searchResults.length > 0 && (
                  <motion.div 
                    key="search-results-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[2000]"
                  >
                    {searchResults.map((result) => (
                      <button
                        key={result.id || `${result.lat}-${result.lng}`}
                        onClick={() => {
                          if (selectingFor === 'pickup') {
                            setPickup(result.name);
                            setPickupCoords({ lat: result.lat, lng: result.lng });
                            setSelectingFor('destination');
                          } else {
                            setDestination(result.name);
                            setDestinationCoords({ lat: result.lat, lng: result.lng });
                          }
                          setSearchResults([]);
                        }}
                        className="w-full p-4 text-right hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center gap-3"
                      >
                        <MapPin size={16} className="text-slate-400 shrink-0" />
                        <span className="text-sm font-bold text-slate-700 truncate">{result.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-wrap gap-3">
                {suggestions.map((s) => (
                  <button 
                    key={s.id}
                    onClick={() => {
                      setDestination(s.address);
                      setDestinationCoords(s.coords);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all"
                  >
                    {s.icon}
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            
            <AnimatePresence>
              {fare !== null && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 pt-4 border-t border-slate-50"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                        <Navigation size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold">المسافة</p>
                        <p className="font-black text-slate-900">{distance} كم</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold">الوقت المتوقع</p>
                        <p className="font-black text-slate-900">{duration} دقيقة</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-100">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign size={20} className="opacity-80" />
                        <span className="font-black text-lg">السعر المقترح:</span>
                      </div>
                      <span className="text-3xl font-black">{fare} ج.م</span>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white/10 p-2 rounded-2xl backdrop-blur-sm">
                      <button 
                        onClick={() => adjustFare(-5)} 
                        className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all active:scale-90"
                      >
                        <Minus size={24} />
                      </button>
                      <div className="flex-1 text-center font-black text-sm">
                        يمكنك تعديل السعر ليناسبك
                      </div>
                      <button 
                        onClick={() => adjustFare(5)} 
                        className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all active:scale-90"
                      >
                        <Plus size={24} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleRequest}
              disabled={fare === null}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl disabled:bg-slate-200 disabled:shadow-none active:scale-95"
            >
              البحث عن كابتن <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </KafrawyLayout>
  );
}
