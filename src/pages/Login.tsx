import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Lock, 
  Mail, 
  ArrowRight, 
  ChevronLeft, 
  Smartphone,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { toast } from 'sonner';

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'user'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock login/register for now
      // In a real app, this would call /api/auth/login or register
      const mockUser = {
        id: 'user-123',
        username: formData.username,
        full_name: formData.fullName || 'أحمد محمد',
        role: formData.role,
        phone: formData.phone || '01012345678'
      };

      // Special case for admin login
      if (formData.username === 'superadmin' && formData.password === 'Mdhg0109022901@#$') {
        mockUser.role = 'super_admin';
        mockUser.full_name = 'المدير العام';
      }

      localStorage.setItem('user', JSON.stringify(mockUser));
      onLogin(mockUser);
      toast.success('تم تسجيل الدخول بنجاح');
      
      if (mockUser.role === 'super_admin' || mockUser.role === 'admin') navigate('/admin');
      else if (mockUser.role === 'captain') navigate('/captain');
      else navigate('/');
    } catch (err) {
      toast.error('بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-600 mb-4">
            <LayoutDashboard size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isRegister ? 'إنشاء حساب جديد' : 'مرحباً بك مجدداً'}
          </h2>
          <p className="text-gray-500">
            {isRegister ? 'انضم إلينا وابدأ رحلتك الآن' : 'سجل دخولك لمتابعة خدماتك'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div className="relative">
                <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  required
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-orange-500 transition-all"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className="relative">
                <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  placeholder="رقم الهاتف"
                  required
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-orange-500 transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="اسم المستخدم"
              required
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-orange-500 transition-all"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="كلمة المرور"
              required
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-orange-500 transition-all"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {!isRegister && (
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                تذكرني
              </label>
              <button type="button" className="text-orange-600 font-medium hover:underline">نسيت كلمة المرور؟</button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-5 rounded-3xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'جاري التحميل...' : (isRegister ? 'إنشاء الحساب' : 'تسجيل الدخول')}
            <ChevronLeft size={20} />
          </button>
        </form>

        <div className="pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">
            {isRegister ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-orange-600 font-bold mr-2 hover:underline"
            >
              {isRegister ? 'سجل دخولك' : 'أنشئ حساباً جديداً'}
            </button>
          </p>
        </div>

        <div className="flex items-center gap-2 justify-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">
          <ShieldCheck size={12} />
          تشفير آمن للبيانات
        </div>
      </motion.div>
    </div>
  );
}
