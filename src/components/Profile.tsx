"use client";
import React, { useState, useEffect } from 'react';
import MainLayout from './MainLayout';
import PostCard from './PostCard';
import { 
  Camera, Edit2, MoreHorizontal, PlusSquare, FileText, Upload, 
  Loader2, CheckCircle2, MapPin, GraduationCap, Calendar, 
  Users, Briefcase, ShoppingBag, Grid, X, Save, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  fetchProfile, updateProfile, uploadMedia, 
  fetchUserPosts, fetchUserProducts, fetchUserJobs, fetchUserFriends 
} from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'friends' | 'products' | 'jobs'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Tab data
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [userJobs, setUserJobs] = useState<any[]>([]);
  const [userFriends, setUserFriends] = useState<any[]>([]);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    avatar_url: '',
    cover_url: ''
  });

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [prof, posts, products, jobs, friends] = await Promise.all([
        fetchProfile(user.id),
        fetchUserPosts(user.id),
        fetchUserProducts(user.id),
        fetchUserJobs(user.id),
        fetchUserFriends(user.id)
      ]);
      
      setProfile(prof);
      setUserPosts(posts || []);
      setUserProducts(products || []);
      setUserJobs(jobs || []);
      setUserFriends(friends || []);
      
      setEditForm({
        full_name: prof?.full_name || '',
        bio: prof?.bio || '',
        avatar_url: prof?.avatar_url || '',
        cover_url: prof?.cover_url || ''
      });
    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      setMessage(null);
      const url = await uploadMedia(file);
      
      const updateData: any = {};
      if (type === 'cv') updateData.cv_url = url;
      if (type === 'avatar') updateData.avatar_url = url;
      if (type === 'cover') updateData.cover_url = url;
      
      await updateProfile(user.id, updateData);
      setProfile({ ...profile, ...updateData });
      
      if (type === 'avatar' || type === 'cover') {
        setEditForm(prev => ({ ...prev, ...updateData }));
      }
      
      setMessage({ text: 'تم التحديث بنجاح', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setMessage({ text: `خطأ: ${err.message}`, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setUploading(true);
      await updateProfile(user.id, editForm);
      setProfile({ ...profile, ...editForm });
      setIsEditModalOpen(false);
      setMessage({ text: 'تم تحديث الملف الشخصي بنجاح', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setMessage({ text: `خطأ: ${err.message}`, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-0 md:px-4 py-0 md:py-6" dir="rtl">
        {/* Profile Header Card */}
        <div className="bg-white shadow-sm md:rounded-2xl overflow-hidden mb-6 border-b md:border border-slate-200">
          {/* Cover Photo */}
          <div className="relative h-48 md:h-80 bg-slate-100 group">
            <img 
              src={profile?.cover_url || "https://picsum.photos/seed/cover/1200/400"} 
              alt="Cover" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="cursor-pointer bg-white/90 hover:bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold text-slate-900 transition-all transform scale-90 group-hover:scale-100">
                <Camera className="w-5 h-5" />
                تغيير الغلاف
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} />
              </label>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="px-4 md:px-8 pb-6 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20 mb-6">
              {/* Avatar */}
              <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white bg-white overflow-hidden shadow-xl mx-auto md:mx-0 group">
                <img 
                  src={profile?.avatar_url || "https://picsum.photos/seed/user/200/200"} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer p-3 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors">
                    <Camera className="w-6 h-6" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
                  </label>
                </div>
              </div>

              {/* Name & Bio */}
              <div className="flex-1 text-center md:text-right">
                <h1 className="text-3xl font-black text-slate-900 mb-1">{profile?.full_name}</h1>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto md:mx-0 leading-relaxed">
                  {profile?.bio || "لا يوجد نبذة شخصية بعد. أضف نبذة لتعريف الناس بك."}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    انضم في {new Date(profile?.created_at).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    القاهرة، مصر
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all active:scale-95"
                >
                  <Edit2 className="w-5 h-5" />
                  تعديل الملف
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <LogOut className="w-5 h-5" />
                  تسجيل الخروج
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex border-t border-slate-100 pt-6 gap-8 md:gap-12 overflow-x-auto hide-scrollbar">
              <div className="text-center">
                <p className="text-xl font-black text-slate-900">{userPosts?.length || 0}</p>
                <p className="text-sm text-slate-500 font-bold">منشور</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-slate-900">{userFriends?.length || 0}</p>
                <p className="text-sm text-slate-500 font-bold">صديق</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-slate-900">{userProducts?.length || 0}</p>
                <p className="text-sm text-slate-500 font-bold">منتج</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-slate-900">{userJobs?.length || 0}</p>
                <p className="text-sm text-slate-500 font-bold">وظيفة</p>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="px-4 md:px-8 border-t border-slate-100 bg-slate-50/50 flex gap-2">
            {[
              { id: 'posts', label: 'المنشورات', icon: Grid },
              { id: 'friends', label: 'الأصدقاء', icon: Users },
              { id: 'products', label: 'السوق', icon: ShoppingBag },
              { id: 'jobs', label: 'الوظائف', icon: Briefcase },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-4 font-bold text-sm transition-all border-b-2 ${
                  activeTab === tab.id 
                    ? 'text-blue-600 border-blue-600 bg-blue-50/50' 
                    : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Info & CV */}
          <div className="w-full lg:w-1/3 space-y-6">
            {/* About Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="font-black text-lg mb-5 text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                نبذة شخصية
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium">درس في <span className="font-bold">جامعة التكنولوجيا</span></p>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium">يقيم في <span className="font-bold">القاهرة، مصر</span></p>
                </div>
              </div>
            </div>

            {/* CV Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="font-black text-lg mb-5 text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                السيرة الذاتية
              </h2>
              {profile?.cv_url ? (
                <div className="group relative overflow-hidden rounded-xl border border-blue-100 bg-blue-50/50 p-4 transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-blue-900 text-sm">السيرة الذاتية جاهزة</p>
                      <a 
                        href={profile.cv_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 text-xs font-bold hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        عرض الملف
                        <X className="w-3 h-3 rotate-45" />
                      </a>
                    </div>
                  </div>
                  <label className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-white border border-blue-200 rounded-lg text-blue-600 text-sm font-bold cursor-pointer hover:bg-blue-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    تحديث الملف
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'cv')} disabled={uploading} />
                  </label>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                    <FileText className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500 text-sm font-bold mb-4">لم ترفع سيرتك الذاتية بعد</p>
                  <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all shadow-lg shadow-blue-100 flex items-center gap-2 active:scale-95">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    رفع السيرة الذاتية
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'cv')} disabled={uploading} />
                  </label>
                </div>
              )}
              
              <AnimatePresence>
                {message && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`mt-4 flex items-center gap-2 text-sm p-3 rounded-xl font-bold ${
                      message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                    }`}
                  >
                    {message.type === 'error' ? <X className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Content Area */}
          <div className="w-full lg:w-2/3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {activeTab === 'posts' && (
                  <>
                    {(userPosts?.length || 0) > 0 ? (
                      userPosts.map(post => (
                        <PostCard key={post.id} post={post} />
                      ))
                    ) : (
                      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                        <PlusSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد منشورات</h3>
                        <p className="text-slate-500">ابدأ بمشاركة أفكارك مع المجتمع</p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'friends' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(userFriends?.length || 0) > 0 ? (
                      userFriends.map(friendship => {
                        const friend = friendship.user_id === user?.id ? friendship.friend : friendship.user;
                        return (
                          <div key={friendship.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <img src={friend?.avatar_url || "https://picsum.photos/seed/user/100/100"} className="w-14 h-14 rounded-full object-cover" alt={friend?.full_name} />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 truncate">{friend?.full_name}</h4>
                              <p className="text-xs text-slate-500 truncate">{friend?.bio || 'لا يوجد نبذة'}</p>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center">
                        <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">لا يوجد أصدقاء بعد</h3>
                        <p className="text-slate-500">تواصل مع الآخرين لبناء مجتمعك</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'products' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(userProducts?.length || 0) > 0 ? (
                      userProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                          <div className="h-40 bg-slate-100 overflow-hidden">
                            <img src={product.image_url || "https://picsum.photos/seed/product/400/300"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.title} />
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-slate-900 mb-1">{product.title}</h4>
                            <p className="text-blue-600 font-black text-lg">{product.price} ج.م</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center">
                        <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد منتجات</h3>
                        <p className="text-slate-500">اعرض منتجاتك للبيع في السوق</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'jobs' && (
                  <div className="space-y-4">
                    {(userJobs?.length || 0) > 0 ? (
                      userJobs.map(job => (
                        <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-lg text-slate-900">{job.title}</h4>
                              <p className="text-blue-600 font-bold text-sm">{job.company}</p>
                            </div>
                            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">{job.type}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(job.created_at).toLocaleDateString('ar-EG')}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                        <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد وظائف معلنة</h3>
                        <p className="text-slate-500">أعلن عن وظائف شاغرة لجذب المواهب</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
              dir="rtl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-900">تعديل الملف الشخصي</h2>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700">الاسم الكامل</label>
                  <input 
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700">النبذة الشخصية</label>
                  <textarea 
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium min-h-[120px] resize-none"
                    placeholder="أخبر الناس عن نفسك..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    حفظ التغييرات
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-black transition-all active:scale-95"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
