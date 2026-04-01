import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import socket from '../services/socket';

interface Message {
  text: string;
  senderId: string;
  timestamp: Date;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  rideId: string;
  senderId: string;
  recipientName: string;
}

export default function ChatModal({ isOpen, onClose, rideId, senderId, recipientName }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Request chat history when modal opens
      socket.emit('get_chat_history', rideId);

      // Listen for chat history
      const handleChatHistory = (data: any) => {
        if (data.rideId === rideId) {
          setMessages(data.history.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
      };

      // Listen for incoming messages
      const handleReceiveMessage = (data: any) => {
        if (data.rideId === rideId) {
          setMessages(prev => [...prev, {
            text: data.message,
            senderId: data.senderId,
            timestamp: new Date(data.timestamp)
          }]);
        }
      };

      socket.on('chat_history', handleChatHistory);
      socket.on('receive_message', handleReceiveMessage);
      
      return () => {
        socket.off('chat_history', handleChatHistory);
        socket.off('receive_message', handleReceiveMessage);
      };
    }
  }, [isOpen, rideId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = {
      rideId,
      message: inputValue,
      senderId
    };

    socket.emit('send_message', newMessage);

    setMessages(prev => [...prev, {
      text: inputValue,
      senderId,
      timestamp: new Date()
    }]);

    setInputValue('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" dir="rtl">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="bg-white w-full max-w-md h-[80vh] sm:h-[600px] rounded-t-[2.5rem] sm:rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">{recipientName}</h3>
                  <p className="text-xs text-green-500 font-bold">متصل الآن</p>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                  <MessageCircle size={48} className="opacity-20" />
                  <p className="font-bold">ابدأ المحادثة الآن...</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.senderId === senderId ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl font-bold text-sm shadow-sm ${
                      msg.senderId === senderId
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                    }`}
                  >
                    {msg.text}
                    <p className={`text-[10px] mt-1 opacity-60 ${msg.senderId === senderId ? 'text-blue-100' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                >
                  <Send size={20} className="rotate-180" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
