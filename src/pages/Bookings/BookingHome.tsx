import React, { useEffect, useState } from 'react';
import { fetchBookingItems } from '../../services/api';
import { motion } from 'motion/react';
import { Calendar, MapPin, CreditCard, Ticket, Home, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BookingHome() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookingItems().then(setItems).finally(() => setLoading(false));
  }, []);

  const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter);

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">نظام الحجز والخدمات</h1>
        <div className="flex gap-2">
          <Link to="/wallet" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            المحفظة
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full whitespace-nowrap ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>الكل</button>
        <button onClick={() => setFilter('service')} className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-2 ${filter === 'service' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
          <Briefcase className="w-4 h-4" /> خدمات
        </button>
        <button onClick={() => setFilter('room')} className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-2 ${filter === 'room' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
          <Home className="w-4 h-4" /> إقامات
        </button>
        <button onClick={() => setFilter('event')} className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-2 ${filter === 'event' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
          <Ticket className="w-4 h-4" /> فعاليات
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-48 bg-slate-200 relative">
              <img 
                src={item.image_url || `https://picsum.photos/seed/${item.id}/400/300`} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-lg text-xs font-bold text-blue-600 uppercase">
                {item.type === 'service' ? 'خدمة' : item.type === 'room' ? 'إقامة' : 'فعالية'}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                <MapPin className="w-4 h-4" />
                <span>{item.location}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-blue-600 font-bold text-lg">
                  {item.price} ج.م
                </div>
                <Link 
                  to={`/bookings/${item.id}`}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  حجز الآن
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
