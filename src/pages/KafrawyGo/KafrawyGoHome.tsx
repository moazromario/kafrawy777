import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Package, Truck, MapPin, UserPlus, Star, Clock, Zap } from 'lucide-react';
import KafrawyLayout from '../../components/KafrawyLayout';
import { motion } from 'motion/react';

export default function KafrawyGoHome() {
  const navigate = useNavigate();

  const mainServices = [
    { 
      id: 'ride',
      name: 'رحلة', 
      description: 'توصيلة سريعة وآمنة',
      icon: <Car className="w-12 h-12" />, 
      path: '/kafrawy-go/request',
      color: 'bg-blue-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      id: 'tuktuk',
      name: 'توكتوك', 
      description: 'أسرع وسيلة في الزحمة',
      icon: <Zap className="w-12 h-12" />, 
      path: '/kafrawy-go/request',
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    { 
      id: 'delivery',
      name: 'دليفري', 
      description: 'طلباتك لحد باب البيت',
      icon: <Package className="w-12 h-12" />, 
      path: '/kafrawy-go/request',
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    { 
      id: 'shipping',
      name: 'شحن', 
      description: 'نقل بضائع وأوزان ثقيلة',
      icon: <Truck className="w-12 h-12" />, 
      path: '/kafrawy-go/request',
      color: 'bg-emerald-600',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
  ];

  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900">كفراوي جو</h1>
              <p className="text-slate-500 font-bold mt-1">أسرع وسيلة مواصلات في كفر البطيخ</p>
            </div>
            <button 
              onClick={() => navigate('/kafrawy-go/register')}
              className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
            >
              <UserPlus size={18} className="text-blue-600" />
              سجل ككابتن
            </button>
          </div>

          {/* Main Services - Stage 1 */}
          <div className="grid grid-cols-1 gap-4 mb-10">
            {mainServices.map((service, index) => (
              <motion.button 
                key={service.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(service.path, { state: { serviceType: service.id } })}
                className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md hover:border-blue-200 transition-all group text-right"
              >
                <div className={`${service.lightColor} ${service.textColor} w-24 h-24 rounded-3xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  {service.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-slate-900 mb-1">{service.name}</h3>
                  <p className="text-slate-500 font-bold">{service.description}</p>
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <span className="text-2xl font-black">←</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-slate-900">نشاطك الأخير</h3>
              <button className="text-blue-600 font-black text-sm hover:underline">عرض الكل</button>
            </div>
            
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Clock size={24} />
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
                <p className="font-black text-slate-900">45 ج.م</p>
                <p className="text-xs text-slate-400 font-bold">منذ يومين</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-[2rem] text-white shadow-lg shadow-blue-100">
              <Star className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-black">4.9</p>
              <p className="text-sm font-bold opacity-80">تقييمك العام</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <Car className="w-8 h-8 mb-3 text-blue-600" />
              <p className="text-3xl font-black text-slate-900">12</p>
              <p className="text-sm font-bold text-slate-500">رحلة هذا الشهر</p>
            </div>
          </div>
        </div>
      </div>
    </KafrawyLayout>
  );
}
