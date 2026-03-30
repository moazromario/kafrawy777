import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, MapPin, Briefcase, Building2, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import MainLayout from './MainLayout';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  salary_range: string;
  created_at: string;
  employer_id?: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
    } else if (data) {
      setJobs(data);
    }
    setLoading(false);
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="bg-white min-h-screen md:rounded-lg md:shadow-sm md:mt-4 overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-slate-900">الوظائف</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/jobs/applications')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span className="hidden sm:inline">الطلبات</span>
              </button>
              <button 
                onClick={() => navigate('/jobs/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">إضافة وظيفة</span>
              </button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="ابحث عن وظيفة أو شركة..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 rounded-lg py-2.5 pr-10 pl-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
        </div>

        {/* Jobs List */}
        <div className="p-2 md:p-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map(job => (
                <div 
                  key={job.id} 
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <Briefcase className="w-6 h-6 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-slate-900 truncate">{job.title}</h2>
                      <div className="flex items-center gap-1 text-slate-600 mt-1">
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm truncate">{job.company}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5" />
                          {job.type}
                        </div>
                        {job.salary_range && (
                          <div className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-md">
                            {job.salary_range}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {(filteredJobs?.length || 0) === 0 && (
                <div className="text-center text-slate-500 py-12">
                  لا توجد وظائف مطابقة لبحثك.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
