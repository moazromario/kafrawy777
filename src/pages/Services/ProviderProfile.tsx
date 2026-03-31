import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, Star, MapPin, Phone, MessageCircle, 
  CheckCircle, Share2, Heart, Loader2, AlertCircle,
  Briefcase, Info, ShieldCheck, Plus, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import { servicesApi, ServiceProvider, Service, Review } from '../../services/servicesApi';
import { useAuth } from '../../context/AuthContext';
import ReviewSection from '../../components/Services/ReviewSection';
import KafrawyLayout from '../../components/KafrawyLayout';
import { toast } from 'sonner';

interface ProviderWithDetails extends ServiceProvider {
  services: Service[];
  service_reviews: Review[];
}

const ProviderProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [provider, setProvider] = useState<ProviderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchProviderData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await servicesApi.getProviderById(id);
      setProvider(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب بيانات مقدم الخدمة');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!provider) return;
    
    try {
      const added = await servicesApi.toggleFavorite(user.id, provider.id);
      setIsFavorite(added);
      toast.success(added ? 'تم الإضافة للمفضلة' : 'تم الإزالة من المفضلة');
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error('حدث خطأ أثناء تحديث المفضلة');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold">جاري تحميل بيانات البروفايل...</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertCircle size={64} className="text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">عذراً، حدث خطأ ما</h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">{error || 'لم نتمكن من العثور على مقدم الخدمة المطلوب.'}</p>
        <Link to="/services" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors">
          العودة للخدمات
        </Link>
      </div>
    );
  }

  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full">
        {/* Header Image & Actions */}
      <div className="relative h-64 md:h-80 bg-blue-600 overflow-hidden">
        {provider.avatar_url ? (
          <img 
            src={provider.avatar_url} 
            alt={provider.name} 
            className="w-full h-full object-cover opacity-60 blur-sm scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800"></div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <Link to="/services" className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-colors">
            <ArrowRight size={24} />
          </Link>
          <div className="flex gap-2">
            <button 
              onClick={handleToggleFavorite}
              className={`p-3 backdrop-blur-md rounded-2xl transition-all duration-300 ${
                isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-colors">
              <Share2 size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-10">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] bg-slate-100 border-4 border-white shadow-lg overflow-hidden">
                {provider.avatar_url ? (
                  <img src={provider.avatar_url} alt={provider.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-500 text-5xl font-bold">
                    {provider.name.charAt(0)}
                  </div>
                )}
              </div>
              {provider.is_verified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-2xl shadow-lg border-4 border-white">
                  <ShieldCheck size={24} />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{provider.name}</h1>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                  {provider.category}
                </span>
              </div>
              <p className="text-xl text-blue-600 font-medium mb-4">{provider.title}</p>
              
              <div className="flex flex-wrap gap-6 text-slate-500 mb-8">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-slate-400" />
                  <span className="font-medium">{provider.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-yellow-500 fill-current" />
                  <span className="font-bold text-slate-700">{provider.rating || '0.0'}</span>
                  <span className="text-slate-400">({provider.review_count} تقييم)</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href={`tel:${provider.phone}`}
                  className="flex-1 min-w-[160px] flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  <Phone size={20} />
                  اتصال مباشر
                </a>
                {provider.whatsapp && (
                  <a
                    href={`https://wa.me/${provider.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[160px] flex items-center justify-center gap-3 bg-green-500 text-white py-4 rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-200"
                  >
                    <MessageCircle size={20} />
                    واتساب
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Experience Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">الخبرات والمهارات</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <p className="text-slate-700 font-medium">أكثر من 10 سنوات خبرة في مجال {provider.category}</p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <p className="text-slate-700 font-medium">حاصل على شهادات معتمدة في {provider.title}</p>
                </div>
              </div>
            </motion.div>

            {/* Portfolio Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center">
                  <ImageIcon size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">معرض الأعمال</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-slate-200 rounded-2xl overflow-hidden">
                    <img 
                      src={`https://picsum.photos/seed/${provider.id}-${i}/400/400`} 
                      alt="عمل سابق" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Services Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                    <Briefcase size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">الخدمات والأسعار</h3>
                </div>
                {user?.id === provider.user_id && (
                  <Link 
                    to="/services/add"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    <Plus size={18} />
                    إضافة خدمة
                  </Link>
                )}
              </div>
              
              <div className="space-y-4">
                {provider.services.length > 0 ? (
                  provider.services.map((service) => (
                    <div key={service.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-blue-200 transition-all group">
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{service.title}</h4>
                        <p className="text-sm text-slate-500">{service.description}</p>
                      </div>
                      {service.price && (
                        <div className="text-left">
                          <span className="text-xl font-black text-blue-600">{service.price}</span>
                          <span className="text-xs text-slate-400 mr-1">ج.م</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-4">لا توجد خدمات مضافة حالياً.</p>
                )}
              </div>
            </motion.div>

            {/* Reviews Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-900">تقييمات العملاء</h3>
                <Link 
                  to={`/services/reviews/${provider.id}`}
                  className="flex items-center gap-2 text-blue-600 font-black text-sm hover:underline"
                >
                  عرض الكل
                  <ExternalLink size={16} />
                </Link>
              </div>
              <ReviewSection 
                providerId={provider.id} 
                reviews={provider.service_reviews} 
                onReviewAdded={fetchProviderData} 
              />
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 sticky top-24"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-6">معلومات التواصل</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">رقم الهاتف</p>
                    <p className="font-bold text-slate-700" dir="ltr">{provider.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">الموقع</p>
                    <p className="font-bold text-slate-700">{provider.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">حالة التوثيق</p>
                    <p className={`font-bold ${provider.is_verified ? 'text-green-600' : 'text-slate-500'}`}>
                      {provider.is_verified ? 'هوية موثقة' : 'غير موثق بعد'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-blue-50 rounded-3xl">
                <p className="text-sm text-blue-700 font-medium leading-relaxed">
                  تذكر دائماً أن تطلب فاتورة أو ضمان عند التعامل مع أي مقدم خدمة لضمان حقوقك.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
        </div>
      </div>
    </KafrawyLayout>
  );
};

export default ProviderProfile;
