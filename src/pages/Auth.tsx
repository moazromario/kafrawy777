import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // تسجيل الدخول
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        navigate('/');
      } else {
        // إنشاء حساب جديد
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            }
          }
        });
        if (error) throw error;
        alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
        setIsLogin(true);
      }
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء المصادقة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4" dir="rtl">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black text-blue-600 tracking-tighter mb-2">كفراوي</h1>
        <p className="text-xl text-slate-700 font-medium">تواصل مع أهلك وناسك في كفر البطيخ</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <input 
                type="text" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="الاسم بالكامل" 
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="البريد الإلكتروني" 
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="كلمة السر (6 أحرف على الأقل)" 
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              required
              minLength={6}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-3 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="w-6 h-6 animate-spin" />}
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </button>
        </form>

        <div className="my-6 border-b border-slate-200 relative">
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-slate-500 text-sm">أو</span>
        </div>

        <div className="text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-3 px-6 rounded-lg transition-colors"
          >
            {isLogin ? 'إنشاء حساب جديد' : 'لدي حساب بالفعل'}
          </button>
        </div>
      </div>
    </div>
  );
}
