import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Bike, Package, MapPin, Clock, UserPlus } from 'lucide-react';

export default function KafrawyGoHome() {
  const navigate = useNavigate();

  const services = [
    { name: 'سيارة', icon: <Car className="w-8 h-8" />, path: '/kafrawy-go/request' },
    { name: 'موتوسيكل', icon: <Bike className="w-8 h-8" />, path: '/kafrawy-go/request' },
    { name: 'توكتوك', icon: <Car className="w-8 h-8" />, path: '/kafrawy-go/request' }, // Added TukTuk
    { name: 'رحلات', icon: <MapPin className="w-8 h-8" />, path: '/kafrawy-go/request' },
    { name: 'ديليفري', icon: <Package className="w-8 h-8" />, path: '/kafrawy-go/request' },
  ];

  return (
    <div className="p-4 space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-slate-900">كفراوي جو</h1>
      
      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => (
          <button 
            key={service.name}
            onClick={() => navigate(service.path)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center gap-3 hover:border-blue-500 transition"
          >
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              {service.icon}
            </div>
            <span className="font-semibold text-slate-700">{service.name}</span>
          </button>
        ))}
      </div>

      <button 
        onClick={() => navigate('/kafrawy-go/register')}
        className="w-full bg-slate-800 text-white py-4 rounded-xl font-semibold hover:bg-slate-900 transition flex items-center justify-center gap-2"
      >
        <UserPlus size={20} />
        سجل ككابتن
      </button>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-700">رحلاتك السابقة</h3>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="text-slate-400" />
            <div>
              <p className="font-medium">من: وسط البلد</p>
              <p className="text-sm text-slate-500">إلى: محطة القطار</p>
            </div>
          </div>
          <span className="text-sm text-slate-400">منذ يومين</span>
        </div>
      </div>
    </div>
  );
}
