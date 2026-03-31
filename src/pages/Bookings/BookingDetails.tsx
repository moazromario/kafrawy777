import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBookingItems, createBooking, fetchWalletBalance } from '../../services/api';
import { motion } from 'motion/react';
import { Calendar, MapPin, CreditCard, Ticket, Home, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '../../context/AuthContext';

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const items = await fetchBookingItems();
        const found = items.find((i: any) => i.id === id);
        setItem(found);
        
        const wallet = await fetchWalletBalance(user.id);
        setWalletBalance(wallet.balance);
      } catch (err) {
        toast.error('فشل تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, user]);

  const handleBooking = async () => {
    if (!user) return toast.error('يرجى تسجيل الدخول');
    if (!startDate) return toast.error('يرجى اختيار التاريخ');
    if (item.type === 'room' && !endDate) return toast.error('يرجى اختيار تاريخ المغادرة');

    setBookingLoading(true);
    try {
      const booking = await createBooking({
        userId: user.id,
        itemId: id,
        startDate,
        endDate: endDate || null,
        totalPrice: item.price,
        paymentMethod
      });
      
      toast.success('تم الحجز بنجاح!');
      navigate('/profile'); // Go to profile to see booking history
    } catch (err: any) {
      toast.error(err.message || 'فشل الحجز');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;
  if (!item) return <div className="p-8 text-center">العنصر غير موجود</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Info */}
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <img 
              src={item.image_url || `https://picsum.photos/seed/${item.id}/600/400`} 
              alt={item.title} 
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center gap-2 text-blue-600 text-sm font-bold uppercase mb-2">
                {item.type === 'service' ? <Briefcase className="w-4 h-4" /> : item.type === 'room' ? <Home className="w-4 h-4" /> : <Ticket className="w-4 h-4" />}
                {item.type === 'service' ? 'خدمة' : item.type === 'room' ? 'إقامة' : 'فعالية'}
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{item.title}</h1>
              <p className="text-slate-600 mb-6 leading-relaxed">{item.description}</p>
              
              <div className="flex items-center gap-3 text-slate-500 mb-4">
                <MapPin className="w-5 h-5" />
                <span>{item.location}</span>
              </div>
              
              <div className="text-2xl font-bold text-blue-600">
                {item.price} ج.م
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Booking Form */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              تفاصيل الحجز
            </h2>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {item.type === 'room' ? 'تاريخ الوصول' : 'تاريخ الموعد'}
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              {item.type === 'room' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">تاريخ المغادرة</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              طريقة الدفع
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <button 
                onClick={() => setPaymentMethod('wallet')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'wallet' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-sm font-bold">المحفظة</span>
                <span className="text-[10px] opacity-70">رصيدك: {walletBalance} ج.م</span>
              </button>
              
              <button 
                onClick={() => setPaymentMethod('vodafone_cash')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'vodafone_cash' ? 'border-red-600 bg-red-50 text-red-600' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
              >
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">V</div>
                <span className="text-sm font-bold">فودافون كاش</span>
                <span className="text-[10px] opacity-70">دفع مباشر</span>
              </button>
            </div>

            <button 
              onClick={handleBooking}
              disabled={bookingLoading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {bookingLoading ? 'جاري الحجز...' : 'تأكيد الحجز والدفع'}
            </button>
            
            <p className="text-center text-slate-400 text-xs mt-4">
              بالضغط على تأكيد، أنت توافق على شروط الخدمة وسياسة الإلغاء
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
