import React from 'react';
import { MapPin, Briefcase, GraduationCap, Clock, Edit, Plus, Camera, MoreHorizontal } from 'lucide-react';

export default function Profile() {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white min-h-screen md:rounded-lg md:shadow-sm md:mt-2 overflow-hidden pb-20">
      {/* Cover Photo */}
      <div className="h-48 md:h-64 bg-slate-200 relative">
        <img 
          src="https://picsum.photos/seed/kafrcover/800/300" 
          alt="Cover" 
          className="w-full h-full object-cover" 
        />
        <button className="absolute bottom-3 left-3 bg-white/90 hover:bg-white text-slate-900 p-2 rounded-lg shadow-sm flex items-center gap-2 text-sm font-semibold transition-colors">
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">تعديل صورة الغلاف</span>
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-4 relative">
        <div className="absolute -top-16 right-4 p-1 bg-white rounded-full">
          <div className="relative">
            <img 
              src="https://ui-avatars.com/api/?name=Me&background=random" 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-white bg-slate-100" 
            />
            <button className="absolute bottom-1 left-1 bg-slate-200 hover:bg-slate-300 p-2 rounded-full border-2 border-white transition-colors">
              <Camera className="w-4 h-4 text-slate-900" />
            </button>
          </div>
        </div>
        
        <div className="pt-20 pb-4 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">مستخدم كفراوي</h1>
          <p className="text-slate-500 mt-1 text-lg">مطور برمجيات | مهتم بالتقنية وتطوير الويب 💻</p>
          
          <div className="flex gap-2 mt-5">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              إضافة قصة
            </button>
            <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Edit className="w-5 h-5" />
              تعديل الملف
            </button>
            <button className="w-10 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-2 rounded-lg flex items-center justify-center transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* About Details */}
        <div className="py-4 space-y-4 border-b border-slate-200">
          <h2 className="font-bold text-xl text-slate-900 mb-3">التفاصيل</h2>
          <div className="flex items-center gap-3 text-slate-700 text-lg">
            <Briefcase className="w-6 h-6 text-slate-400" />
            <span>يعمل في <strong>شركة كفراوي تك</strong></span>
          </div>
          <div className="flex items-center gap-3 text-slate-700 text-lg">
            <GraduationCap className="w-6 h-6 text-slate-400" />
            <span>درس في <strong>جامعة كفر الشيخ</strong></span>
          </div>
          <div className="flex items-center gap-3 text-slate-700 text-lg">
            <MapPin className="w-6 h-6 text-slate-400" />
            <span>يعيش في <strong>كفر الشيخ</strong></span>
          </div>
          <div className="flex items-center gap-3 text-slate-700 text-lg">
            <Clock className="w-6 h-6 text-slate-400" />
            <span>انضم في <strong>مارس 2024</strong></span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-2 overflow-x-auto hide-scrollbar">
          <button className="px-4 py-3 text-blue-600 font-bold border-b-2 border-blue-600 whitespace-nowrap">المنشورات</button>
          <button className="px-4 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg whitespace-nowrap">حول</button>
          <button className="px-4 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg whitespace-nowrap">الأصدقاء</button>
          <button className="px-4 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg whitespace-nowrap">الصور</button>
        </div>
      </div>

      {/* Empty State for Posts */}
      <div className="bg-slate-100 p-4 min-h-[300px]">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-slate-500">
          لا توجد منشورات لعرضها حالياً.
        </div>
      </div>
    </div>
  );
}
