import React, { useState, useEffect, useRef } from 'react';
import { Image, Video, Smile, ThumbsUp, MessageSquare, Share2, MoreHorizontal, Loader2, Trash2, Edit2, X, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Media Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  // Interactive States
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchPosts();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUser(session.user);
    } else {
      navigate('/auth');
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*, profiles(*), post_likes(user_id), post_comments(id)')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
    } else if (postsData) {
      setPosts(postsData);
    }
    setLoading(false);
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedMedia(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedMedia) return;
    if (!currentUser) return alert('يجب تسجيل الدخول أولاً!');
    
    setIsPosting(true);
    let mediaUrl = null;

    try {
      if (selectedMedia) {
        const fileExt = selectedMedia.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(fileName, selectedMedia);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-media')
          .getPublicUrl(fileName);
        
        mediaUrl = publicUrl;
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          content: newPostContent,
          author_id: currentUser.id,
          image_url: mediaUrl
        });

      if (error) throw error;

      setNewPostContent('');
      setSelectedMedia(null);
      setMediaPreview(null);
      fetchPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert('حدث خطأ أثناء النشر. تأكد من إنشاء مساحة تخزين post-media.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
    
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      setPosts(posts.filter(p => p.id !== postId));
      setActiveMenu(null);
    } else {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleEditSubmit = async (postId: string) => {
    const { error } = await supabase.from('posts').update({ content: editContent }).eq('id', postId);
    if (!error) {
      setPosts(posts.map(p => p.id === postId ? { ...p, content: editContent } : p));
      setEditingPostId(null);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!currentUser) return;

    if (isLiked) {
      await supabase.from('post_likes').delete().match({ post_id: postId, user_id: currentUser.id });
      setPosts(posts.map(p => p.id === postId ? { ...p, post_likes: p.post_likes.filter((l: any) => l.user_id !== currentUser.id) } : p));
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: currentUser.id });
      setPosts(posts.map(p => p.id === postId ? { ...p, post_likes: [...p.post_likes, { user_id: currentUser.id }] } : p));
    }
  };

  const toggleComments = async (postId: string) => {
    if (showComments === postId) {
      setShowComments(null);
      return;
    }
    setShowComments(postId);
    
    const { data } = await supabase
      .from('post_comments')
      .select('*, profiles(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
      
    if (data) {
      setComments({ ...comments, [postId]: data });
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim() || !currentUser) return;

    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: currentUser.id, content: newComment })
      .select('*, profiles(*)')
      .single();

    if (!error && data) {
      setComments({ ...comments, [postId]: [...(comments[postId] || []), data] });
      setNewComment('');
      // Update comment count in UI
      setPosts(posts.map(p => p.id === postId ? { ...p, post_comments: [...p.post_comments, { id: data.id }] } : p));
    }
  };

  const handleShare = async (post: any) => {
    const shareData = {
      title: 'منشور على كفراوي',
      text: post.content,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(post.content);
        alert('تم نسخ النص!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Create Post */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 md:mt-0 mt-2">
        <div className="flex gap-3 mb-3">
          <img src="https://ui-avatars.com/api/?name=Me&background=random" alt="User" className="w-10 h-10 rounded-full object-cover" />
          <input 
            type="text" 
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreatePost()}
            placeholder="بم تفكر يا كفراوي؟" 
            className="bg-slate-100 hover:bg-slate-200 transition-colors rounded-full px-4 py-2 w-full outline-none text-slate-900"
            disabled={isPosting}
          />
        </div>

        {/* Media Preview */}
        {mediaPreview && (
          <div className="relative mb-3 rounded-lg overflow-hidden border border-slate-200">
            <button 
              onClick={() => { setSelectedMedia(null); setMediaPreview(null); }}
              className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            {selectedMedia?.type.startsWith('video/') ? (
              <video src={mediaPreview} controls className="w-full max-h-64 object-contain bg-black" />
            ) : (
              <img src={mediaPreview} alt="Preview" className="w-full max-h-64 object-contain bg-black" />
            )}
          </div>
        )}

        <hr className="border-slate-200 my-3" />
        <div className="flex justify-between">
          <input 
            type="file" 
            accept="image/*,video/*" 
            hidden 
            ref={fileInputRef} 
            onChange={handleMediaSelect} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100 py-2 rounded-lg transition-colors"
          >
            <Image className="w-6 h-6 text-green-500" />
            <span className="font-medium text-sm">صورة/فيديو</span>
          </button>
          <button 
            onClick={handleCreatePost}
            disabled={isPosting || (!newPostContent.trim() && !selectedMedia)}
            className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition-colors font-bold disabled:opacity-50"
          >
            {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'نشر'}
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-slate-500">
            لا توجد منشورات حتى الآن. كن أول من ينشر!
          </div>
        ) : (
          posts.map(post => {
            const isLiked = post.post_likes?.some((like: any) => like.user_id === currentUser?.id);
            const isAuthor = currentUser?.id === post.author_id;

            return (
              <div key={post.id} className="bg-white rounded-lg shadow-sm">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between relative">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${post.profiles?.full_name || 'مستخدم'}&background=random`} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full object-cover" 
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">
                        {post.profiles?.full_name || 'مستخدم كفراوي'}
                      </h3>
                      <p className="text-xs text-slate-500">{formatTime(post.created_at)}</p>
                    </div>
                  </div>
                  
                  {isAuthor && (
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === post.id ? null : post.id)}
                        className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {activeMenu === post.id && (
                        <div className="absolute left-0 top-10 w-32 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden z-20">
                          <button 
                            onClick={() => { setEditingPostId(post.id); setEditContent(post.content); setActiveMenu(null); }}
                            className="w-full text-right px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" /> تعديل
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> حذف
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <div className="px-4 pb-3">
                  {editingPostId === post.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-500"
                        rows={3}
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingPostId(null)} className="px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 rounded">إلغاء</button>
                        <button onClick={() => handleEditSubmit(post.id)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">حفظ</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-900 whitespace-pre-wrap">{post.content}</p>
                  )}
                </div>

                {/* Post Media */}
                {post.image_url && (
                  post.image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={post.image_url} controls className="w-full max-h-[500px] object-contain bg-black" />
                  ) : (
                    <img src={post.image_url} alt="Post content" className="w-full max-h-[500px] object-cover" />
                  )
                )}

                {/* Post Stats */}
                <div className="px-4 py-2 flex items-center justify-between text-slate-500 text-sm border-b border-slate-100">
                  <div className="flex items-center gap-1">
                    <div className="bg-blue-600 rounded-full p-1">
                      <ThumbsUp className="w-3 h-3 text-white fill-white" />
                    </div>
                    <span>{post.post_likes?.length || 0}</span>
                  </div>
                  <div className="flex gap-3 cursor-pointer" onClick={() => toggleComments(post.id)}>
                    <span>{post.post_comments?.length || 0} تعليق</span>
                  </div>
                </div>

                {/* Post Actions */}
                <div className="px-2 py-1 flex justify-between">
                  <button 
                    onClick={() => handleLike(post.id, isLiked)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${isLiked ? 'text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-blue-600' : ''}`} />
                    <span className="font-medium text-sm">أعجبني</span>
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className="flex-1 flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100 py-2 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium text-sm">تعليق</span>
                  </button>
                  <button 
                    onClick={() => handleShare(post)}
                    className="flex-1 flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100 py-2 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="font-medium text-sm">مشاركة</span>
                  </button>
                </div>

                {/* Comments Section */}
                {showComments === post.id && (
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                    {/* Comment Input */}
                    <div className="flex gap-2 mb-4">
                      <img src="https://ui-avatars.com/api/?name=Me&background=random" alt="User" className="w-8 h-8 rounded-full" />
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          placeholder="اكتب تعليقاً..." 
                          className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-1.5 text-sm outline-none focus:border-blue-400"
                        />
                        <button 
                          onClick={() => handleAddComment(post.id)}
                          className="absolute left-2 top-1.5 text-blue-600 hover:text-blue-800"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3">
                      {comments[post.id]?.map((comment: any) => (
                        <div key={comment.id} className="flex gap-2">
                          <img 
                            src={comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${comment.profiles?.full_name || 'U'}&background=random`} 
                            alt="User" 
                            className="w-8 h-8 rounded-full" 
                          />
                          <div className="bg-white border border-slate-200 rounded-2xl rounded-tr-none px-3 py-2 max-w-[85%]">
                            <p className="font-bold text-xs text-slate-900 mb-0.5">{comment.profiles?.full_name}</p>
                            <p className="text-sm text-slate-800">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
