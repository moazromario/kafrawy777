"use client";
import React, { useState, useEffect } from 'react';
import MainLayout from './MainLayout';
import PostCard from './PostCard';
import { 
  Camera, Edit2, MoreHorizontal, PlusSquare, FileText, Upload, 
  Loader2, CheckCircle2, MapPin, GraduationCap, Calendar, 
  Users, Briefcase, ShoppingBag, Grid, X, Save, LogOut, Info,
  List, Heart, MessageCircle, Search, Filter, Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
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
  const [activeTab, setActiveTab] = useState<'posts' | 'friends' | 'products' | 'jobs' | 'bookings'>('posts');
  const [postViewMode, setPostViewMode] = useState<'grid' | 'list'>('grid');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Tab data
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [userJobs, setUserJobs] = useState<any[]>([]);
  const [userFriends, setUserFriends] = useState<any[]>([]);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  
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
      const [prof, posts, products, jobs, friends, bookings] = await Promise.all([
        fetchProfile(user.id),
        fetchUserPosts(user.id),
        fetchUserProducts(user.id),
        fetchUserJobs(user.id),
        fetchUserFriends(user.id),
        supabase.from('bookings').select('*, booking_items(*)').eq('user_id', user.id)
      ]);
      
      setProfile(prof);
      setUserPosts(posts || []);
      setUserProducts(products || []);
      setUserJobs(jobs || []);
      setUserFriends(friends || []);
      setUserBookings(bookings.data || []);
      
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
      <div className="w-full pb-20 md:pb-10" dir="rtl">
        {/* Profile Header Card */}
        <div className="bg-white shadow-sm md:rounded-3xl overflow-hidden mb-6 border-b md:border border-slate-200">
          {/* Cover Photo */}
          <div className="relative h-48 md:h-[350px] bg-slate-200 group">
            <img 
              src={profile?.cover_url || "https://picsum.photos/seed/cover/1920/600"} 
              alt="Cover" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
              <label className="cursor-pointer bg-white/90 hover:bg-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 text-sm font-black text-slate-900 transition-all transform scale-90 group-hover:scale-100 hover:scale-105 active:scale-95">
                <Camera className="w-5 h-5" />
                تغيير غلاف الصفحة
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} />
              </label>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="px-4 md:px-10 pb-8 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-24 mb-8">
              {/* Avatar Container */}
              <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-[6px] border-white bg-slate-100 overflow-hidden shadow-2xl mx-auto md:mx-0 group ring-1 ring-slate-200">
                <img 
                  src={profile?.avatar_url || "https://picsum.photos/seed/avatar/400/400"} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <label className="cursor-pointer p-4 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all transform scale-90 group-hover:scale-100 hover:scale-110 active:scale-90">
                    <Camera className="w-7 h-7" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
                  </label>
                </div>
              </div>

              {/* Name & Bio & Stats */}
              <div className="flex-1 text-center md:text-right">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">{profile?.full_name}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500 font-bold">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        انضم {new Date(profile?.created_at).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        <MapPin className="w-4 h-4 text-red-500" />
                        القاهرة، مصر
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-200 transition-all active:scale-95 hover:-translate-y-0.5"
                    >
                      <Edit2 className="w-5 h-5" />
                      تعديل الملف
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <LogOut className="w-5 h-5" />
                      خروج
                    </button>
                  </div>
                </div>

                <p className="text-slate-600 text-lg max-w-3xl leading-relaxed font-medium">
                  {profile?.bio || "لا يوجد نبذة شخصية بعد. أضف نبذة لتعريف الناس بك وبمهاراتك."}
                </p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex border-t border-slate-100 pt-8 gap-8 md:gap-16 overflow-x-auto hide-scrollbar">
              <div className="text-center group cursor-pointer">
                <p className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{userPosts?.length || 0}</p>
                <p className="text-xs text-slate-400 font-black uppercase tracking-wider">منشور</p>
              </div>
              <div className="text-center group cursor-pointer">
                <p className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{userFriends?.length || 0}</p>
                <p className="text-xs text-slate-400 font-black uppercase tracking-wider">صديق</p>
              </div>
              <div className="text-center group cursor-pointer">
                <p className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{userProducts?.length || 0}</p>
                <p className="text-xs text-slate-400 font-black uppercase tracking-wider">منتج</p>
              </div>
              <div className="text-center group cursor-pointer">
                <p className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{userJobs?.length || 0}</p>
                <p className="text-xs text-slate-400 font-black uppercase tracking-wider">وظيفة</p>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="px-4 md:px-10 border-t border-slate-100 bg-slate-50/30 flex gap-1 md:gap-4 overflow-x-auto hide-scrollbar">
            {[
              { id: 'posts', label: 'المنشورات', icon: Grid },
              { id: 'friends', label: 'الأصدقاء', icon: Users },
              { id: 'products', label: 'السوق', icon: ShoppingBag },
              { id: 'jobs', label: 'الوظائف', icon: Briefcase },
              { id: 'bookings', label: 'حجوزاتي', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-5 px-6 font-black text-sm transition-all border-b-4 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'text-blue-600 border-blue-600 bg-blue-50/50' 
                    : 'text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'fill-blue-100' : ''}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area - Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Left Column (Desktop) */}
          <div className="lg:col-span-4 space-y-8">
            {/* About Card */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <h2 className="font-black text-xl mb-6 text-slate-900 flex items-center gap-3">
                <Info className="w-6 h-6 text-blue-600" />
                المعلومات الشخصية
              </h2>
              <div className="space-y-5">
                <div className="flex items-center gap-4 text-slate-700 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">التعليم</p>
                    <p className="text-sm font-black">جامعة التكنولوجيا والعلوم</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-700 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">الموقع</p>
                    <p className="text-sm font-black">القاهرة، مصر</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-700 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">العمل</p>
                    <p className="text-sm font-black">مطور واجهات أمامية</p>
                  </div>
                </div>
                <Link to="/services" className="flex items-center gap-4 text-slate-700 p-3 rounded-2xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">الخدمات</p>
                    <p className="text-sm font-black text-blue-600">استكشف دليل الخدمات</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* CV Card */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <h2 className="font-black text-xl mb-6 text-slate-900 flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                السيرة الذاتية
              </h2>
              {profile?.cv_url ? (
                <div className="group relative overflow-hidden rounded-2xl border-2 border-blue-100 bg-blue-50/30 p-6 transition-all hover:shadow-xl hover:shadow-blue-100">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-200">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-blue-900 text-lg">CV جاهز للإرسال</p>
                      <div className="flex gap-4 mt-2">
                        <a 
                          href={profile.cv_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm font-black hover:underline inline-flex items-center gap-1"
                        >
                          عرض الملف
                        </a>
                        <label className="text-slate-500 text-sm font-black hover:text-blue-600 cursor-pointer transition-colors">
                          تحديث
                          <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'cv')} disabled={uploading} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 text-center group hover:border-blue-400 transition-colors">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-slate-300 mb-6 shadow-sm group-hover:text-blue-400 transition-colors">
                    <FileText className="w-10 h-10" />
                  </div>
                  <p className="text-slate-500 font-black mb-6">ارفع سيرتك الذاتية لزيادة فرص توظيفك</p>
                  <label className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black cursor-pointer transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
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
                    className={`mt-6 flex items-center gap-3 p-4 rounded-2xl font-black text-sm shadow-sm ${
                      message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                    }`}
                  >
                    {message.type === 'error' ? <X className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Main Content - Right Column (Desktop) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-6"
              >
                {activeTab === 'posts' && (
                  <div className="space-y-8">
                    {/* Create Post Entry */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6 hover:shadow-xl hover:shadow-slate-100 transition-all group">
                      <div className="relative">
                        <img 
                          src={profile?.avatar_url || "https://picsum.photos/seed/user/100/100"} 
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" 
                          alt="" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <button 
                        onClick={() => navigate('/community')}
                        className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500 text-right px-8 py-4 rounded-2xl font-black transition-all border border-slate-100 group-hover:border-blue-100"
                      >
                        بماذا تفكر يا {profile?.full_name?.split(' ')[0]}؟
                      </button>
                      <button className="p-4 text-blue-600 hover:bg-blue-50 rounded-2xl transition-all active:scale-90">
                        <Camera className="w-7 h-7" />
                      </button>
                    </div>

                    {/* View Toggle & Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">المنشورات</h3>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1 md:w-64">
                          <input 
                            type="text" 
                            placeholder="بحث..." 
                            className="w-full bg-slate-100 border-none rounded-xl px-10 py-2.5 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm"
                          />
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>

                        <button className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-slate-600 border border-slate-200">
                          <Filter className="w-5 h-5" />
                        </button>

                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                          <button 
                            onClick={() => setPostViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${postViewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            <Grid className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setPostViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${postViewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            <List className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {(userPosts?.length || 0) > 0 ? (
                      postViewMode === 'list' ? (
                        <div className="space-y-8">
                          {userPosts.map(post => (
                            <PostCard key={post.id} post={post} />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                          {userPosts.map(post => (
                            <div 
                              key={post.id} 
                              className="aspect-square relative group cursor-pointer overflow-hidden rounded-[2.5rem] bg-slate-100 border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500"
                            >
                              {post.image ? (
                                <img 
                                  src={post.image} 
                                  alt="" 
                                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full p-8 flex items-center justify-center text-center text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100">
                                  <p className="text-sm font-black line-clamp-5 leading-relaxed text-slate-600">{post.content}</p>
                                </div>
                              )}
                              {/* Overlay on hover */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-8 text-white backdrop-blur-[4px]">
                                <div className="flex flex-col items-center gap-2 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 ease-out">
                                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-1">
                                    <Heart className="w-6 h-6 fill-white" />
                                  </div>
                                  <span className="font-black text-xl">{post.likes || 0}</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 ease-out delay-75">
                                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-1">
                                    <MessageCircle className="w-6 h-6 fill-white" />
                                  </div>
                                  <span className="font-black text-xl">{post.comments?.length || 0}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="bg-white p-24 rounded-[3rem] border border-slate-200 text-center shadow-sm">
                        <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                          <PlusSquare className="w-16 h-16 text-slate-200" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-4">لا توجد منشورات</h3>
                        <p className="text-slate-500 text-lg font-bold max-w-md mx-auto leading-relaxed">شارك أول منشور لك الآن ودع العالم يراك ويتفاعل مع إبداعاتك</p>
                        <button 
                          onClick={() => navigate('/community')}
                          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 transition-all active:scale-95"
                        >
                          أنشئ منشورك الأول
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'friends' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {(userFriends?.length || 0) > 0 ? (
                      userFriends.map(friendship => {
                        const friend = friendship.user_id === user?.id ? friendship.friend : friendship.user;
                        return (
                          <div key={friendship.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-5 hover:shadow-xl hover:shadow-slate-100 transition-all group">
                            <div className="relative">
                              <img 
                                src={friend?.avatar_url || "https://picsum.photos/seed/user/100/100"} 
                                className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm" 
                                alt={friend?.full_name} 
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="flex-1 min-w-0 text-right">
                              <h4 className="font-black text-slate-900 truncate text-lg group-hover:text-blue-600 transition-colors">{friend?.full_name}</h4>
                              <p className="text-sm text-slate-500 truncate font-medium">{friend?.bio || 'لا يوجد نبذة'}</p>
                            </div>
                            <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                              <MoreHorizontal className="w-6 h-6" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full bg-white p-20 rounded-[2.5rem] border border-slate-200 text-center shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Users className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">قائمة الأصدقاء فارغة</h3>
                        <p className="text-slate-500 font-medium">ابدأ بتكوين صداقات جديدة في مجتمع كفراوي</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'products' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {(userProducts?.length || 0) > 0 ? (
                      userProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all group cursor-pointer">
                          <div className="h-56 bg-slate-100 overflow-hidden relative">
                            <img 
                              src={product.image_url || "https://picsum.photos/seed/product/600/400"} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                              alt={product.title} 
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl font-black text-blue-600 shadow-xl">
                              {product.price} ج.م
                            </div>
                          </div>
                          <div className="p-6">
                            <h4 className="font-black text-slate-900 text-xl mb-2 group-hover:text-blue-600 transition-colors">{product.title}</h4>
                            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                              <MapPin className="w-4 h-4" />
                              {product.location}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full bg-white p-20 rounded-[2.5rem] border border-slate-200 text-center shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <ShoppingBag className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">لا توجد منتجات معروضة</h3>
                        <p className="text-slate-500 font-medium">حول أغراضك القديمة إلى نقود، اعرضها الآن في السوق</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'jobs' && (
                  <div className="space-y-6">
                    {(userJobs?.length || 0) > 0 ? (
                      userJobs.map(job => (
                        <div key={job.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:shadow-xl hover:shadow-blue-50 transition-all group cursor-pointer">
                          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <div className="flex items-center gap-5">
                              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                <Briefcase className="w-8 h-8" />
                              </div>
                              <div>
                                <h4 className="font-black text-xl text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h4>
                                <p className="text-blue-600 font-black text-base">{job.company}</p>
                              </div>
                            </div>
                            <span className="bg-blue-50 text-blue-600 text-xs font-black px-5 py-2 rounded-full uppercase tracking-widest">{job.type}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 font-bold border-t border-slate-50 pt-6">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-red-500" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-blue-500" />
                              نشر في {new Date(job.created_at).toLocaleDateString('ar-EG')}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white p-20 rounded-[2.5rem] border border-slate-200 text-center shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Briefcase className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">لم تنشر أي وظائف</h3>
                        <p className="text-slate-500 font-medium">هل تبحث عن موظفين؟ ابدأ بنشر إعلان وظيفي الآن</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'bookings' && (
                  <div className="space-y-6">
                    {(userBookings?.length || 0) > 0 ? (
                      userBookings.map(booking => (
                        <div key={booking.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                              <Calendar className="w-8 h-8" />
                            </div>
                            <div>
                              <h4 className="font-black text-lg text-slate-900">{booking.booking_items?.title}</h4>
                              <p className="text-slate-500 text-sm font-bold">
                                {new Date(booking.start_date).toLocaleDateString('ar-EG')}
                                {booking.end_date && ` - ${new Date(booking.end_date).toLocaleDateString('ar-EG')}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-blue-600 font-black">{booking.total_price} ج.م</div>
                              <div className={`text-xs font-black px-3 py-1 rounded-full ${
                                booking.status === 'confirmed' ? 'bg-green-50 text-green-600' : 
                                booking.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                              }`}>
                                {booking.status === 'confirmed' ? 'مؤكد' : booking.status === 'pending' ? 'قيد الانتظار' : 'ملغي'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white p-20 rounded-[2.5rem] border border-slate-200 text-center shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Calendar className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">لا توجد حجوزات</h3>
                        <p className="text-slate-500 font-medium">ابدأ بحجز خدماتك المفضلة الآن</p>
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
