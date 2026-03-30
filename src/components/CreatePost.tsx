"use client";
import React, { useState, useRef } from 'react';
import { Image, Video, Smile, Send, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import { uploadMedia } from '../lib/api';

export default function CreatePost() {
  const { user } = useAuth();
  const { addPost, setError } = useCommunity();
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

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
      
      await addPost(content, imageUrl);
      
      setContent('');
      clearFile();
    } catch (error: any) {
      setError(`خطأ في رفع الملف: ${error?.message || 'تأكد من إعداد Storage في Supabase'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-4 shadow-sm md:rounded-lg mb-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 mb-4">
          <img src="https://picsum.photos/seed/user/100/100" alt="User" className="w-10 h-10 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
          <div className="flex-1 flex items-center bg-slate-100 rounded-full px-4 py-1">
            <input 
              type="text" 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${firstName}?`} 
              className="bg-transparent border-none focus:outline-none w-full text-slate-700 py-1"
              disabled={isUploading}
            />
            <button 
              type="submit" 
              disabled={(!content.trim() && !selectedFile) || isUploading} 
              className="text-blue-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {previewUrl && (
          <div className="relative mb-4 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
            <button 
              type="button"
              onClick={clearFile}
              className="absolute top-2 right-2 bg-slate-900/50 text-white p-1 rounded-full hover:bg-slate-900/70 transition-colors z-10"
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
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 flex-1 hover:bg-slate-50 py-2 rounded-lg transition-colors"
          disabled={isUploading}
        >
          <Video className="w-6 h-6 text-red-500" />
          <span className="text-sm font-semibold text-slate-600 hidden sm:inline">Live Video</span>
          <span className="text-sm font-semibold text-slate-600 sm:hidden">Live</span>
        </button>
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 flex-1 hover:bg-slate-50 py-2 rounded-lg transition-colors"
          disabled={isUploading}
        >
          <Image className="w-6 h-6 text-green-500" />
          <span className="text-sm font-semibold text-slate-600 hidden sm:inline">Photo/Video</span>
          <span className="text-sm font-semibold text-slate-600 sm:hidden">Photo</span>
        </button>
        <button 
          type="button"
          className="flex items-center justify-center gap-2 flex-1 hover:bg-slate-50 py-2 rounded-lg transition-colors"
          disabled={isUploading}
        >
          <Smile className="w-6 h-6 text-yellow-500" />
          <span className="text-sm font-semibold text-slate-600 hidden sm:inline">Feeling/Activity</span>
          <span className="text-sm font-semibold text-slate-600 sm:hidden">Feeling</span>
        </button>
      </div>
    </div>
  );
}
