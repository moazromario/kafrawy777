import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, MessageCircle, Filter, ChevronDown, Loader2 } from 'lucide-react';
import KafrawyLayout from '../../components/KafrawyLayout';
import { servicesApi } from '../../services/servicesApi';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const AllReviews = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'highest' | 'lowest'>('all');

  useEffect(() => {
    const fetchProvider = async () => {
      if (!id) return;
      try {
        const data = await servicesApi.getProviderById(id);
        setProvider(data);
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء جلب التقييمات');
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  const sortedReviews = provider?.reviews ? [...provider.reviews].sort((a, b) => {
    if (filter === 'highest') return b.rating - a.rating;
    if (filter === 'lowest') return a.rating - b.rating;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }) : [];

  if (loading) {
    return (
      <KafrawyLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </KafrawyLayout>
    );
  }

  if (error || !provider) {
    return (
      <KafrawyLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-black text-slate-900 mb-4">{error || 'لم يتم العثور على مقدم الخدمة'}</h2>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black"
          >
            العودة
          </button>
        </div>
      </KafrawyLayout>
    );
  }

  return (
    <KafrawyLayout>
      <div className="w-full max-w-3xl mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowRight className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900">تقييمات العملاء</h1>
              <p className="text-slate-500 font-bold text-sm">لـ {provider.full_name}</p>
            </div>
          </div>

          <div className="relative group">
            <button className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl font-black text-sm text-slate-700 hover:bg-slate-200 transition-all">
              <Filter className="w-4 h-4" />
              ترتيب حسب
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
              <button 
                onClick={() => setFilter('all')}
                className={`w-full text-right px-6 py-3 text-sm font-black hover:bg-slate-50 transition-colors ${filter === 'all' ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}
              >
                الأحدث أولاً
              </button>
              <button 
                onClick={() => setFilter('highest')}
                className={`w-full text-right px-6 py-3 text-sm font-black hover:bg-slate-50 transition-colors ${filter === 'highest' ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}
              >
                الأعلى تقييماً
              </button>
              <button 
                onClick={() => setFilter('lowest')}
                className={`w-full text-right px-6 py-3 text-sm font-black hover:bg-slate-50 transition-colors ${filter === 'lowest' ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}
              >
                الأقل تقييماً
              </button>
            </div>
          </div>
        </div>

        {/* Rating Summary Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 flex flex-col md:flex-row items-center gap-12">
          <div className="text-center">
            <div className="text-6xl font-black text-slate-900 mb-2">{provider.rating?.toFixed(1) || '0.0'}</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-6 h-6 ${star <= Math.round(provider.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} 
                />
              ))}
            </div>
            <div className="text-slate-500 font-bold text-sm">بناءً على {provider.reviews?.length || 0} تقييم</div>
          </div>

          <div className="flex-1 w-full space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = provider.reviews?.filter((r: any) => Math.round(r.rating) === rating).length || 0;
              const percentage = provider.reviews?.length ? (count / provider.reviews.length) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-8 shrink-0">
                    <span className="text-sm font-black text-slate-600">{rating}</span>
                    <Star className="w-3 h-3 fill-slate-400 text-slate-400" />
                  </div>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-yellow-400 rounded-full shadow-sm shadow-yellow-200"
                    />
                  </div>
                  <div className="text-xs font-black text-slate-400 w-8 text-left">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {sortedReviews.length > 0 ? (
            sortedReviews.map((review: any, index: number) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                      {review.profiles?.avatar_url ? (
                        <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <MessageCircle className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">{review.profiles?.full_name || 'عميل كفراوي'}</h4>
                      <p className="text-xs text-slate-400 font-bold">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: ar })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-black text-yellow-700">{review.rating}</span>
                  </div>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {review.comment}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900 mb-2">لا توجد تقييمات بعد</h3>
              <p className="text-slate-500 font-bold">كن أول من يقيم خدمات {provider.full_name}</p>
            </div>
          )}
        </div>
      </div>
    </KafrawyLayout>
  );
};

export default AllReviews;
