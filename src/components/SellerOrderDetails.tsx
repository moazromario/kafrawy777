import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, 
  MapPin, 
  Phone, 
  User, 
  Banknote, 
  Package, 
  CheckCircle2, 
  XCircle, 
  Clock,
  CreditCard,
  Truck,
  ShieldCheck
} from 'lucide-react';
import MainLayout from './MainLayout';
import { toast } from 'sonner';

export default function SellerOrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Mock order data based on ID
  const [order, setOrder] = useState({
    id: id || 'KFW-1001',
    date: '1 أبريل 2026 - 10:30 صباحاً',
    status: 'new', // new, processing, shipped, rejected, completed
    customer: {
      name: 'أحمد محمود',
      phone: '01012345678',
      address: 'شارع النيل، العجوزة، الجيزة، الطابق الرابع، شقة 12'
    },
    paymentMethod: 'cash', // cash, card, wallet
    items: [
      { id: 1, name: 'سماعة بلوتوث سوني WH-1000XM4', price: 8500, quantity: 1, image: 'https://picsum.photos/seed/headphone/100/100' },
      { id: 2, name: 'كابل أنكر USB-C مضفر', price: 250, quantity: 2, image: 'https://picsum.photos/seed/cable/100/100' }
    ],
    subtotal: 9000,
    shipping: 50,
    total: 9050
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('kafrawy'); // kafrawy, external

  const handleAcceptOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setOrder({ ...order, status: 'processing' });
      setIsProcessing(false);
      toast.success('تم قبول الطلب بنجاح!', {
        description: 'الرجاء تحديد طريقة الشحن وتجهيز الطلب.'
      });
    }, 1000);
  };

  const handleRejectOrder = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في رفض هذا الطلب؟')) {
      setIsProcessing(true);
      setTimeout(() => {
        setOrder({ ...order, status: 'rejected' });
        setIsProcessing(false);
        toast.error('تم رفض الطلب', {
          description: 'تم إعلام العميل برفض الطلب.'
        });
      }, 1000);
    }
  };

  const handleShipOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setOrder({ ...order, status: 'shipped' });
      setIsProcessing(false);
      toast.success('تم شحن الطلب!', {
        description: 'الطلب الآن في طريقه للعميل.'
      });
    }, 1000);
  };

  const handleDeliverOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setOrder({ ...order, status: 'completed' });
      setIsProcessing(false);
      toast.success('تم تسليم الطلب بنجاح!', {
        description: 'تم إضافة المبلغ إلى رصيدك.'
      });
    }, 1000);
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case 'new':
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><Clock className="w-4 h-4" /> طلب جديد</span>;
      case 'processing':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><Package className="w-4 h-4" /> جاري التجهيز</span>;
      case 'shipped':
        return <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><Truck className="w-4 h-4" /> تم الشحن</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><XCircle className="w-4 h-4" /> مرفوض</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> مكتمل</span>;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen md:rounded-lg md:shadow-sm md:mt-4 pb-24 md:pb-8" dir="rtl">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/marketplace/dashboard')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors -mr-2">
              <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">تفاصيل الطلب</h1>
          </div>
          {getStatusBadge()}
        </div>

        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          
          {/* Order Info */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500 mb-1">رقم الطلب</p>
              <p className="font-black text-lg text-slate-900">{order.id}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-slate-500 mb-1">تاريخ الطلب</p>
              <p className="font-bold text-sm text-slate-900">{order.date}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-5 h-5 text-blue-600" />
              بيانات العميل والتوصيل
            </h2>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{order.customer.name}</p>
                <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span dir="ltr">{order.customer.phone}</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900 text-sm mb-1">عنوان التوصيل</p>
                <p className="text-sm text-slate-600 leading-relaxed">{order.customer.address}</p>
              </div>
            </div>
          </div>

          {/* Shipping Management (Visible after accepting) */}
          {(order.status === 'processing' || order.status === 'shipped' || order.status === 'completed') && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Truck className="w-5 h-5 text-blue-600" />
                إدارة الشحن والتوصيل
              </h2>
              
              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${deliveryMethod === 'kafrawy' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                  <input 
                    type="radio" 
                    name="delivery" 
                    value="kafrawy" 
                    checked={deliveryMethod === 'kafrawy'} 
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    disabled={order.status !== 'processing'}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-slate-900 flex items-center gap-1">
                        توصيل كفراوي <ShieldCheck className="w-4 h-4 text-green-600" />
                      </p>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">موصى به</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">مندوب كفراوي سيقوم باستلام وتسليم الطلب بأمان وسرعة.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${deliveryMethod === 'external' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                  <input 
                    type="radio" 
                    name="delivery" 
                    value="external" 
                    checked={deliveryMethod === 'external'} 
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    disabled={order.status !== 'processing'}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 mb-1">شركة شحن خارجية / توصيل ذاتي</p>
                    <p className="text-xs text-slate-500 leading-relaxed">استخدم أرامكس، بوسطة، أو قم بتوصيل الطلب بنفسك.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
              <Banknote className="w-5 h-5 text-blue-600" />
              طريقة الدفع
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                {order.paymentMethod === 'cash' ? <Banknote className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  {order.paymentMethod === 'cash' ? 'الدفع عند الاستلام' : 'دفع إلكتروني'}
                </p>
                <p className="text-xs text-slate-500">
                  {order.paymentMethod === 'cash' ? 'سيقوم المندوب بتحصيل المبلغ' : 'تم الدفع مسبقاً'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
              <Package className="w-5 h-5 text-blue-600" />
              المنتجات المطلوبة ({order.items.length})
            </h2>
            
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-3 py-2 border-b border-slate-50 last:border-0">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover border border-slate-100" />
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2">{item.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-slate-500">الكمية: <span className="font-bold text-slate-900">{item.quantity}</span></p>
                      <p className="font-bold text-blue-600">{(item.price * item.quantity).toLocaleString()} ج.م</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي</span>
                <span className="font-medium text-slate-900">{order.subtotal.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>رسوم التوصيل</span>
                <span className="font-medium text-slate-900">{order.shipping.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100">
                <span className="font-bold text-slate-900">الإجمالي المستحق</span>
                <span className="text-xl font-black text-blue-600">{order.total.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe z-20 md:relative md:bg-transparent md:border-t-0 md:p-4 max-w-2xl mx-auto">
          {order.status === 'new' && (
            <div className="flex gap-3">
              <button 
                onClick={handleRejectOrder}
                disabled={isProcessing}
                className="flex-1 bg-white border-2 border-red-100 hover:bg-red-50 text-red-600 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <XCircle className="w-5 h-5" />
                رفض الطلب
              </button>
              <button 
                onClick={handleAcceptOrder}
                disabled={isProcessing}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    قبول وتجهيز الشحن
                  </>
                )}
              </button>
            </div>
          )}

          {order.status === 'processing' && (
            <button 
              onClick={handleShipOrder}
              disabled={isProcessing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Truck className="w-5 h-5" />
                  تأكيد شحن الطلب
                </>
              )}
            </button>
          )}

          {order.status === 'shipped' && (
            <button 
              onClick={handleDeliverOrder}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-600/20"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  تأكيد تسليم الطلب للعميل
                </>
              )}
            </button>
          )}

          {order.status === 'completed' && (
            <div className="bg-green-50 border border-green-100 text-green-800 p-4 rounded-xl flex items-center justify-center gap-2 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              تم تسليم الطلب وإغلاقه بنجاح
            </div>
          )}
          
          {order.status === 'rejected' && (
            <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-xl flex items-center justify-center gap-2 font-bold">
              <XCircle className="w-5 h-5" />
              تم رفض هذا الطلب
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
