import React from 'react';
import { getSupabase } from '../lib/supabase';
import { AlertTriangle, Settings, ExternalLink } from 'lucide-react';

export default function SetupGuard({ children }: { children: React.ReactNode }) {
  const supabase = getSupabase();

  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 mb-4">إعداد قاعدة البيانات مطلوب</h1>
          
          <p className="text-slate-600 mb-8 leading-relaxed">
            يبدو أن إعدادات قاعدة البيانات (Supabase) مفقودة. لتشغيل التطبيق، يرجى إضافة المتغيرات التالية في إعدادات المنصة:
          </p>

          <div className="space-y-3 mb-8 text-right">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-sm">
              <span className="text-blue-600 font-bold">VITE_SUPABASE_URL</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-sm">
              <span className="text-blue-600 font-bold">VITE_SUPABASE_ANON_KEY</span>
            </div>
          </div>

          <div className="space-y-4">
            <a 
              href="https://supabase.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              فتح Supabase
            </a>
            
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
              إعادة تحميل بعد الضبط
            </button>
          </div>

          <p className="mt-8 text-xs text-slate-400">
            بمجرد إضافة هذه القيم في إعدادات المنصة (Settings)، سيتم تفعيل التطبيق تلقائياً.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
