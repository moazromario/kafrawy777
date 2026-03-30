"use client";
import React, { useState, useEffect } from 'react';
import MainLayout from './MainLayout';
import PostCard from './PostCard';
import { Camera, Edit2, MoreHorizontal, PlusSquare, FileText, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../context/CommunityContext';
import { fetchProfile, updateProfile, uploadMedia } from '../lib/api';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { posts } = useCommunity();
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await fetchProfile(user!.id);
      setProfile(data);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      setMessage(null);
      const url = await uploadMedia(file);
      await updateProfile(user.id, { cv_url: url });
      setProfile({ ...profile, cv_url: url });
      setMessage('تم رفع السيرة الذاتية بنجاح');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Error uploading CV:', err);
      setMessage(`خطأ: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'اسم المستخدم';
  const userPosts = posts.filter(p => p.user === userName);
  const displayPost = userPosts.length > 0 ? userPosts[0] : posts[0];

  return (
    <MainLayout>
      <div className="bg-white shadow-sm md:rounded-lg mb-4 overflow-hidden border-y border-slate-200 md:border-none" dir="rtl">
        {/* Cover Photo */}
        <div className="relative h-48 md:h-80 bg-slate-200">
          <img src="https://picsum.photos/seed/cover/1200/400" alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <button className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded-md shadow-sm flex items-center gap-2 text-sm font-semibold hover:bg-slate-50 transition-colors">
            <Camera className="w-5 h-5" />
            <span className="hidden md:inline">تعديل صورة الغلاف</span>
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-4 relative max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-8 mb-4">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white overflow-hidden z-10 shadow-sm">
              <img src="https://picsum.photos/seed/user/200/200" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button className="absolute bottom-2 left-2 bg-slate-200 p-2 rounded-full hover:bg-slate-300 transition-colors border-2 border-white">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 pt-2 md:pt-0 md:pb-4 text-center md:text-right">
              <h1 className="text-3xl font-bold text-slate-900">{userName}</h1>
              <p className="text-slate-500 font-semibold mt-1">1.2 ألف صديق</p>
              <div className="flex justify-center md:justify-start -space-x-2 mt-2">
                {[1,2,3,4,5].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/friend${i}/50/50`} className="w-8 h-8 rounded-full border-2 border-white" alt="Friend" referrerPolicy="no-referrer" />
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:pb-4 w-full md:w-auto mt-4 md:mt-0">
              <button className="flex-1 md:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                <PlusSquare className="w-5 h-5" />
                إضافة إلى القصة
              </button>
              <button className="flex-1 md:flex-none bg-slate-200 text-slate-900 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors">
                <Edit2 className="w-5 h-5" />
                تعديل الملف الشخصي
              </button>
              <button onClick={handleLogout} className="bg-slate-200 text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-1 flex gap-2 text-[15px] font-semibold text-slate-500 overflow-x-auto hide-scrollbar">
            <button className="text-blue-600 border-b-4 border-blue-600 py-4 px-4 whitespace-nowrap">المنشورات</button>
            <button className="hover:bg-slate-100 rounded-lg py-4 px-4 whitespace-nowrap transition-colors">حول</button>
            <button className="hover:bg-slate-100 rounded-lg py-4 px-4 whitespace-nowrap transition-colors">الأصدقاء</button>
            <button className="hover:bg-slate-100 rounded-lg py-4 px-4 whitespace-nowrap transition-colors">الصور</button>
            <button className="hover:bg-slate-100 rounded-lg py-4 px-4 whitespace-nowrap transition-colors">الفيديو</button>
          </div>
        </div>
      </div>

      {/* User Posts Content */}
      <div className="flex flex-col md:flex-row gap-4 max-w-5xl mx-auto" dir="rtl">
        <div className="hidden md:block w-2/5">
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <h2 className="font-bold text-xl mb-4 text-slate-900">نبذة</h2>
            <div className="space-y-4 text-[15px] text-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎓</span>
                <p>درس في <strong>جامعة التكنولوجيا</strong></p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">🏠</span>
                <p>يقيم في <strong>القاهرة، مصر</strong></p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <p>من <strong>الإسكندرية، مصر</strong></p>
              </div>
            </div>
            
            <hr className="my-6 border-slate-100" />
            
            <h2 className="font-bold text-xl mb-4 text-slate-900">السيرة الذاتية</h2>
            <div className="space-y-4">
              {profile?.cv_url ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-bold text-blue-900 text-sm">تم رفع السيرة الذاتية</p>
                      <a 
                        href={profile.cv_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 text-xs hover:underline"
                      >
                        عرض الملف
                      </a>
                    </div>
                  </div>
                  <label className="cursor-pointer p-2 hover:bg-blue-100 rounded-full transition-colors">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleCVUpload} disabled={uploading} />
                  </label>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <FileText className="w-12 h-12 text-slate-300 mb-2" />
                  <p className="text-slate-500 text-sm mb-4">لم يتم رفع سيرة ذاتية بعد</p>
                  <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors flex items-center gap-2">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>رفع السيرة الذاتية</span>
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleCVUpload} disabled={uploading} />
                  </label>
                </div>
              )}
              
              {message && (
                <div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${message.startsWith('خطأ') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {message.startsWith('خطأ') ? <MoreHorizontal className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full md:w-3/5">
          {displayPost && <PostCard post={displayPost} />}
        </div>
      </div>
    </MainLayout>
  );
}
