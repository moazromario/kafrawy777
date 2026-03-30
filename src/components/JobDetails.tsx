import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Share2, MoreHorizontal, MapPin, Briefcase, Building2, Clock, Loader2, Send, MessageCircle, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import MainLayout from './MainLayout';
import { Job } from './Jobs';
import { useAuth } from '../context/AuthContext';
import { applyForJob, fetchProfile, fetchUserApplications } from '../lib/api';

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
      const applied = apps.some((app: any) => app.job_id === id);
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
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-white" dir="rtl">
          <p className="text-slate-500">الوظيفة غير موجودة.</p>
          <button onClick={() => navigate('/jobs')} className="mt-4 text-blue-600 font-semibold">
            العودة إلى الوظائف
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-white min-h-screen md:rounded-lg md:shadow-sm md:mt-4 pb-20 md:pb-0" dir="rtl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <ChevronRight className="w-6 h-6 text-slate-900" />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <Share2 className="w-5 h-5 text-slate-900" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <MoreHorizontal className="w-5 h-5 text-slate-900" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {statusMessage && (
            <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="font-bold">{statusMessage.text}</p>
              <button onClick={() => setStatusMessage(null)} className="mr-auto text-sm underline">إغلاق</button>
            </div>
          )}

          {/* Title & Company */}
          <div className="mb-6 flex items-start gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <Briefcase className="w-8 h-8 text-slate-500" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{job.title}</h1>
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <Building2 className="w-5 h-5" />
                <span>{job.company}</span>
              </div>
            </div>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <MapPin className="w-5 h-5 text-slate-500" />
              <span className="font-medium">{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <Clock className="w-5 h-5 text-slate-500" />
              <span className="font-medium">{job.type}</span>
            </div>
            {job.salary_range && (
              <div className="col-span-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                <span className="font-bold">الراتب:</span>
                <span className="font-medium">{job.salary_range}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {hasApplied ? (
              <div className="flex-1 bg-green-50 text-green-700 font-bold py-3 rounded-lg flex items-center justify-center gap-2 border border-green-200">
                <CheckCircle2 className="w-5 h-5" />
                تم التقديم
              </div>
            ) : (
              <button 
                onClick={() => setShowApplyModal(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Send className="w-5 h-5 rotate-180" />
                التقديم الآن
              </button>
            )}
            
            <button 
              onClick={handleMessageEmployer}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              مراسلة صاحب العمل
            </button>
          </div>

          <hr className="border-slate-200 mb-6" />

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">وصف الوظيفة</h2>
            <div className="text-slate-700 whitespace-pre-line leading-relaxed text-[15px]">
              {job.description}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">التقديم على الوظيفة</h3>
              <p className="text-slate-500 text-sm mt-1">{job.title} - {job.company}</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* CV Preview */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">السيرة الذاتية</label>
                {userProfile?.cv_url ? (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-bold text-blue-900 text-sm">سيرتك الذاتية المرفوعة</p>
                      <p className="text-blue-600 text-xs">سيتم إرفاقها مع الطلب</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-center">
                    <p className="text-red-600 text-sm mb-2">لم تقم برفع سيرة ذاتية بعد</p>
                    <button 
                      onClick={() => navigate('/profile')}
                      className="text-blue-600 text-sm font-bold hover:underline"
                    >
                      اذهب للملف الشخصي لرفعها
                    </button>
                  </div>
                )}
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رسالة تعريفية (اختياري)</label>
                <textarea 
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="لماذا أنت مناسب لهذه الوظيفة؟"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <button 
                onClick={handleApply}
                disabled={applying || !userProfile?.cv_url}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {applying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rotate-180" />}
                إرسال الطلب
              </button>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
