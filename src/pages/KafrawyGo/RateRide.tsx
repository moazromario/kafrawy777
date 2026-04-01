import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, Send, Wallet, Banknote, Landmark, CheckCircle, ChevronRight, MessageSquare } from 'lucide-react';
import KafrawyLayout from '../../components/KafrawyLayout';
import { motion, AnimatePresence } from 'motion/react';

export default function RateRide() {
  const navigate = useNavigate();
  const location = useLocation();
  const { driver, requestData } = location.state || { 
    driver: { name: 'محمد علي', photo: 'https://i.pravatar.cc/150?u=1' },
    requestData: { fare: 80 }
  };

  const [step, setStep] = useState<'payment' | 'rating'>('payment');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleRate = () => {
    // In a real app, we'd save the rating and payment to the DB
    navigate('/kafrawy-go');
  };

  const paymentMethods = [
    { id: 'cash', name: 'كاش', icon: <Banknote className="text-green-600" /> },
    { id: 'wallet', name: 'محفظة كفراوي', icon: <Wallet className="text-blue-600" /> },
    { id: 'transfer', name: 'تحويل بنكي / فودافون كاش', icon: <Landmark className="text-purple-600" /> },
  ];

  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full" dir="rtl">
        <div className="max-w-3xl mx-auto px-4 pt-8">
          <AnimatePresence mode="wait">
            {step === 'payment' ? (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 text-center">
                  <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2">وصلت بالسلامة!</h1>
                  <p className="text-slate-500 font-bold">إجمالي المبلغ المطلوب دفعه للكابتن {driver.name}</p>
                  <div className="mt-6 text-5xl font-black text-blue-600">
                    {requestData.fare} <span className="text-xl">ج.م</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-black text-slate-900 px-2">اختر طريقة الدفع</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {paymentMethods.map((method) => (
                      <button 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-6 rounded-[1.5rem] border-2 transition-all flex items-center justify-between group ${
                          paymentMethod === method.id 
                            ? 'border-blue-600 bg-blue-50 shadow-md' 
                            : 'border-white bg-white hover:border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            paymentMethod === method.id ? 'bg-white' : 'bg-slate-50'
                          }`}>
                            {method.icon}
                          </div>
                          <span className={`font-black text-lg ${
                            paymentMethod === method.id ? 'text-blue-900' : 'text-slate-700'
                          }`}>{method.name}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === method.id ? 'border-blue-600 bg-blue-600' : 'border-slate-200'
                        }`}>
                          {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setStep('rating')}
                  disabled={!paymentMethod}
                  className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl disabled:bg-slate-200 disabled:shadow-none active:scale-95"
                >
                  تأكيد الدفع والتقييم <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="rating"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 text-center">
                  <img 
                    src={driver.photo} 
                    alt={driver.name}
                    className="w-24 h-24 rounded-[2.5rem] object-cover mx-auto mb-6 border-4 border-slate-50 shadow-md"
                  />
                  <h1 className="text-2xl font-black text-slate-900 mb-2">كيف كانت رحلتك؟</h1>
                  <p className="text-slate-500 font-bold">تقييمك يساعدنا في تحسين جودة الخدمة</p>
                  
                  <div className="flex justify-center gap-3 mt-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-1 transition-all duration-300 hover:scale-110 ${star <= rating ? 'text-yellow-500' : 'text-slate-200'}`}
                      >
                        <Star className={`w-12 h-12 ${star <= rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-black mb-2">
                    <MessageSquare size={20} className="text-blue-600" />
                    أضف تعليق (اختياري)
                  </div>
                  <textarea 
                    placeholder="اكتب رأيك في الكابتن والرحلة هنا..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                    rows={4}
                  />
                </div>

                <button 
                  onClick={handleRate}
                  disabled={rating === 0}
                  className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl disabled:bg-slate-200 disabled:shadow-none active:scale-95"
                >
                  <Send size={24} /> إرسال التقييم
                </button>
                
                <button 
                  onClick={() => navigate('/kafrawy-go')}
                  className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                  تخطي التقييم
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </KafrawyLayout>
  );
}
