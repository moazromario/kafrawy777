import React, { useRef, useState, useMemo } from 'react';
import { useCommunity, Story } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { uploadMedia } from '../lib/api';
import { Loader2, Plus, Video, Radio, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StoryViewer from './StoryViewer';
import LiveStreamView from './LiveStreamView';

export default function Stories() {
  const { stories, addStory, liveStreams, startLive, setError, showLiveModal, setShowLiveModal } = useCommunity();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [activeLiveId, setActiveLiveId] = useState<string | null>(null);
  const [isStartingLive, setIsStartingLive] = useState(false);
  const [liveTitle, setLiveTitle] = useState('');

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

  const handleStartLive = async () => {
    if (!liveTitle.trim()) return;
    setIsStartingLive(true);
    try {
      const streamId = await startLive(liveTitle);
      setActiveLiveId(streamId);
      setShowLiveModal(false);
      setLiveTitle('');
    } catch (err: any) {
      setError(`خطأ في بدء البث: ${err?.message || 'حدث خطأ'}`);
    } finally {
      setIsStartingLive(false);
    }
  };

  const isVideo = (url?: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('.mp4') || url.includes('.webm');
  };

  // Group stories by user for display, but keep flat for viewer
  const groupedStories = useMemo(() => {
    const groups: Record<string, Story[]> = {};
    stories.forEach(story => {
      if (!groups[story.userId]) {
        groups[story.userId] = [];
      }
      groups[story.userId].push(story);
    });
    return Object.values(groups);
  }, [stories]);

  const handleStoryClick = (storyId: string) => {
    const index = stories.findIndex(s => s.id === storyId);
    if (index !== -1) {
      setSelectedStoryIndex(index);
    }
  };

  return (
    <div className="bg-white p-4 shadow-sm md:rounded-lg mb-4 overflow-x-auto hide-scrollbar" dir="rtl">
      <input 
        type="file" 
        accept="image/*,video/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      
      <div className="flex gap-2 min-w-max">
        {/* Go Live Card */}
        <div 
          onClick={() => setShowLiveModal(true)}
          className="relative w-28 h-48 md:w-32 md:h-52 rounded-xl overflow-hidden cursor-pointer flex-shrink-0 bg-gradient-to-br from-red-500 to-pink-600 group shadow-sm border border-red-400 flex flex-col items-center justify-center text-white gap-2"
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Video className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold">بث مباشر</span>
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-[8px] font-bold uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* Your Story Card (Facebook Style) */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative w-28 h-48 md:w-32 md:h-52 rounded-xl overflow-hidden cursor-pointer flex-shrink-0 bg-slate-100 border border-slate-200 group shadow-sm"
        >
          <div className="h-3/4 w-full overflow-hidden">
            <img 
              src={user?.user_metadata?.avatar_url || 'https://picsum.photos/seed/user/200/300'} 
              alt="Your Story" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-white flex flex-col items-center justify-end pb-2">
            <div className="absolute -top-5 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-transform group-hover:scale-110">
              {isUploading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Plus className="w-6 h-6 text-white" />
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-800">إنشاء قصة</span>
          </div>
        </div>

        {/* Live Streams Cards */}
        {liveStreams.map((stream) => (
          <div 
            key={stream.id} 
            className="relative w-28 h-48 md:w-32 md:h-52 rounded-xl overflow-hidden cursor-pointer flex-shrink-0 group shadow-sm border-2 border-red-600"
            onClick={() => setActiveLiveId(stream.id)}
          >
            <img 
              src={stream.author_avatar} 
              alt={stream.author_name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 blur-[2px]" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                <img src={stream.author_avatar} alt={stream.author_name} className="w-full h-full object-cover" />
              </div>
              <div className="bg-red-600 text-white text-[8px] px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</div>
            </div>
            <span className="absolute bottom-3 right-3 left-3 text-white text-[11px] font-bold drop-shadow-md truncate text-right">
              {stream.author_name}
            </span>
          </div>
        ))}

        {/* Other Stories Cards (Facebook Style) */}
        {groupedStories.map((userStories) => {
          const latestStory = userStories[0];
          
          return (
            <div 
              key={latestStory.userId} 
              className="relative w-28 h-48 md:w-32 md:h-52 rounded-xl overflow-hidden cursor-pointer flex-shrink-0 group shadow-sm border border-slate-100"
              onClick={() => handleStoryClick(latestStory.id)}
            >
              {/* Background Image (Story Content) */}
              {isVideo(latestStory.image) ? (
                <video 
                  src={latestStory.image} 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 bg-black" 
                />
              ) : (
                <img 
                  src={latestStory.image} 
                  alt={latestStory.user} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  referrerPolicy="no-referrer" 
                />
              )}
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
              
              {/* User Avatar (Top Left) */}
              <div className="absolute top-3 right-3 w-10 h-10 rounded-full border-4 border-blue-600 overflow-hidden shadow-lg z-10">
                <img 
                  src={latestStory.avatar} 
                  alt={latestStory.user} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              
              {/* User Name (Bottom) */}
              <span className="absolute bottom-3 right-3 left-3 text-white text-[11px] font-bold drop-shadow-md truncate text-right">
                {latestStory.user}
              </span>
            </div>
          );
        })}
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {selectedStoryIndex !== null && (
          <StoryViewer 
            stories={stories} 
            initialStoryIndex={selectedStoryIndex} 
            onClose={() => setSelectedStoryIndex(null)} 
          />
        )}
      </AnimatePresence>

      {/* Live Stream View Modal */}
      <AnimatePresence>
        {activeLiveId && (
          <LiveStreamView 
            streamId={activeLiveId} 
            isStreamer={liveStreams.find(s => s.id === activeLiveId)?.user_id === user?.id}
            onClose={() => setActiveLiveId(null)} 
          />
        )}
      </AnimatePresence>

      {/* Start Live Modal */}
      <AnimatePresence>
        {showLiveModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-red-600 to-pink-600 text-white">
                <h3 className="text-xl font-bold">بدء بث مباشر جديد</h3>
                <button onClick={() => setShowLiveModal(false)} className="p-1 hover:bg-white/20 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <Radio className="w-10 h-10 animate-pulse" />
                  </div>
                  <p className="text-center text-slate-600 text-sm">
                    شارك لحظاتك مع أصدقائك في الوقت الحقيقي. سيتم إخطار متابعيك عند بدء البث.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">عنوان البث</label>
                  <input 
                    type="text" 
                    placeholder="ماذا تريد أن تسمي هذا البث؟"
                    className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-red-500 text-right"
                    value={liveTitle}
                    onChange={(e) => setLiveTitle(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleStartLive}
                  disabled={!liveTitle.trim() || isStartingLive}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isStartingLive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Radio className="w-5 h-5" />
                      بدء البث الآن
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
