import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import { Review, servicesApi } from '../../services/servicesApi';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';

interface ReviewSectionProps {
  providerId: string;
  reviews: Review[];
  onReviewAdded: () => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ providerId, reviews, onReviewAdded }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      await servicesApi.addReview({
        provider_id: providerId,
        user_id: user.id,
        rating,
        comment
      });
      setComment('');
      setRating(5);
      toast.success('تم إضافة تقييمك بنجاح');
      onReviewAdded();
    } catch (err: any) {
      const msg = err.message || 'حدث خطأ أثناء إضافة التقييم';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
          <MessageSquare size={24} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">التقييمات والآراء</h3>
      </div>

      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-10"
        >
          <h4 className="text-lg font-bold text-slate-800 mb-4">أضف تقييمك</h4>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    rating >= star ? 'bg-yellow-50 text-yellow-500' : 'bg-slate-50 text-slate-300'
                  }`}
                >
                  <Star size={24} fill={rating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>

            <div className="relative mb-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب رأيك هنا بكل صراحة..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-200"
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      )}

      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50 flex gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden">
                {review.profiles?.avatar_url ? (
                  <img src={review.profiles.avatar_url} alt={review.profiles.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-bold text-slate-900">{review.profiles?.full_name || 'مستخدم مجهول'}</h5>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: ar })}
                    </span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={review.rating >= star ? 'text-yellow-500 fill-current' : 'text-slate-200'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed">{review.comment}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400">لا توجد تقييمات بعد. كن أول من يقيم!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
