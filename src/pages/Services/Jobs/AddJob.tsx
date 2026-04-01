import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2, Briefcase, Building2, MapPin, Clock, DollarSign, FileText } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import KafrawyLayout from '../../../components/KafrawyLayout';

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

      navigate('/services/jobs');
    } catch (error: any) {
      console.error('Error adding job:', error);
      alert(`فشل إضافة الوظيفة: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full" dir="rtl">
        <div className="max-w-3xl mx-auto px-4 pt-8">
          {/* Header */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <ChevronRight className="w-6 h-6 text-slate-900" />
              </button>
              <h1 className="text-2xl font-black text-slate-900">إضافة وظيفة جديدة</h1>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3 rounded-2xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              نشر الآن
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-12">
            <div className="flex justify-center mb-12">
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner">
                <Briefcase className="w-12 h-12" />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
                    <Briefcase size={16} className="text-blue-500" />
                    المسمى الوظيفي *
                  </label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="مثال: محاسب، مهندس، عامل..." 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
                    <Building2 size={16} className="text-blue-500" />
                    اسم الشركة أو صاحب العمل *
                  </label>
                  <input 
                    type="text" 
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="مثال: شركة النصر، محل الأمانة..." 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-500" />
                    الموقع *
                  </label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="مثال: كفر البطيخ، دمياط، أو عن بعد" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" />
                    نوع الوظيفة *
                  </label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none"
                  >
                    <option value="">اختر نوع الوظيفة</option>
                    <option value="دوام كامل">دوام كامل</option>
                    <option value="دوام جزئي">دوام جزئي</option>
                    <option value="عن بعد">عن بعد</option>
                    <option value="عقد">عقد</option>
                    <option value="تدريب">تدريب</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
                  <DollarSign size={16} className="text-blue-500" />
                  نطاق الراتب (اختياري)
                </label>
                <input 
                  type="text" 
                  value={formData.salary_range}
                  onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                  placeholder="مثال: 5,000 - 8,000 ج.م" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" />
                  وصف الوظيفة والمتطلبات *
                </label>
                <textarea 
                  rows={8}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="اكتب تفاصيل الوظيفة، المهام المطلوبة، والمهارات اللازمة..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none min-h-[200px]"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </KafrawyLayout>
  );
}
