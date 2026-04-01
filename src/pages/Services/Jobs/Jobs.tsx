import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Loader2, MapPin, Briefcase, Building2, Clock, FileText, Wrench } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import KafrawyLayout from '../../../components/KafrawyLayout';

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
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 pt-8">
          {/* Header */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900">الوظائف</h1>
                <p className="text-slate-500">ابحث عن فرص عمل في كفر البطيخ</p>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Link 
                  to="/services"
                  className="flex-1 md:flex-none bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all border border-blue-100"
                >
                  <Wrench className="w-5 h-5" />
                  <span>الخدمات</span>
                </Link>
                <button 
                  onClick={() => navigate('/services/jobs/applications')}
                  className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-5 h-5" />
                  <span>الطلبات</span>
                </button>
                <button 
                  onClick={() => navigate('/services/jobs/create')}
                  className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>إضافة وظيفة</span>
                </button>
              </div>
            </div>
            
            <div className="relative">
              <Search className="w-6 h-6 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="ابحث عن وظيفة أو شركة..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-12 pl-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-24">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500 font-bold">جاري تحميل الوظائف...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                  <motion.div 
                    key={job.id} 
                    whileHover={{ y: -5 }}
                    onClick={() => navigate(`/services/jobs/${job.id}`)}
                    className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{job.title}</h2>
                        <div className="flex items-center gap-2 text-slate-500 mt-1">
                          <Building2 className="w-4 h-4" />
                          <span className="font-bold truncate">{job.company}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            <Clock className="w-4 h-4 text-orange-500" />
                            {job.type}
                          </div>
                          {job.salary_range && (
                            <div className="flex items-center gap-1.5 text-sm font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                              {job.salary_range}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {(filteredJobs?.length || 0) === 0 && (
                  <div className="col-span-full bg-white border border-dashed border-slate-200 rounded-[2rem] py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد وظائف</h3>
                    <p className="text-slate-500">لم نجد أي وظائف تطابق بحثك حالياً.</p>
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
