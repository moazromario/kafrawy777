"use client";
import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, ThumbsUp, MessageCircle, Share2, Edit2, Trash2, X, Check } from 'lucide-react';
import { Post, useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import Comments from './Comments';

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [shareText, setShareText] = useState('مشاركة');
  
  const { toggleLike, deletePost, editPost } = useCommunity();
  const { user: currentUser } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUser?.id === post.userId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditSubmit = async () => {
    if (!editContent.trim() || editContent === post.content) {
      setIsEditing(false);
      setEditContent(post.content);
      return;
    }
    await editPost(post.id, editContent);
    setIsEditing(false);
  };

  const confirmDelete = async () => {
    await deletePost(post.id);
    setShowDeleteConfirm(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `منشور بواسطة ${post.user}`,
          text: post.content,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${post.content}\n\n${window.location.href}`);
      setShareText('تم النسخ!');
      setTimeout(() => setShareText('مشاركة'), 2000);
    }
  };

  const isVideo = (url?: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('.mp4') || url.includes('.webm');
  };

  return (
    <div className="bg-white shadow-sm md:rounded-lg mb-4 border-y border-slate-200 md:border-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
          <div>
            <div className="flex flex-wrap items-center gap-x-1">
              <h3 className="font-semibold text-slate-900 leading-tight">{post.user}</h3>
              {(post.feeling || post.activity) && (
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <span>— يشعر بـ</span>
                  {post.feeling && <span>{post.feeling}</span>}
                  {post.activity && <span>{post.activity}</span>}
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500">{post.time}</p>
          </div>
        </div>
        
        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden z-10">
                <button 
                  onClick={() => { setIsEditing(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-right"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>تعديل المنشور</span>
                </button>
                <button 
                  onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-right border-t border-slate-100"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف المنشور</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="px-4 pb-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm font-medium mb-3">هل أنت متأكد من حذف هذا المنشور نهائياً؟</p>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmDelete}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                نعم، احذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none resize-none text-slate-900 text-[15px] min-h-[80px]"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2 border-t border-slate-200 pt-2">
              <button 
                onClick={() => { setIsEditing(false); setEditContent(post.content); }}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleEditSubmit}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                حفظ التعديل
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-900 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
        )}
      </div>

      {/* Image / Video */}
      {post.image && (
        <div className="w-full max-h-[500px] overflow-hidden bg-slate-100 border-y border-slate-100">
          {isVideo(post.image) ? (
            <video src={post.image} controls className="w-full max-h-[500px] object-contain bg-black" />
          ) : (
            <img src={post.image} alt="Post content" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          )}
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2.5 flex items-center justify-between text-sm text-slate-500 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
            <ThumbsUp className="w-3 h-3 text-white fill-white" />
          </div>
          <span className="hover:underline cursor-pointer">{post.likes}</span>
        </div>
        <div className="flex gap-3">
          <span className="cursor-pointer hover:underline" onClick={() => setShowComments(!showComments)}>
            {post.comments.length} تعليقات
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-2 py-1 flex justify-between">
        <button 
          onClick={() => toggleLike(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-50 transition-colors ${post.likedByMe ? 'text-blue-600' : 'text-slate-600'}`}
        >
          <ThumbsUp className={`w-5 h-5 ${post.likedByMe ? 'fill-blue-600' : ''}`} />
          <span className="font-semibold text-[15px]">إعجاب</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold text-[15px]">تعليق</span>
        </button>
        <button 
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-semibold text-[15px]">{shareText}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && <Comments postId={post.id} comments={post.comments} />}
    </div>
  );
};

export default PostCard;
