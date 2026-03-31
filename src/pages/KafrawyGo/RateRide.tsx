import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Send } from 'lucide-react';
import BackButton from '../../components/BackButton';

export default function RateRide() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleRate = () => {
    // In a real app, we'd save the rating to the DB
    navigate('/kafrawy-go');
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <BackButton />
      <h1 className="text-2xl font-bold text-slate-900 text-center">قيم رحلتك</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="text-center">
          <p className="text-slate-600 mb-4">كيف كانت تجربتك مع الكابتن محمد علي؟</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star}
                onClick={() => setRating(star)}
                className={`p-2 transition ${star <= rating ? 'text-yellow-500' : 'text-slate-300'}`}
              >
                <Star className="w-10 h-10 fill-current" />
              </button>
            ))}
          </div>
        </div>

        <textarea 
          placeholder="شاركنا رأيك (اختياري)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
          rows={4}
        />

        <button 
          onClick={handleRate}
          disabled={rating === 0}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-slate-300"
        >
          <Send size={20} /> إرسال التقييم
        </button>
      </div>
    </div>
  );
}
