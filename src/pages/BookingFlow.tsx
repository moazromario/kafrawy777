import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  CreditCard, 
  Wallet, 
  Smartphone, 
  CheckCircle, 
  ArrowRight,
  Info,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function BookingFlow({ user }: { user: any }) {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'vodafone_cash'>('wallet');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }
    fetchItem();
    fetchWallet();
  }, [id, type]);

  const fetchItem = async () => {
    try {
      // In a real app, fetch specific item by ID and type
      const res = await fetch('/api/directory');
      const data = await res.json();
      let found = null;
      if (type === 'service') found = data.services.find((s: any) => s.id === id);
      if (type === 'vehicle') found = data.vehicles.find((v: any) => v.id === id);
      if (type === 'project') found = data.projects.find((p: any) => p.id === id);
      
      if (found) setItem(found);
      else toast.error('العنصر غير موجود');
    } catch (err) {
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await fetch(`/api/wallet/${user.id}`);
      const data = await res.json();
      setWalletBalance(data.balance || 0);
    } catch (err) {}
  };

  const handleBooking = async () => {
    if (type === 'vehicle' && (!pickup || !dropoff)) {
      toast.error('يرجى تحديد موقع الالتقاء والوجهة');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          entityType: type,
          entityId: id,
          startDate: new Date().toISOString(),
          totalPrice: item.price,
          paymentMethod,
          pickup,
          dropoff
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep(3);
      toast.success('تم الحجز بنجاح');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center animate-pulse text-gray-400">جاري التحميل...</div>;
  if (!item) return <div className="text-center py-20">العنصر غير موجود</div>;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="flex justify-between items-center mb-12 relative">
        <div className="absolute left-0 right-0 h-0.5 bg-gray-100 top-1/2 -translate-y-1/2 z-0" />
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold relative z-10 transition-all duration-500",
              step >= s ? "bg-orange-600 text-white shadow-lg shadow-orange-200" : "bg-white text-gray-400 border-2 border-gray-100"
            )}
          >
            {step > s ? <CheckCircle size={20} /> : s}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/50">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-48 h-48 rounded-3xl overflow-hidden flex-shrink-0">
                  <img src={item.image_url || `https://picsum.photos/seed/${item.id}/800/600`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{item.title || item.model}</h2>
                      <span className="text-orange-600 text-sm font-medium bg-orange-50 px-3 py-1 rounded-full">
                        {type === 'vehicle' ? 'خدمات النقل' : type === 'service' ? 'خدمة' : 'مشروع'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{item.price} ج.م</div>
                  </div>
                  <p className="text-gray-500 leading-relaxed">{item.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl">
                      <Clock size={18} className="text-orange-500" />
                      <span>تأكيد فوري</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl">
                      <ShieldCheck size={18} className="text-orange-500" />
                      <span>دفع آمن</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {type === 'vehicle' && (
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPin size={20} className="text-orange-600" />
                  تفاصيل الرحلة
                </h3>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-600 rounded-full" />
                    <input
                      type="text"
                      placeholder="موقع الالتقاء"
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-10 pl-4 focus:ring-2 focus:ring-orange-500 transition-all"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-600 rounded-full" />
                    <input
                      type="text"
                      placeholder="الوجهة"
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-10 pl-4 focus:ring-2 focus:ring-orange-500 transition-all"
                      value={dropoff}
                      onChange={(e) => setDropoff(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              className="w-full bg-orange-600 text-white py-5 rounded-3xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 flex items-center justify-center gap-2"
            >
              متابعة للدفع
              <ChevronLeft size={20} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 space-y-8">
              <h3 className="text-xl font-bold text-gray-900">اختر طريقة الدفع</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={cn(
                    "flex items-center justify-between p-6 rounded-3xl border-2 transition-all",
                    paymentMethod === 'wallet' ? "border-orange-600 bg-orange-50/50" : "border-gray-50 bg-gray-50 hover:border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", paymentMethod === 'wallet' ? "bg-orange-600 text-white" : "bg-white text-gray-400")}>
                      <Wallet size={24} />
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">المحفظة الداخلية</div>
                      <div className="text-sm text-gray-500">الرصيد الحالي: {walletBalance} ج.م</div>
                    </div>
                  </div>
                  {paymentMethod === 'wallet' && <CheckCircle className="text-orange-600" />}
                </button>

                <button
                  onClick={() => setPaymentMethod('vodafone_cash')}
                  className={cn(
                    "flex items-center justify-between p-6 rounded-3xl border-2 transition-all",
                    paymentMethod === 'vodafone_cash' ? "border-red-600 bg-red-50/50" : "border-gray-50 bg-gray-50 hover:border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", paymentMethod === 'vodafone_cash' ? "bg-red-600 text-white" : "bg-white text-gray-400")}>
                      <Smartphone size={24} />
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">فودافون كاش</div>
                      <div className="text-sm text-gray-500">الدفع عبر رقم الهاتف</div>
                    </div>
                  </div>
                  {paymentMethod === 'vodafone_cash' && <CheckCircle className="text-red-600" />}
                </button>
              </div>

              <div className="bg-gray-50 p-6 rounded-3xl space-y-3">
                <div className="flex justify-between text-gray-500">
                  <span>سعر الخدمة</span>
                  <span>{item.price} ج.م</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>رسوم الخدمة</span>
                  <span>0 ج.م</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-xl text-gray-900">
                  <span>الإجمالي</span>
                  <span className="text-orange-600">{item.price} ج.م</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-white text-gray-600 py-5 rounded-3xl font-bold border border-gray-100 hover:bg-gray-50 transition-all"
              >
                رجوع
              </button>
              <button
                onClick={handleBooking}
                disabled={isProcessing || (paymentMethod === 'wallet' && walletBalance < item.price)}
                className="flex-[2] bg-orange-600 text-white py-5 rounded-3xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "جاري المعالجة..." : "تأكيد الحجز والدفع"}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-12"
          >
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-100">
              <CheckCircle size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">تم الحجز بنجاح!</h2>
              <p className="text-gray-500">يمكنك متابعة حالة طلبك من لوحة التحكم الخاصة بك</p>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 text-right space-y-4 max-w-md mx-auto">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">رقم الحجز</span>
                <span className="font-mono font-bold text-gray-900">#BK-8829</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">الخدمة</span>
                <span className="font-bold text-gray-900">{item.title || item.model}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">المبلغ المدفوع</span>
                <span className="font-bold text-green-600">{item.price} ج.م</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-orange-600 text-white py-5 rounded-3xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-200"
              >
                متابعة الطلب
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full text-gray-500 font-medium hover:text-orange-600 transition-colors"
              >
                العودة للرئيسية
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
