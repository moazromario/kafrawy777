"use client";
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useCommunity, Comment } from '../context/CommunityContext';

export default function Comments({ postId, comments }: { postId: string, comments: Comment[] }) {
  const [newComment, setNewComment] = useState('');
  const { addComment } = useCommunity();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(postId, newComment);
    setNewComment('');
  };

  return (
    <div className="px-4 pb-4 pt-2 border-t border-slate-100" dir="rtl">
      {comments.map(comment => (
        <div key={comment.id} className="flex gap-2 mb-4">
          <img src={comment.avatar} alt={comment.user} className="w-8 h-8 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
          <div className="flex-1 bg-slate-100 rounded-2xl px-3 py-2">
            <p className="text-sm font-bold text-slate-900">{comment.user}</p>
            <p className="text-[15px] text-slate-800">{comment.content}</p>
          </div>
        </div>
      ))}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-2">
        <img src="https://picsum.photos/seed/user/100/100" alt="User" className="w-8 h-8 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
        <div className="flex-1 flex items-center bg-slate-100 rounded-full px-4 py-1.5">
          <input 
            type="text" 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليقاً..." 
            className="bg-transparent border-none focus:outline-none w-full text-[15px] py-1" 
          />
          <button type="submit" disabled={!newComment.trim()} className="text-blue-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors disabled:opacity-50">
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </form>
    </div>
  );
}
