import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowRight, User, Briefcase, MapPin, Phone, 
  MessageCircle, Image as ImageIcon, CheckCircle, 
  Loader2, AlertCircle, Wrench, GraduationCap, 
  Scale, Calculator, Stethoscope
} from 'lucide-react';
import { servicesApi, ServiceCategory } from '../../services/servicesApi';
import { useAuth } from '../../context/AuthContext';
import KafrawyLayout from '../../components/KafrawyLayout';
import { toast } from 'sonner';

const categories: { name: ServiceCategory; icon: React.ReactNode }[] = [
  { name: 'صنايعية', icon: <Wrench size={20} /> },
  { name: 'مدرسين', icon: <GraduationCap size={20} /> },
  { name: 'محامين', icon: <Scale size={20} /> },
  { name: 'محاسبين', icon: <Calculator size={20} /> },
  { name: 'أطباء', icon: <Stethoscope size={20} /> },
];

const RegisterProvider: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    category: 'صنايعية' as ServiceCategory,
    title: '',
    description: '',
    location: '',
    phone: '',
    whatsapp: '',
    avatar_url: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await servicesApi.createProvider({
        ...formData,
        user_id: user.id
      });
      setSuccess(true);
      toast.success('تم تسجيلك كمقدم خدمة بنجاح');
      setTimeout(() => navigate('/services'), 2000);
    } catch (err: any) {
      const msg = err.message || 'حدث خطأ أثناء إنشاء البروفايل';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[40px] shadow-xl text-center max-w-md"
        >
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={64} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">تم التسجيل بنجاح!</h2>
          <p className="text-slate-500 text-lg mb-8">أهلاً بك في عائلة كفراوي. جاري توجيهك للوحة التحكم...</p>
          <Loader2 size={32} className="text-blue-600 animate-spin mx-auto" />
        </motion.div>
      </div>
    );
  }

  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full">
        <div className="max-w-3xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-4 mb-10">
          <Link to="/services" className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
            <ArrowRight size={24} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">سجل كمقدم خدمة</h1>
            <p className="text-slate-500">ابدأ رحلتك مع كفراوي ووسع نطاق عملك</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 mr-2 flex items-center gap-2">
                  <User size={16} className="text-blue-500" />
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثلاً: محمد أحمد"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 mr-2 flex items-center gap-2">
                  <Briefcase size={16} className="text-blue-500" />
                  القسم
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategory })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 mr-2 flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-500" />
                المسمى الوظيفي
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثلاً: سباك محترف - مدرس رياضيات ثانوي"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 mr-2 flex items-center gap-2">
                <ImageIcon size={16} className="text-blue-500" />
                رابط الصورة الشخصية
              </label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 mr-2 flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" />
                الموقع (المدينة / المنطقة)
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="مثلاً: كفر البطيخ - حي المحافظة"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 mr-2 flex items-center gap-2">
                  <Phone size={16} className="text-blue-500" />
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 mr-2 flex items-center gap-2">
                  <MessageCircle size={16} className="text-blue-500" />
                  رقم الواتساب (اختياري)
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 mr-2 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-500" />
                وصف عنك وعن خبراتك
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="اكتب نبذة مختصرة عن خبراتك والخدمات التي تقدمها..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-slate-700 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 font-medium">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <CheckCircle size={24} />
                  إتمام التسجيل
                </>
              )}
            </button>
          </form>
        </motion.div>
        </div>
      </div>
    </KafrawyLayout>
  );
};

export default RegisterProvider;
