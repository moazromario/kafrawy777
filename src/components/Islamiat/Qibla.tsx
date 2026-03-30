import React, { useState, useEffect } from 'react';
import { 
  Compass, MapPin, RefreshCw, Loader2, 
  ChevronLeft, Info, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Qibla() {
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserLocation();
    
    // Listen for device orientation
    if (window.DeviceOrientationEvent) {
      // Request permission for iOS 13+
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    } else {
      setError('جهازك لا يدعم البوصلة');
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const angle = calculateQiblaAngle(latitude, longitude);
          setQiblaDirection(angle);
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Default to Cairo
          setQiblaDirection(135);
          setLoading(false);
        }
      );
    } else {
      setQiblaDirection(135);
      setLoading(false);
    }
  };

  const calculateQiblaAngle = (lat: number, lng: number) => {
    const kaabaLat = 21.4225 * (Math.PI / 180);
    const kaabaLng = 39.8262 * (Math.PI / 180);
    const myLat = lat * (Math.PI / 180);
    const myLng = lng * (Math.PI / 180);

    const deltaLng = kaabaLng - myLng;

    const y = Math.sin(deltaLng);
    const x = Math.cos(myLat) * Math.tan(kaabaLat) - Math.sin(myLat) * Math.cos(deltaLng);
    
    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    return (qibla + 360) % 360;
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    // alpha is the rotation around the z-axis (0 to 360)
    if (event.alpha !== null) {
      setHeading(event.alpha);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold">جاري تحديد اتجاه القبلة...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 flex flex-col items-center">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-emerald-700">اتجاه القبلة</h2>
        <p className="text-slate-500 font-medium">ضع هاتفك بشكل مسطح للحصول على أفضل نتيجة</p>
      </div>

      {/* Compass UI */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 bg-white rounded-full shadow-2xl shadow-emerald-100 border-8 border-emerald-50"></div>
        
        {/* Compass Dial */}
        <motion.div 
          className="relative w-full h-full flex items-center justify-center"
          animate={{ rotate: -heading }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        >
          {/* Cardinal Points */}
          <div className="absolute top-6 font-black text-slate-400 text-lg">N</div>
          <div className="absolute bottom-6 font-black text-slate-400 text-lg">S</div>
          <div className="absolute left-6 font-black text-slate-400 text-lg">W</div>
          <div className="absolute right-6 font-black text-slate-400 text-lg">E</div>
          
          {/* Qibla Marker */}
          <motion.div 
            className="absolute w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200 z-20"
            style={{ 
              top: '50%', 
              left: '50%', 
              marginTop: '-24px', 
              marginLeft: '-24px',
              transform: `rotate(${qiblaDirection}deg) translateY(-120px)` 
            }}
          >
            <Navigation className="w-6 h-6" />
          </motion.div>

          {/* Compass Needle */}
          <div className="w-1 h-full bg-slate-100 absolute left-1/2 -ml-0.5 rounded-full"></div>
          <div className="h-1 w-full bg-slate-100 absolute top-1/2 -mt-0.5 rounded-full"></div>
        </motion.div>

        {/* Center Point */}
        <div className="absolute w-4 h-4 bg-emerald-600 rounded-full border-4 border-white shadow-md z-30"></div>
      </div>

      {/* Status Card */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 w-full max-w-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <Navigation className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">الزاوية الحالية</p>
            <p className="text-2xl font-black text-slate-900">{Math.round(heading)}°</p>
          </div>
        </div>
        <div className="h-12 w-px bg-slate-100"></div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <MapPin className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">اتجاه القبلة</p>
            <p className="text-2xl font-black text-slate-900">{qiblaDirection}°</p>
          </div>
        </div>
      </div>

      {/* Error / Info */}
      {error && (
        <div className="bg-red-50 p-6 rounded-[2.5rem] border border-red-100 flex items-start gap-4 w-full max-w-md">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm flex-shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-red-900 font-black mb-1">تنبيه البوصلة</h4>
            <p className="text-red-700 text-sm font-medium leading-relaxed">
              {error}. يرجى استخدام متصفح يدعم الوصول إلى حساسات الهاتف.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
