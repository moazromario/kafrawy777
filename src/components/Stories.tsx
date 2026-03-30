import React, { useRef, useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { uploadMedia } from '../lib/api';
import { Loader2 } from 'lucide-react';

export default function Stories() {
  const { stories, addStory, setError } = useCommunity();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadMedia(file);
      await addStory(imageUrl);
    } catch (error: any) {
      setError(`خطأ في رفع القصة: ${error?.message || 'تأكد من إعداد Storage في Supabase'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isVideo = (url?: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('.mp4') || url.includes('.webm');
  };

  // Create a "Your Story" placeholder if the user hasn't posted one
  const hasUserStory = stories.some(s => s.isUser);
  const displayStories = [...stories];
  
  if (!hasUserStory && user) {
    displayStories.unshift({
      id: 'placeholder',
      user: 'Your Story',
      image: 'https://picsum.photos/seed/user/200/300',
      avatar: 'https://picsum.photos/seed/user/100/100',
      isUser: true
    });
  }

  return (
    <div className="bg-white p-4 shadow-sm md:rounded-lg mb-4 overflow-x-auto hide-scrollbar">
      <input 
        type="file" 
        accept="image/*,video/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      <div className="flex gap-2 min-w-max">
        {displayStories.map((story) => (
          <div 
            key={story.id} 
            onClick={() => story.isUser ? fileInputRef.current?.click() : null}
            className={`relative w-28 h-48 rounded-xl overflow-hidden group flex-shrink-0 bg-slate-200 shadow-sm border border-slate-100 ${story.isUser ? 'cursor-pointer' : ''}`}
          >
            {isVideo(story.image) ? (
              <video src={story.image} autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 bg-black" />
            ) : (
              <img src={story.image} alt={story.user} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" referrerPolicy="no-referrer" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
            
            {story.isUser && story.id === 'placeholder' ? (
              <div className="absolute bottom-0 left-0 right-0 bg-white pt-4 pb-2 flex flex-col items-center">
                <div className="absolute -top-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <span className="text-white text-xl leading-none font-bold mb-0.5">+</span>
                  )}
                </div>
                <span className="text-slate-900 text-xs font-semibold text-center mt-1">Create Story</span>
              </div>
            ) : (
              <>
                <div className="absolute top-3 left-3 w-10 h-10 rounded-full border-4 border-blue-600 overflow-hidden shadow-sm">
                  <img src={story.avatar} alt={story.user} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="absolute bottom-3 left-3 text-white text-sm font-semibold drop-shadow-md">{story.user}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
