import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Trash2, Save, ArrowRight, Info, DollarSign, Clock } from 'lucide-react';
import KafrawyLayout from '../../components/KafrawyLayout';
import { useAuth } from '../../context/AuthContext';
import { servicesApi, ServiceProvider } from '../../services/servicesApi';
import { toast } from 'sonner';

const AddService = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingProvider, setFetchingProvider] = useState(true);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  });

  React.useEffect(() => {
    const fetchProvider = async () => {
      if (!user) {
        setFetchingProvider(false);
        return;
      }
      try {
        const data = await servicesApi.getProviderByUserId(user.id);
        setProvider(data);
      } catch (err) {
        console.error('Error fetching provider:', err);
      } finally {
        setFetchingProvider(false);
      }
    };
    fetchProvider();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !provider) {
      toast.error('يجب أن تكون مسجلاً كمقدم خدمة أولاً');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await servicesApi.addService({
        provider_id: provider.id,
        title: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
      });

      setSuccess(true);
      toast.success('تم إضافة الخدمة بنجاح');
      setTimeout(() => navigate(-1), 2000);
    } catch (err: any) {
      const msg = err.message || 'حدث خطأ أثناء إضافة الخدمة';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProvider) {
    return (
      <KafrawyLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </KafrawyLayout>
    );
  }

  if (!provider) {
    return (
      <KafrawyLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <Info className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">أنت غير مسجل كمقدم خدمة</h2>
          <p className="text-slate-500 mb-8 max-w-md">يجب عليك التسجيل كمقدم خدمة أولاً لتتمكن من إضافة خدماتك للجمهور.</p>
          <button 
            onClick={() => navigate('/services/register')}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-200"
          >
            سجل الآن كمقدم خدمة
          </button>
        </div>
      </KafrawyLayout>
    );
  }

  return (
    <KafrawyLayout>
      <div className="w-full max-w-2xl mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowRight className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-2xl font-black text-slate-900">إضافة خدمة جديدة</h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <div className="p-8">
            {success ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Save className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">تمت الإضافة بنجاح!</h2>
                <p className="text-slate-500">جاري العودة لصفحتك الشخصية...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    اسم الخدمة
                  </label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900"
                    placeholder="مثال: تركيب سباكة حمام كامل"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    وصف الخدمة
                  </label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900 min-h-[120px]"
                    placeholder="اشرح تفاصيل الخدمة وماذا تشمل..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      السعر (ج.م)
                    </label>
                    <input 
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      مدة التنفيذ المتوقعة
                    </label>
                    <input 
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900"
                      placeholder="مثال: يومين"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-6 h-6" />
                        إضافة الخدمة الآن
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>

        <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100">
          <h3 className="font-black text-blue-900 mb-2 flex items-center gap-2">
            <Info className="w-5 h-5" />
            نصيحة للمحترفين
          </h3>
          <p className="text-blue-700 text-sm font-bold leading-relaxed">
            احرص على كتابة وصف دقيق وشامل لخدمتك. الخدمات التي تحتوي على تفاصيل واضحة وأسعار محددة تحصل على طلبات أكثر بنسبة 40%.
          </p>
        </div>
      </div>
    </KafrawyLayout>
  );
};

export default AddService;
