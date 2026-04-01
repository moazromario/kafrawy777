import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, Wallet, Banknote, MapPin, Smartphone, CheckCircle2 } from 'lucide-react';
import MainLayout from './MainLayout';
import { toast } from 'sonner';

export default function Checkout() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash, card, wallet, vodafone
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Mock data for order summary
  const subtotal = 17400;
  const shipping = 50;
  const total = subtotal + shipping;

  const handleConfirmOrder = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderSuccess(true);
      toast.success('تم تأكيد الطلب بنجاح!');
    }, 1500);
  };

  if (orderSuccess) {
    return (
      <MainLayout>
        <div className="bg-white min-h-screen flex flex-col items-center justify-center p-6 text-center" dir="rtl">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-6">تم استلام طلبك بنجاح!</h1>
          
          <div className="bg-slate-50 p-6 rounded-2xl w-full max-w-sm mb-8 border border-slate-100 shadow-sm">
            <div className="mb-4 pb-4 border-b border-slate-200">
              <p className="text-slate-500 mb-1 text-sm font-medium">رقم الطلب</p>
              <p className="font-black text-xl text-slate-900 tracking-wider">#KFW-{Math.floor(Math.random() * 100000)}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1 text-sm font-medium">تاريخ التسليم المتوقع</p>
              <p className="font-bold text-lg text-blue-600">4 أبريل - 6 أبريل 2026</p>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <button 
              onClick={() => navigate(`/marketplace/track/KFW-${Math.floor(Math.random() * 100000)}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              تتبع الطلب
            </button>
            <button 
              onClick={() => navigate('/marketplace')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl transition-colors"
            >
              العودة للسوق
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen md:rounded-lg md:shadow-sm md:mt-4 pb-24 md:pb-8" dir="rtl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors -mr-2">
            <ChevronRight className="w-6 h-6 text-slate-900" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">إتمام الطلب</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-900">عنوان الشحن</h3>
              <button className="text-sm text-blue-600 font-medium">تغيير</button>
            </div>
            <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 text-sm">المنزل</p>
                <p className="text-sm text-slate-600 mt-1">شارع النيل، العجوزة، الجيزة، مصر</p>
                <p className="text-sm text-slate-500 mt-1">01012345678</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3">طريقة الدفع</h3>
            <div className="space-y-3">
              {/* Cash */}
              <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'cash' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${paymentMethod === 'cash' ? 'text-blue-900' : 'text-slate-700'}`}>الدفع عند الاستلام</p>
                    <p className="text-xs text-slate-500">ادفع نقداً للمندوب</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-blue-600' : 'border-slate-300'}`}>
                  {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                </div>
                <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="hidden" />
              </label>

              {/* Card */}
              <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'card' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${paymentMethod === 'card' ? 'text-blue-900' : 'text-slate-700'}`}>بطاقة ائتمان / خصم</p>
                    <p className="text-xs text-slate-500">فيزا، ماستركارد، ميزة</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-blue-600' : 'border-slate-300'}`}>
                  {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                </div>
                <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="hidden" />
              </label>

              {/* Vodafone Cash */}
              <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'vodafone' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'vodafone' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${paymentMethod === 'vodafone' ? 'text-red-700' : 'text-slate-700'}`}>فودافون كاش / محافظ إلكترونية</p>
                    <p className="text-xs text-slate-500">ادفع عبر محفظتك الإلكترونية</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'vodafone' ? 'border-blue-600' : 'border-slate-300'}`}>
                  {paymentMethod === 'vodafone' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                </div>
                <input type="radio" name="payment" value="vodafone" checked={paymentMethod === 'vodafone'} onChange={() => setPaymentMethod('vodafone')} className="hidden" />
              </label>

              {/* Kafrawy Wallet */}
              <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'wallet' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'wallet' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${paymentMethod === 'wallet' ? 'text-blue-900' : 'text-slate-700'}`}>محفظة كفراوي</p>
                    <p className="text-xs text-slate-500">الرصيد المتاح: 0 ج.م</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-blue-600' : 'border-slate-300'}`}>
                  {paymentMethod === 'wallet' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                </div>
                <input type="radio" name="payment" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="hidden" />
              </label>
            </div>
            
            {/* Conditional Payment Details Input */}
            {paymentMethod === 'vodafone' && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">رقم المحفظة</label>
                <input 
                  type="tel" 
                  placeholder="010XXXXXXXX" 
                  className="w-full p-3 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3">ملخص الطلب</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي</span>
                <span className="font-medium text-slate-900">{subtotal.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>رسوم التوصيل</span>
                <span className="font-medium text-slate-900">{shipping.toLocaleString()} ج.م</span>
              </div>
              <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between items-center">
                <span className="font-bold text-slate-900">الإجمالي</span>
                <span className="text-xl font-black text-blue-600">{total.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Checkout Bar */}
        <div className="bg-white border-t border-slate-200 p-4 z-20">
          <button 
            onClick={handleConfirmOrder}
            disabled={isSubmitting || (paymentMethod === 'wallet' && total > 0)} // Disable if wallet has 0 balance (mock logic)
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
          >
            {isSubmitting ? 'جاري التأكيد...' : `تأكيد الطلب (${total.toLocaleString()} ج.م)`}
          </button>
          {paymentMethod === 'wallet' && total > 0 && (
            <p className="text-center text-xs text-red-500 mt-2">رصيد المحفظة غير كافٍ</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
