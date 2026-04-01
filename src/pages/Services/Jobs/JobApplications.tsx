import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Briefcase, Clock, CheckCircle2, XCircle, AlertCircle, FileText, MessageCircle, Loader2, Building2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { fetchUserApplications, fetchJobs, fetchJobApplications, updateApplicationStatus } from '../../../lib/api';
import KafrawyLayout from '../../../components/KafrawyLayout';

export default function JobApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [sentApplications, setSentApplications] = useState<any[]>([]);
  const [receivedApplications, setReceivedApplications] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load sent applications
      const sent = await fetchUserApplications(user!.id);
      setSentApplications(sent);

      // Load jobs created by user to see received applications
      const allJobs = await fetchJobs();
      const userJobs = allJobs.filter((j: any) => j.employer_id === user!.id);
      setMyJobs(userJobs);

      if ((userJobs?.length || 0) > 0) {
        const allReceived: any[] = [];
        for (const job of userJobs) {
          const apps = await fetchJobApplications(job.id);
          allReceived.push(...(apps || []).map((a: any) => ({ ...a, job })));
        }
        setReceivedApplications(allReceived);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    setUpdatingId(applicationId);
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setReceivedApplications(prev => 
        prev.map(app => app.id === applicationId ? { ...app, status: newStatus } : app)
      );
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-xl text-xs font-black border border-yellow-100">قيد الانتظار</span>;
      case 'reviewed':
        return <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-xl text-xs font-black border border-blue-100">تمت المراجعة</span>;
      case 'accepted':
        return <span className="bg-green-50 text-green-700 px-3 py-1 rounded-xl text-xs font-black border border-green-100">مقبول</span>;
      case 'rejected':
        return <span className="bg-red-50 text-red-700 px-3 py-1 rounded-xl text-xs font-black border border-red-100">مرفوض</span>;
      default:
        return <span className="bg-slate-50 text-slate-700 px-3 py-1 rounded-xl text-xs font-black border border-slate-100">{status}</span>;
    }
  };

  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          {/* Header */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 mb-8 flex items-center gap-4">
            <button onClick={() => navigate('/services/jobs')} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>
            <h1 className="text-2xl font-black text-slate-900">طلبات التوظيف</h1>
          </div>

          {/* Tabs */}
          <div className="flex bg-white rounded-[2rem] p-2 shadow-sm border border-slate-100 mb-8">
            <button 
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-4 rounded-[1.5rem] text-lg font-black transition-all ${activeTab === 'sent' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              طلباتي المقدمة ({sentApplications?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-4 rounded-[1.5rem] text-lg font-black transition-all ${activeTab === 'received' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              الطلبات الواردة ({receivedApplications?.length || 0})
            </button>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-24">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500 font-bold">جاري تحميل الطلبات...</p>
              </div>
            ) : activeTab === 'sent' ? (
              <div className="space-y-4">
                {(sentApplications?.length || 0) > 0 ? (
                  sentApplications.map((app) => (
                    <div key={app.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                            <Briefcase className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900 text-lg leading-tight">{app.job?.title}</h3>
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm mt-1">
                              <Building2 className="w-4 h-4 text-blue-500" />
                              <span>{app.job?.company}</span>
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-50 pt-4">
                        <div className="flex items-center gap-2 font-bold">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span>منذ {new Date(app.created_at).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <button 
                          onClick={() => navigate(`/services/jobs/${app.job_id}`)}
                          className="text-blue-600 font-black hover:underline"
                        >
                          عرض تفاصيل الوظيفة
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Briefcase size={40} />
                    </div>
                    <p className="text-slate-500 font-black text-xl mb-6">لم تقم بالتقديم على أي وظائف بعد.</p>
                    <button onClick={() => navigate('/services/jobs')} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 active:scale-95 transition-all">
                      تصفح الوظائف المتاحة
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {(receivedApplications?.length || 0) > 0 ? (
                  receivedApplications.map((app) => (
                    <div key={app.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={app.applicant?.avatar_url || `https://picsum.photos/seed/${app.applicant_id}/100/100`} 
                            alt="Applicant" 
                            className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h3 className="font-black text-slate-900 text-xl leading-tight">{app.applicant?.full_name || 'متقدم مجهول'}</h3>
                            <p className="text-slate-500 font-bold mt-1">متقدم لوظيفة: <span className="text-blue-600">{app.job?.title}</span></p>
                          </div>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>

                      {app.cover_letter && (
                        <div className="bg-slate-50 p-6 rounded-2xl text-slate-700 font-medium mb-6 border border-slate-100 italic relative">
                          <span className="absolute -top-3 right-6 bg-white px-2 text-blue-600 font-black text-xs border border-slate-100 rounded-lg">الرسالة التعريفية</span>
                          "{app.cover_letter}"
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <a 
                          href={app.cv_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 bg-blue-50 text-blue-700 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-100 transition-all border border-blue-100"
                        >
                          <FileText className="w-5 h-5" />
                          عرض السيرة الذاتية
                        </a>
                        <button 
                          onClick={() => navigate('/chat', { state: { userId: app.applicant_id } })}
                          className="flex-1 bg-slate-100 text-slate-900 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-200 transition-all"
                        >
                          <MessageCircle className="w-5 h-5 text-blue-600" />
                          مراسلة المتقدم
                        </button>
                      </div>

                      <div className="flex gap-3 border-t border-slate-50 pt-6">
                        <button 
                          onClick={() => handleStatusUpdate(app.id, 'accepted')}
                          disabled={updatingId === app.id || app.status === 'accepted'}
                          className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          قبول الطلب
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(app.id, 'reviewed')}
                          disabled={updatingId === app.id || app.status === 'reviewed'}
                          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                        >
                          <Loader2 className={`w-4 h-4 ${updatingId === app.id ? 'animate-spin' : ''}`} />
                          وضع قيد المراجعة
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(app.id, 'rejected')}
                          disabled={updatingId === app.id || app.status === 'rejected'}
                          className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                        >
                          <XCircle className="w-4 h-4" />
                          رفض الطلب
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle size={40} />
                    </div>
                    <p className="text-slate-500 font-black text-xl">لا توجد طلبات واردة حالياً.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </KafrawyLayout>
  );
}
