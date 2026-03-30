import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Send, Camera, CameraOff, Mic, MicOff, LogOut } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface LiveStreamViewProps {
  streamId: string;
  isStreamer: boolean;
  onClose: () => void;
}

export default function LiveStreamView({ streamId, isStreamer, onClose }: LiveStreamViewProps) {
  const { liveStreams, endLive, sendLiveMsg } = useCommunity();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stream = liveStreams.find(s => s.id === streamId);

  useEffect(() => {
    if (isStreamer && isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(mediaStream => {
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch(err => console.error("Error accessing camera:", err));
    } else if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isStreamer, isCameraOn]);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('live_messages')
        .select('*')
        .eq('stream_id', streamId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`live_chat:${streamId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'live_messages',
        filter: `stream_id=eq.${streamId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [streamId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await sendLiveMsg(streamId, comment);
    setComment('');
  };

  const handleEndStream = async () => {
    if (isStreamer) {
      await endLive(streamId);
    }
    onClose();
  };

  if (!stream) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row overflow-hidden" dir="rtl">
      {/* Video Section */}
      <div className="relative flex-1 bg-slate-900 flex items-center justify-center">
        {isStreamer ? (
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover mirror"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-red-600 overflow-hidden animate-pulse">
              <img src={stream.author_avatar} alt={stream.author_name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold">{stream.author_name} في بث مباشر الآن...</h2>
            <p className="text-slate-400">جاري الاتصال بالبث...</p>
          </div>
        )}

        {/* Overlay Info */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
          <div className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            بث مباشر
          </div>
          <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-md text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            {stream.viewer_count || 0}
          </div>
        </div>

        <button 
          onClick={handleEndStream}
          className="absolute top-6 left-6 p-2 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Streamer Controls */}
        {isStreamer && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
            <button 
              onClick={() => setIsCameraOn(!isCameraOn)}
              className={`p-4 rounded-full ${isCameraOn ? 'bg-white/20' : 'bg-red-600'} text-white backdrop-blur-md`}
            >
              {isCameraOn ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
            </button>
            <button 
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-4 rounded-full ${isMicOn ? 'bg-white/20' : 'bg-red-600'} text-white backdrop-blur-md`}
            >
              {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            <button 
              onClick={handleEndStream}
              className="p-4 rounded-full bg-red-600 text-white shadow-lg"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Chat Section */}
      <div className="w-full md:w-80 h-1/3 md:h-full bg-white flex flex-col border-r">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="font-bold text-slate-800">الدردشة المباشرة</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-2 items-start">
                <img src={msg.author_avatar} alt={msg.author_name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                <div className="bg-slate-100 p-2 rounded-lg rounded-tr-none">
                  <div className="text-[10px] font-bold text-blue-600">{msg.author_name}</div>
                  <div className="text-sm text-slate-700">{msg.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
          <input 
            type="text" 
            placeholder="اكتب تعليقاً..."
            className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!comment.trim()}
            className="p-2 bg-blue-600 text-white rounded-full disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
