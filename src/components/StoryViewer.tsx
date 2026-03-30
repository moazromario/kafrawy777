import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Send, MessageCircle } from 'lucide-react';
import { Story, useCommunity } from '../context/CommunityContext';

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
}

export default function StoryViewer({ stories, initialStoryIndex, onClose }: StoryViewerProps) {
  const { addStoryComment } = useCommunity();
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const currentStory = stories[currentIndex];
  const duration = 5000; // 5 seconds per story

  const nextStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      setComment('');
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const prevStory = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      setComment('');
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused || showComments) return;

    const interval = 50;
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + (interval / duration) * 100;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, showComments, nextStory]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const currentComment = comment;
    setComment('');
    try {
      await addStoryComment(currentStory.id, currentComment);
    } catch (err) {
      setComment(currentComment);
    }
  };

  const isVideo = (url?: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('.mp4') || url.includes('.webm');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center select-none overflow-hidden" dir="rtl">
      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-1">
        {stories.map((_, index) => (
          <div key={index} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-50 ease-linear"
              style={{ 
                width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={currentStory.avatar} 
            alt={currentStory.user} 
            className="w-10 h-10 rounded-full border-2 border-white object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm drop-shadow-md">{currentStory.user}</span>
            <span className="text-white/70 text-xs drop-shadow-md">{currentStory.time}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isVideo(currentStory.image) && (
            <button onClick={() => setIsMuted(!isMuted)} className="text-white p-1">
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          )}
          <button onClick={onClose} className="text-white p-1">
            <X className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Navigation Areas */}
      {!showComments && (
        <div className="absolute inset-0 flex">
          <div 
            className="flex-1 h-full cursor-pointer z-20" 
            onClick={nextStory} // In RTL, left side is next
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          />
          <div 
            className="flex-1 h-full cursor-pointer z-20" 
            onClick={prevStory} // In RTL, right side is prev
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStory.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center justify-center max-w-lg"
        >
          {isVideo(currentStory.image) ? (
            <video 
              src={currentStory.image} 
              autoPlay 
              muted={isMuted} 
              playsInline 
              className="w-full h-full object-contain bg-black"
              onEnded={nextStory}
            />
          ) : (
            <img 
              src={currentStory.image} 
              alt={currentStory.user} 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Comments Overlay */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl z-50 max-h-[70vh] flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold">التعليقات ({currentStory.comments.length})</h3>
              <button onClick={() => setShowComments(false)} className="p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentStory.comments.length === 0 ? (
                <div className="text-center py-10 text-slate-400">لا توجد تعليقات بعد. كن أول من يعلق!</div>
              ) : (
                currentStory.comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <img src={c.avatar} alt={c.user} className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="bg-slate-100 p-2 rounded-2xl rounded-tr-none">
                        <div className="font-bold text-xs">{c.user}</div>
                        <div className="text-sm">{c.content}</div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 mr-2">{c.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Comment Input */}
      <div className="absolute bottom-6 left-4 right-4 z-40 flex items-center gap-3">
        <form onSubmit={handleSendComment} className="flex-1 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
          <input
            type="text"
            placeholder="رد على القصة..."
            className="flex-1 bg-transparent border-none text-white placeholder-white/60 focus:ring-0 text-sm py-1"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          />
          <button type="submit" className="text-white disabled:opacity-50" disabled={!comment.trim()}>
            <Send className="w-5 h-5" />
          </button>
        </form>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="relative p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white"
        >
          <MessageCircle className="w-6 h-6" />
          {currentStory.comments.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
              {currentStory.comments.length}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Navigation Buttons */}
      <div className="hidden md:flex absolute inset-x-0 top-1/2 -translate-y-1/2 justify-between px-4 pointer-events-none">
        <button 
          onClick={(e) => { e.stopPropagation(); prevStory(); }}
          className={`p-2 rounded-full bg-white/10 hover:bg-white/20 text-white pointer-events-auto transition-opacity ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <ChevronRight className="w-8 h-8" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); nextStory(); }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white pointer-events-auto"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
