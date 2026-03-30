"use client";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Briefcase, Clock, CheckCircle2, XCircle, AlertCircle, FileText, MessageCircle, Loader2, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchUserApplications, fetchJobs, fetchJobApplications, updateApplicationStatus } from '../lib/api';
import MainLayout from './MainLayout';

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
        return <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-bold border border-yellow-100">قيد الانتظار</span>;
      case 'reviewed':
        return <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">تمت المراجعة</span>;
      case 'accepted':
        return <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-100">مقبول</span>;
      case 'rejected':
        return <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-100">مرفوض</span>;
      default:
        return <span className="bg-slate-50 text-slate-700 px-2 py-1 rounded text-xs font-bold border border-slate-100">{status}</span>;
    }
  };

  return (
    <MainLayout>
      <div className="bg-white min-h-screen md:rounded-lg md:shadow-sm md:mt-4" dir="rtl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/jobs')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <ChevronRight className="w-6 h-6 text-slate-900" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">طلبات التوظيف</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'sent' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:bg-slate-50'}`}
          >
            طلباتي المقدمة ({sentApplications?.length || 0})
          </button>
          <button 
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'received' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:bg-slate-50'}`}
          >
            الطلبات الواردة ({receivedApplications?.length || 0})
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : activeTab === 'sent' ? (
            <div className="space-y-4">
              {(sentApplications?.length || 0) > 0 ? (
                sentApplications.map((app) => (
                  <div key={app.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-200 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                          <Briefcase className="w-6 h-6 text-slate-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 leading-tight">{app.job?.title}</h3>
                          <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                            <Building2 className="w-3 h-3" />
                            <span>{app.job?.company}</span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-50 pt-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>منذ {new Date(app.created_at).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/jobs/${app.job_id}`)}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        عرض الوظيفة
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">لم تقم بالتقديم على أي وظائف بعد.</p>
                  <button onClick={() => navigate('/jobs')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
                    تصفح الوظائف
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {(receivedApplications?.length || 0) > 0 ? (
                receivedApplications.map((app) => (
                  <div key={app.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={app.applicant?.avatar_url || `https://picsum.photos/seed/${app.applicant_id}/50/50`} 
                          alt="Applicant" 
                          className="w-12 h-12 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 leading-tight">{app.applicant?.full_name || 'متقدم مجهول'}</h3>
                          <p className="text-slate-500 text-xs mt-1">متقدم لوظيفة: <span className="font-bold text-slate-700">{app.job?.title}</span></p>
                        </div>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>

                    {app.cover_letter && (
                      <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 mb-4 border border-slate-100 italic">
                        "{app.cover_letter}"
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      <a 
                        href={app.cv_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        عرض السيرة الذاتية
                      </a>
                      <button 
                        onClick={() => navigate('/chat', { state: { userId: app.applicant_id } })}
                        className="flex-1 bg-slate-100 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        مراسلة
                      </button>
                    </div>

                    <div className="flex gap-2 border-t border-slate-50 pt-4">
                      <button 
                        onClick={() => handleStatusUpdate(app.id, 'accepted')}
                        disabled={updatingId === app.id || app.status === 'accepted'}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        قبول
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(app.id, 'reviewed')}
                        disabled={updatingId === app.id || app.status === 'reviewed'}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <Loader2 className={`w-3 h-3 ${updatingId === app.id ? 'animate-spin' : ''}`} />
                        مراجعة
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(app.id, 'rejected')}
                        disabled={updatingId === app.id || app.status === 'rejected'}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        رفض
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">لا توجد طلبات واردة حالياً.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
