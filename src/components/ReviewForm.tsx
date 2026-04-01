import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  productId: string;
  onReviewAdded: () => void;
}

export default function ReviewForm({ productId, onReviewAdded }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('يجب تسجيل الدخول لإضافة تقييم');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('reviews')
      .insert([
        {
          product_id: productId,
          user_id: user.id,
          rating,
          comment
        }
      ]);

    if (error) {
      toast.error('حدث خطأ أثناء إضافة التقييم');
      console.error(error);
    } else {
      toast.success('تم إضافة تقييمك بنجاح!');
      setComment('');
      onReviewAdded();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl mb-6">
      <h3 className="font-bold text-slate-900 mb-3">أضف تقييمك</h3>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer ${star <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="اكتب رأيك هنا..."
        className="w-full p-3 border border-slate-300 rounded-lg mb-3"
        rows={3}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        {loading ? 'جاري الإرسال...' : 'إرسال التقييم'}
      </button>
    </form>
  );
}
