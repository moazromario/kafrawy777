import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Clock, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Jobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('*, profiles(full_name, avatar_url)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
    } else if (data) {
      setJobs(data);
    }
    setLoading(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white min-h-screen md:rounded-lg md:shadow-sm md:mt-2 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <h1 className="text-2xl font-bold mb-2">وظائف كفراوي</h1>
        <p className="text-blue-100 text-sm mb-4">ابحث عن وظيفتك القادمة في محافظتك</p>
        
        <div className="relative">
          <Search className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="ابحث عن المسمى الوظيفي أو الشركة..." 
            className="w-full bg-white text-slate-900 rounded-lg py-3 pr-10 pl-4 outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Jobs List */}
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold text-slate-900">أحدث الوظائف</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            لا توجد وظائف متاحة حالياً.
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer bg-white">
              <div className="flex gap-4 items-start">
                <img 
                  src={job.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${job.company}&background=random`} 
                  alt={job.company} 
                  className="w-14 h-14 rounded-lg object-cover border border-slate-100" 
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900">{job.title}</h3>
                  <p className="text-blue-600 font-medium text-sm mb-2">{job.company}</p>
                  
                  <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-500 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.type}</span>
                    </div>
                    {job.salary_range && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{job.salary_range}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(job.created_at)}
                    </span>
                    <button className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                      تقديم الآن
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
