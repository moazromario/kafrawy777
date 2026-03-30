"use client";
import React, { useState, useEffect, useRef } from 'react';
import MainLayout from './MainLayout';
import { Search, Edit, MoreHorizontal, Phone, Video, Info, ArrowRight, MessageCircle, Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
}

interface ChatPreview {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export default function Chat() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeChat, setActiveChat] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.userId) {
      setActiveChat(location.state.userId);
    }
  }, [location.state]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      fetchProfiles();
      fetchConversations();
      
      // Subscribe to real-time messages
      const channel = supabase
        .channel('realtime-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            if (activeChat === newMsg.sender_id) {
              setMessages((prev) => [...prev, newMsg]);
            }
            fetchConversations();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${user.id}`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            if (activeChat === newMsg.receiver_id) {
              setMessages((prev) => [...prev, newMsg]);
            }
            fetchConversations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, activeChat]);

  useEffect(() => {
    if (activeChat && user) {
      fetchMessages(activeChat);
    }
  }, [activeChat, user]);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user?.id);

    if (error) {
      console.error('Error fetching profiles:', error);
    } else if (data) {
      setProfiles(data);
    }
  };

  const fetchConversations = async () => {
    if (!user) return;

    // Fetch all messages involving the user to determine conversations
    const { data: allMessages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
      return;
    }

    // Group by other user
    const conversationMap = new Map<string, Message>();
    allMessages?.forEach((msg) => {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, msg);
      }
    });

    // Fetch profiles for these users
    const otherUserIds = Array.from(conversationMap.keys());
    if ((otherUserIds?.length || 0) === 0) {
      setLoading(false);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', otherUserIds);

    if (profileError) {
      console.error('Error fetching conversation profiles:', profileError);
    } else if (profileData) {
      const chatPreviews: ChatPreview[] = profileData.map((profile) => {
        const lastMsg = conversationMap.get(profile.id);
        return {
          id: profile.id,
          name: profile.full_name,
          avatar: profile.avatar_url || `https://picsum.photos/seed/${profile.id}/50/50`,
          lastMessage: lastMsg?.content || '',
          time: new Date(lastMsg?.created_at || '').toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          unread: 0, // Simplified for now
          online: false // Simplified for now
        };
      });
      setChats(chatPreviews);
    }
    setLoading(false);
  };

  const fetchMessages = async (otherId: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else if (data) {
      setMessages(data);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat || !user) return;

    setSending(true);
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: activeChat,
        content: newMessage.trim(),
      });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
    setSending(false);
  };

  const activeProfile = profiles.find(p => p.id === activeChat) || chats.find(c => c.id === activeChat);

  return (
    <MainLayout>
      <div className="bg-white min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-5rem)] md:rounded-lg shadow-sm flex overflow-hidden" dir="rtl">
        {/* Chat List */}
        <div className={`w-full md:w-1/3 border-l border-slate-200 flex flex-col ${activeChat !== null ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-slate-900">الدردشة</h1>
              <div className="flex gap-2">
                <button className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-slate-700" />
                </button>
                <button className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <Edit className="w-5 h-5 text-slate-700" />
                </button>
              </div>
            </div>
            
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="ابحث في الرسائل" 
                className="w-full bg-slate-100 rounded-full py-2 pr-10 pl-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : (chats?.length || 0) > 0 ? (
              chats.map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => setActiveChat(chat.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors ${activeChat === chat.id ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={chat.avatar} 
                      alt={chat.name} 
                      className="w-14 h-14 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-[15px] text-slate-900 truncate">{chat.name}</h3>
                      <span className="text-xs text-slate-500 whitespace-nowrap mr-2">{chat.time}</span>
                    </div>
                    <p className={`text-[14px] truncate ${chat.unread > 0 ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                      {chat.lastMessage}
                    </p>
                  </div>

                  {chat.unread > 0 && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {chat.unread}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-500">
                <p className="mb-4">لا توجد محادثات سابقة.</p>
                <h4 className="text-sm font-bold text-slate-700 mb-2">ابدأ دردشة مع:</h4>
                <div className="space-y-2">
                  {profiles.slice(0, 5).map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => setActiveChat(p.id)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      <img src={p.avatar_url || `https://picsum.photos/seed/${p.id}/40/40`} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                      <span className="text-sm font-medium">{p.full_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`w-full md:w-2/3 flex flex-col ${activeChat === null ? 'hidden md:flex' : 'flex'}`}>
          {activeChat !== null ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4 bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveChat(null)}
                    className="md:hidden w-10 h-10 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                  <div className="relative">
                    <img 
                      src={activeProfile?.avatar || `https://picsum.photos/seed/${activeChat}/50/50`} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-right">
                    <h2 className="font-semibold text-[15px] text-slate-900 leading-tight">
                      {activeProfile?.name || activeProfile?.full_name}
                    </h2>
                    <p className="text-xs text-slate-500">نشط الآن</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-blue-600">
                  <button className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 rounded-full transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 rounded-full transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 rounded-full transition-colors">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender_id === user?.id ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-[15px] ${
                        msg.sender_id === user?.id 
                          ? 'bg-blue-600 text-white rounded-tr-sm' 
                          : 'bg-white border border-slate-200 text-slate-900 rounded-tl-sm'
                      }`}
                    >
                      <p className="text-right">{msg.content}</p>
                      <span className={`text-[11px] block mt-1 text-left ${msg.sender_id === user?.id ? 'text-blue-200' : 'text-slate-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2"
                >
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالة..." 
                    className="flex-1 bg-transparent border-none focus:outline-none text-[15px] text-right"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="text-blue-600 font-semibold text-sm hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إرسال'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center flex-col text-slate-500">
              <MessageCircle className="w-16 h-16 text-slate-300 mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">اختر محادثة</h2>
              <p>اختر محادثة من القائمة للبدء في المراسلة.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
