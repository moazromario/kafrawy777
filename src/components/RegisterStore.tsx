import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Store, Upload, MapPin, Phone, Building2, ArrowRight } from 'lucide-react';
import MainLayout from './MainLayout';
import { toast } from 'sonner';

export default function RegisterStore() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [logo, setLogo] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (isLogin) {
        toast.success('تم تسجيل الدخول بنجاح!');
      } else {
        toast.success('تم إنشاء متجرك بنجاح!', {
          description: 'مرحباً بك في سوق كفراوي كبائع.'
        });
      }
      // Navigate to seller dashboard
      navigate('/marketplace/dashboard');
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen md:rounded-lg md:shadow-sm md:mt-4 pb-12" dir="rtl">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 h-14 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => navigate('/marketplace')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors -mr-2">
            <ChevronRight className="w-6 h-6 text-slate-900" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">
            {isLogin ? 'تسجيل دخول متجر' : 'تسجيل متجر جديد'}
          </h1>
        </div>

        <div className="p-6 max-w-md mx-auto">
          {/* Hero Icon */}
          <div className="flex flex-col items-center justify-center mb-8 mt-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Store className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 text-center">
              {isLogin ? 'مرحباً بعودتك!' : 'ابدأ البيع على كفراوي'}
            </h2>
            <p className="text-slate-500 text-center mt-2 text-sm">
              {isLogin 
                ? 'قم بتسجيل الدخول لإدارة متجرك ومنتجاتك' 
                : 'أنشئ متجرك الآن واعرض منتجاتك لآلاف العملاء في منطقتك'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            
            {!isLogin && (
              <>
                {/* Logo Upload */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative w-24 h-24 bg-slate-100 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors overflow-hidden group">
                    {logo ? (
                      <img src={logo} alt="Store Logo" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-400 mb-1 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[10px] text-slate-500 font-medium">صورة الشعار</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setLogo(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Store Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">اسم المتجر</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full pl-3 pr-10 py-3 border border-slate-300 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="مثال: إلكترونيات كفراوي"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">عنوان المتجر</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-3 pr-10 py-3 border border-slate-300 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="مثال: شارع النيل، العجوزة"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Phone Number (Used for both Login and Register here as an identifier) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">رقم الهاتف</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-3 pr-10 py-3 border border-slate-300 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left"
                  placeholder="010XXXXXXXX"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">كلمة المرور</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-3 border border-slate-300 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="********"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20 mt-6"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? 'دخول' : 'إنشاء المتجر'}
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              {isLogin ? 'ليس لديك متجر؟' : 'لديك متجر بالفعل؟'}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 font-bold mr-2 hover:underline focus:outline-none"
              >
                {isLogin ? 'سجل متجرك الآن' : 'تسجيل الدخول'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
