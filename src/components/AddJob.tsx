import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import MainLayout from './MainLayout';

export default function AddJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    description: '',
    salary_range: ''
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.company || !formData.location || !formData.type || !formData.description) {
      alert('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    try {
      setLoading(true);

      const { error: insertError } = await supabase
        .from('jobs')
        .insert({
          title: formData.title,
          company: formData.company,
          location: formData.location,
          type: formData.type,
          description: formData.description,
          salary_range: formData.salary_range,
        });

      if (insertError) {
        console.error('Insert error details:', insertError);
        throw new Error(insertError.message);
      }

      navigate('/jobs');
    } catch (error: any) {
      console.error('Error adding job:', error);
      alert(`فشل إضافة الوظيفة: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-white min-h-screen md:rounded-lg md:shadow-sm md:mt-4 pb-20 md:pb-0" dir="rtl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">إضافة وظيفة جديدة</h1>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="text-blue-600 font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            نشر
          </button>
        </div>

        <div className="p-4 max-w-xl mx-auto">
          <div className="flex justify-center mb-8 mt-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">المسمى الوظيفي *</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="مثال: مهندس برمجيات" 
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">اسم الشركة *</label>
              <input 
                type="text" 
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                placeholder="مثال: شركة التقنية الحديثة" 
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">الموقع *</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="مثال: القاهرة، مصر (أو عن بعد)" 
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">نوع الوظيفة *</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">اختر نوع الوظيفة</option>
                <option value="دوام كامل">دوام كامل</option>
                <option value="دوام جزئي">دوام جزئي</option>
                <option value="عن بعد">عن بعد</option>
                <option value="عقد">عقد</option>
                <option value="تدريب">تدريب</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">نطاق الراتب (اختياري)</label>
              <input 
                type="text" 
                value={formData.salary_range}
                onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                placeholder="مثال: 10,000 - 15,000 ج.م" 
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">وصف الوظيفة والمتطلبات *</label>
              <textarea 
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="اكتب تفاصيل الوظيفة، المهام، والمتطلبات..." 
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
