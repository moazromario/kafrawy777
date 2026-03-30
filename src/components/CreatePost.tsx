"use client";
import React, { useState, useRef } from 'react';
import { Image, Video, Smile, Send, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import { uploadMedia } from '../lib/api';

export default function CreatePost() {
  const { user } = useAuth();
  const { addPost, setError, setShowLiveModal } = useCommunity();
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showFeelingModal, setShowFeelingModal] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<{ emoji: string, label: string } | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<{ emoji: string, label: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const feelings = [
    { emoji: '😊', label: 'سعيد' },
    { emoji: '🥰', label: 'محب' },
    { emoji: '😔', label: 'حزين' },
    { emoji: '🤩', label: 'متحمس' },
    { emoji: '😴', label: 'متعب' },
    { emoji: '🤔', label: 'يفكر' },
    { emoji: '😎', label: 'رائع' },
    { emoji: '😡', label: 'غاضب' },
  ];

  const activities = [
    { emoji: '🍴', label: 'يتناول الطعام' },
    { emoji: '✈️', label: 'يسافر إلى' },
    { emoji: '📺', label: 'يشاهد' },
    { emoji: '🎮', label: 'يلعب' },
    { emoji: '🎧', label: 'يستمع إلى' },
    { emoji: '📖', label: 'يقرأ' },
    { emoji: '🏃', label: 'يمارس الرياضة' },
    { emoji: '💼', label: 'يعمل' },
  ];

  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'مستخدم';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;
    
    setIsUploading(true);
    try {
      let imageUrl = undefined;
      if (selectedFile) {
        imageUrl = await uploadMedia(selectedFile);
      }
      
      await addPost(
        content, 
        imageUrl, 
        selectedFeeling ? `${selectedFeeling.emoji} ${selectedFeeling.label}` : undefined,
        selectedActivity ? `${selectedActivity.emoji} ${selectedActivity.label}` : undefined
      );
      
      setContent('');
      clearFile();
      setSelectedFeeling(null);
      setSelectedActivity(null);
    } catch (error: any) {
      setError(`خطأ في رفع الملف: ${error?.message || 'تأكد من إعداد Storage في Supabase'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-4 shadow-sm md:rounded-lg mb-4" dir="rtl">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 mb-4">
          <img src="https://picsum.photos/seed/user/100/100" alt="User" className="w-10 h-10 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
          <div className="flex-1 flex flex-col gap-1">
            {(selectedFeeling || selectedActivity) && (
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <span>— يشعر بـ</span>
                {selectedFeeling && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>{selectedFeeling.emoji}</span>
                    <span>{selectedFeeling.label}</span>
                    <button type="button" onClick={() => setSelectedFeeling(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                  </span>
                )}
                {selectedActivity && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>{selectedActivity.emoji}</span>
                    <span>{selectedActivity.label}</span>
                    <button type="button" onClick={() => setSelectedActivity(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center bg-slate-100 rounded-full px-4 py-1">
              <input 
                type="text" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`بم تفكر يا ${firstName}؟`} 
                className="bg-transparent border-none focus:outline-none w-full text-slate-700 py-1"
                disabled={isUploading}
              />
              <button 
                type="submit" 
                disabled={(!content.trim() && !selectedFile && !selectedFeeling && !selectedActivity) || isUploading} 
                className="text-blue-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center mr-2"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rotate-180" />}
              </button>
            </div>
          </div>
        </div>

        {previewUrl && (
          <div className="relative mb-4 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
            <button 
              type="button"
              onClick={clearFile}
              className="absolute top-2 left-2 bg-slate-900/50 text-white p-1 rounded-full hover:bg-slate-900/70 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            {selectedFile?.type.startsWith('video/') ? (
              <video src={previewUrl} controls className="w-full max-h-[400px] object-contain" />
            ) : (
              <img src={previewUrl} alt="Preview" className="w-full max-h-[400px] object-contain" />
            )}
          </div>
        )}
      </form>

      <div className="border-t border-slate-100 pt-3 flex justify-between">
        <input 
          type="file" 
          accept="image/*,video/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        <button 
          type="button"
          onClick={() => setShowLiveModal(true)}
          className="flex items-center justify-center gap-2 flex-1 hover:bg-slate-50 py-2 rounded-lg transition-colors"
          disabled={isUploading}
        >
          <Video className="w-6 h-6 text-red-500" />
          <span className="text-sm font-semibold text-slate-600 hidden sm:inline">بث مباشر</span>
          <span className="text-sm font-semibold text-slate-600 sm:hidden">مباشر</span>
        </button>
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 flex-1 hover:bg-slate-50 py-2 rounded-lg transition-colors"
          disabled={isUploading}
        >
          <Image className="w-6 h-6 text-green-500" />
          <span className="text-sm font-semibold text-slate-600 hidden sm:inline">صورة/فيديو</span>
          <span className="text-sm font-semibold text-slate-600 sm:hidden">صورة</span>
        </button>
        <button 
          type="button"
          onClick={() => setShowFeelingModal(true)}
          className="flex items-center justify-center gap-2 flex-1 hover:bg-slate-50 py-2 rounded-lg transition-colors"
          disabled={isUploading}
        >
          <Smile className="w-6 h-6 text-yellow-500" />
          <span className="text-sm font-semibold text-slate-600 hidden sm:inline">شعور/نشاط</span>
          <span className="text-sm font-semibold text-slate-600 sm:hidden">شعور</span>
        </button>
      </div>

      {showFeelingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">بم تشعر؟</h3>
              <button onClick={() => setShowFeelingModal(false)} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-500 mb-3">المشاعر</h4>
                <div className="grid grid-cols-2 gap-2">
                  {feelings.map((f, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setSelectedFeeling(f);
                        setShowFeelingModal(false);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors"
                    >
                      <span className="text-2xl">{f.emoji}</span>
                      <span className="text-sm font-medium">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500 mb-3">الأنشطة</h4>
                <div className="grid grid-cols-2 gap-2">
                  {activities.map((a, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setSelectedActivity(a);
                        setShowFeelingModal(false);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors"
                    >
                      <span className="text-2xl">{a.emoji}</span>
                      <span className="text-sm font-medium">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
