import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Phone, MessageCircle, MapPin, Navigation, Package, CheckCircle2, Truck, Star, ShieldCheck } from 'lucide-react';
import MainLayout from './MainLayout';
import { supabase } from '../lib/supabase';

export default function OrderTracking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setOrder(data);
      setLoading(false);
    };

    fetchOrder();

    const channel = supabase
      .channel('order-tracking')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${id}`
      }, (payload) => {
        setOrder(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) return <MainLayout><div>جاري تحميل بيانات الطلب...</div></MainLayout>;
  if (!order) return <MainLayout><div>الطلب غير موجود.</div></MainLayout>;

  const statusSteps = ['confirmed', 'processing', 'shipped', 'delivered'];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen md:rounded-lg md:shadow-sm md:mt-4 relative overflow-hidden" dir="rtl">
        {/* Header (Floating over map) */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors -mr-2 bg-white shadow-sm">
            <ChevronRight className="w-6 h-6 text-slate-900" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 drop-shadow-sm">تتبع الطلب #{id}</h1>
        </div>

        {/* Map Placeholder */}
        <div className="absolute inset-0 z-0 bg-blue-50">
          {/* Simulated Map Background */}
          <div className="w-full h-full opacity-30" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          {/* Route Line (Simulated) */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            <path d="M 100 200 Q 200 150 300 300 T 500 400" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray="8 8" className="animate-pulse" />
          </svg>

          {/* Delivery Location Marker */}
          <div className="absolute top-[40%] left-[30%] z-10 flex flex-col items-center animate-bounce">
            <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-600/40">
              <Truck className="w-6 h-6" />
            </div>
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 shadow-md"></div>
          </div>

          {/* Destination Marker */}
          <div className="absolute top-[20%] right-[20%] z-10 flex flex-col items-center">
            <div className="bg-red-500 text-white p-2 rounded-full shadow-lg shadow-red-500/40">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="w-2 h-2 bg-red-500 rounded-full mt-1 shadow-md"></div>
          </div>
        </div>

        {/* Bottom Sheet (Tracking Details) */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-safe">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-4"></div>
          
          <div className="px-6 pb-6">
            {/* ETA */}
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">حالة الطلب</p>
                <p className="text-2xl font-black text-blue-600">{order.status}</p>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 right-4 h-1 bg-blue-600 -translate-y-1/2 z-0" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}></div>
                
                {statusSteps.map((step, index) => (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                      {index === 0 && <CheckCircle2 className="w-4 h-4" />}
                      {index === 1 && <Package className="w-4 h-4" />}
                      {index === 2 && <Truck className="w-4 h-4" />}
                      {index === 3 && <MapPin className="w-4 h-4" />}
                    </div>
                    <span className={`text-[10px] font-bold ${index <= currentStep ? 'text-blue-600' : 'text-slate-400'}`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Driver Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src="https://picsum.photos/seed/driver/100/100" alt="Driver" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{order.driver_name || 'جاري تعيين سائق'}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">دراجة نارية</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-blue-200">
                <MessageCircle className="w-5 h-5" />
                مراسلة
              </button>
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-green-600/20">
                <Phone className="w-5 h-5" />
                اتصال بالسائق
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
