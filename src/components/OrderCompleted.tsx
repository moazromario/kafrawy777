import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Star, Share2, RotateCcw, Home, MessageSquare } from 'lucide-react';
import MainLayout from './MainLayout';
import { toast } from 'sonner';

export default function OrderCompleted() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [productRating, setProductRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitRating = () => {
    if (productRating === 0 || deliveryRating === 0) {
      toast.error('يرجى تقييم المنتج والتوصيل أولاً');
      return;
    }
    setIsSubmitted(true);
    toast.success('شكراً لتقييمك! تم حفظ ملاحظاتك بنجاح.');
  };

  const handleShare = () => {
    toast.info('تم نسخ رابط المنتج للمشاركة');
  };

  const handleReorder = () => {
    toast.success('تمت إضافة المنتج إلى السلة مرة أخرى');
    navigate('/marketplace/cart');
  };

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen md:rounded-lg md:shadow-sm md:mt-4 pb-24 md:pb-8" dir="rtl">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-8 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">تم تسليم طلبك بنجاح!</h1>
          <p className="text-slate-500 text-sm">
            الطلب {id ? `#${id}` : '#KFW-12345'} وصل إلى وجهته بأمان.
          </p>
        </div>

        <div className="p-4 space-y-6 max-w-md mx-auto mt-4">
          
          {/* Rating Section */}
          {!isSubmitted ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6 text-center">كيف كانت تجربتك؟</h2>
              
              {/* Product Rating */}
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-700 mb-3 text-center">تقييم المنتج</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={`prod-${star}`}
                      onClick={() => setProductRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star className={`w-8 h-8 ${star <= productRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-slate-100 mb-6" />

              {/* Delivery Rating */}
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-700 mb-3 text-center">تقييم المندوب (أحمد محمد)</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={`del-${star}`}
                      onClick={() => setDeliveryRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star className={`w-8 h-8 ${star <= deliveryRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Text */}
              <div className="mb-6">
                <textarea 
                  placeholder="أضف تعليقاً (اختياري)..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-24"
                ></textarea>
              </div>

              <button 
                onClick={handleSubmitRating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
              >
                إرسال التقييم
              </button>
            </div>
          ) : (
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 fill-green-600 text-green-600" />
              </div>
              <h3 className="font-bold text-green-800 mb-1">شكراً لتقييمك!</h3>
              <p className="text-sm text-green-600">رأيك يهمنا ويساعدنا في تحسين خدماتنا.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleReorder}
              className="bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-slate-200 shadow-sm"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-1">
                <RotateCcw className="w-5 h-5" />
              </div>
              إعادة الطلب
            </button>
            
            <button 
              onClick={handleShare}
              className="bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-slate-200 shadow-sm"
            >
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-1">
                <Share2 className="w-5 h-5" />
              </div>
              مشاركة المنتج
            </button>
          </div>

          <button 
            onClick={() => navigate('/marketplace')}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-4"
          >
            <Home className="w-5 h-5" />
            العودة للصفحة الرئيسية
          </button>

        </div>
      </div>
    </MainLayout>
  );
}
