import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Share2, MoreHorizontal, MapPin, Briefcase, Building2, Clock, Loader2, Send, MessageCircle, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import KafrawyLayout from '../../../components/KafrawyLayout';
import { Job } from './Jobs';
import { useAuth } from '../../../context/AuthContext';
import { applyForJob, fetchProfile, fetchUserApplications } from '../../../lib/api';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  useEffect(() => {
    if (id) {
      fetchJob();
      if (user) {
        checkApplicationStatus();
        loadUserProfile();
      }
    }
  }, [id, user]);

  const fetchJob = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
    } else if (data) {
      setJob(data);
    }
    setLoading(false);
  };

  const checkApplicationStatus = async () => {
    if (!user || !id) return;
    try {
      const apps = await fetchUserApplications(user.id);
      const applied = (apps || []).some((app: any) => app.job_id === id);
      setHasApplied(applied);
    } catch (err) {
      console.error('Error checking application status:', err);
    }
  };

  const loadUserProfile = async () => {
    if (!user) return;
    try {
      const profile = await fetchProfile(user.id);
      setUserProfile(profile);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleApply = async () => {
    if (!user || !id || !job) return;
    
    if (!userProfile?.cv_url) {
      setStatusMessage({ type: 'error', text: 'يرجى رفع سيرتك الذاتية في الملف الشخصي أولاً' });
      return;
    }

    setApplying(true);
    try {
      await applyForJob(id, user.id, userProfile.cv_url, coverLetter);
      setHasApplied(true);
      setShowApplyModal(false);
      setStatusMessage({ type: 'success', text: 'تم تقديم طلبك بنجاح!' });
    } catch (err: any) {
      console.error('Error applying:', err);
      setStatusMessage({ type: 'error', text: `خطأ: ${err.message}` });
    } finally {
      setApplying(false);
    }
  };

  const handleMessageEmployer = () => {
    if (!job?.employer_id) return;
    navigate('/chat', { state: { userId: job.employer_id } });
  };

  if (loading) {
    return (
      <KafrawyLayout>
        <div className="flex justify-center items-center min-h-screen bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </KafrawyLayout>
    );
  }

  if (!job) {
    return (
      <KafrawyLayout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-white" dir="rtl">
          <p className="text-slate-500">الوظيفة غير موجودة.</p>
          <button onClick={() => navigate('/services/jobs')} className="mt-4 text-blue-600 font-semibold">
            العودة إلى الوظائف
          </button>
        </div>
      </KafrawyLayout>
    );
  }

  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          {/* Header */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 mb-8 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>
            <div className="flex gap-2">
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <Share2 className="w-5 h-5 text-slate-900" />
              </button>
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <MoreHorizontal className="w-5 h-5 text-slate-900" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12">
            {statusMessage && (
              <div className={`mb-8 p-6 rounded-2xl flex items-center gap-4 ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {statusMessage.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                <p className="font-bold text-lg">{statusMessage.text}</p>
                <button onClick={() => setStatusMessage(null)} className="mr-auto text-sm font-bold underline">إغلاق</button>
              </div>
            )}

            {/* Title & Company */}
            <div className="mb-10 flex flex-col md:flex-row items-start gap-6">
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
                <Briefcase className="w-12 h-12" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">{job.title}</h1>
                <div className="flex items-center gap-3 text-slate-600 font-black text-xl">
                  <Building2 className="w-6 h-6 text-blue-500" />
                  <span>{job.company}</span>
                </div>
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div className="flex items-center gap-3 text-lg text-slate-700 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <MapPin className="w-6 h-6 text-blue-500" />
                <span className="font-bold">{job.location}</span>
              </div>
              <div className="flex items-center gap-3 text-lg text-slate-700 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <Clock className="w-6 h-6 text-orange-500" />
                <span className="font-bold">{job.type}</span>
              </div>
              {job.salary_range && (
                <div className="sm:col-span-2 flex items-center gap-3 text-lg text-green-700 bg-green-50 p-5 rounded-2xl border border-green-100">
                  <span className="font-black">الراتب المتوقع:</span>
                  <span className="font-bold">{job.salary_range}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              {hasApplied ? (
                <div className="flex-1 bg-green-50 text-green-700 font-black py-5 rounded-2xl flex items-center justify-center gap-3 border border-green-200 text-xl">
                  <CheckCircle2 className="w-6 h-6" />
                  تم التقديم بنجاح
                </div>
              ) : (
                <button 
                  onClick={() => setShowApplyModal(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-200 text-xl active:scale-95"
                >
                  <Send className="w-6 h-6 rotate-180" />
                  التقديم على الوظيفة
                </button>
              )}
              
              <button 
                onClick={handleMessageEmployer}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all text-xl active:scale-95"
              >
                <MessageCircle className="w-6 h-6 text-blue-600" />
                مراسلة صاحب العمل
              </button>
            </div>

            <div className="h-px bg-slate-100 w-full mb-12" />

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <FileText className="w-7 h-7 text-blue-600" />
                وصف الوظيفة والمتطلبات
              </h2>
              <div className="text-slate-700 whitespace-pre-line leading-relaxed text-lg font-medium">
                {job.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 bg-slate-50">
              <h3 className="text-2xl font-black text-slate-900">التقديم على الوظيفة</h3>
              <p className="text-slate-500 font-bold mt-1">{job.title} - {job.company}</p>
            </div>
            
            <div className="p-8 space-y-8">
              {/* CV Preview */}
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3">السيرة الذاتية</label>
                {userProfile?.cv_url ? (
                  <div className="flex items-center gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-black text-blue-900">سيرتك الذاتية المرفوعة</p>
                      <p className="text-blue-600 text-sm font-bold">سيتم إرفاقها تلقائياً مع الطلب</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <p className="text-red-600 font-bold mb-4">لم تقم برفع سيرة ذاتية بعد</p>
                    <button 
                      onClick={() => navigate('/profile')}
                      className="bg-white text-blue-600 px-6 py-2 rounded-xl font-black shadow-sm border border-blue-100 hover:bg-blue-50 transition-colors"
                    >
                      اذهب للملف الشخصي لرفعها
                    </button>
                  </div>
                )}
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3">رسالة تعريفية (اختياري)</label>
                <textarea 
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="لماذا أنت مناسب لهذه الوظيفة؟ اكتب نبذة مختصرة عن مهاراتك..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-none transition-all"
                />
              </div>
            </div>

            <div className="p-8 bg-slate-50 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleApply}
                disabled={applying || !userProfile?.cv_url}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg shadow-lg shadow-blue-200 active:scale-95"
              >
                {applying ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 rotate-180" />}
                إرسال طلب التوظيف
              </button>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-black py-4 rounded-2xl hover:bg-slate-100 transition-all text-lg active:scale-95"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </KafrawyLayout>
  );
}
