"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchPosts, createPost as apiCreatePost, addComment as apiAddComment, toggleLike as apiToggleLike, subscribeToPosts, fetchStories, createStory as apiCreateStory, deletePost as apiDeletePost, updatePost as apiUpdatePost } from '../lib/api';

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  time: string;
}

export interface Post {
  id: string;
  userId: string;
  user: string;
  avatar: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  likedByMe: boolean;
  comments: Comment[];
}

export interface Story {
  id: string;
  user: string;
  avatar: string;
  image: string;
  isUser?: boolean;
}

interface CommunityContextType {
  posts: Post[];
  stories: Story[];
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  addPost: (content: string, image?: string) => Promise<void>;
  editPost: (postId: string, content: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  addStory: (imageUrl: string) => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

// Helper to format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadData = async () => {
    try {
      const [postsData, storiesData] = await Promise.all([
        fetchPosts(),
        fetchStories()
      ]);
      
      const formattedPosts: Post[] = postsData.map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        user: p.author_name || 'User Name',
        avatar: p.author_avatar || 'https://picsum.photos/seed/user/100/100',
        time: formatTime(p.created_at),
        content: p.content,
        image: p.image_url,
        likes: p.likes?.length || 0,
        likedByMe: p.likes?.some((l: any) => l.user_id === user?.id) || false,
        comments: (p.comments || []).map((c: any) => ({
          id: c.id,
          user: c.author_name || 'User Name',
          avatar: c.author_avatar || 'https://picsum.photos/seed/user/100/100',
          content: c.content,
          time: formatTime(c.created_at)
        })).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      }));
      
      const formattedStories: Story[] = storiesData.map((s: any) => ({
        id: s.id,
        user: s.author_name || 'User Name',
        avatar: s.author_avatar || 'https://picsum.photos/seed/user/100/100',
        image: s.image_url,
        isUser: s.user_id === user?.id
      }));

      setPosts(formattedPosts);
      setStories(formattedStories);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubscribe = subscribeToPosts(() => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const addPost = async (content: string, image?: string) => {
    if (!user) return;
    const authorName = user.user_metadata?.name || user.email?.split('@')[0] || 'User Name';
    const authorAvatar = 'https://picsum.photos/seed/user/100/100';
    
    try {
      await apiCreatePost(user.id, authorName, authorAvatar, content, image);
      // Realtime subscription will trigger a reload
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setError(`خطأ في النشر: ${err?.message || 'تأكد من إعداد جداول قاعدة البيانات في Supabase'}`);
    }
  };

  const editPost = async (postId: string, content: string) => {
    if (!user) return;
    
    // Optimistic update
    setPosts(currentPosts => currentPosts.map(post => 
      post.id === postId ? { ...post, content } : post
    ));

    try {
      await apiUpdatePost(postId, user.id, content);
    } catch (err: any) {
      console.error('Failed to edit post:', err);
      setError(`خطأ في تعديل المنشور: ${err?.message || 'حدث خطأ'}`);
      loadData(); // Revert on failure
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;
    
    // Optimistic update
    setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));

    try {
      await apiDeletePost(postId, user.id);
    } catch (err: any) {
      console.error('Failed to delete post:', err);
      setError(`خطأ في حذف المنشور: ${err?.message || 'حدث خطأ'}`);
      loadData(); // Revert on failure
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;
    
    // Optimistic update
    setPosts(currentPosts => currentPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likedByMe ? post.likes - 1 : post.likes + 1,
          likedByMe: !post.likedByMe
        };
      }
      return post;
    }));

    try {
      await apiToggleLike(postId, user.id);
      // Realtime subscription will sync the final state
    } catch (err: any) {
      console.error('Failed to toggle like:', err);
      setError(`خطأ في الإعجاب: ${err?.message || 'حدث خطأ'}`);
      loadData(); // Revert on failure
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!user) return;
    const authorName = user.user_metadata?.name || user.email?.split('@')[0] || 'User Name';
    const authorAvatar = 'https://picsum.photos/seed/user/100/100';

    try {
      await apiAddComment(postId, user.id, authorName, authorAvatar, content);
      // Realtime subscription will trigger a reload
    } catch (err: any) {
      console.error('Failed to add comment:', err);
      setError(`خطأ في التعليق: ${err?.message || 'حدث خطأ'}`);
    }
  };

  const addStory = async (imageUrl: string) => {
    if (!user) return;
    const authorName = user.user_metadata?.name || user.email?.split('@')[0] || 'User Name';
    const authorAvatar = 'https://picsum.photos/seed/user/100/100';

    try {
      await apiCreateStory(user.id, authorName, authorAvatar, imageUrl);
      // Realtime subscription will trigger a reload
    } catch (err: any) {
      console.error('Failed to add story:', err);
      setError(`خطأ في إضافة القصة: ${err?.message || 'حدث خطأ'}`);
    }
  };

  return (
    <CommunityContext.Provider value={{ posts, stories, loading, error, setError, addPost, editPost, deletePost, toggleLike, addComment, addStory }}>
      {children}
      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3">
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="text-white/80 hover:text-white font-bold">
            ✕
          </button>
        </div>
      )}
    </CommunityContext.Provider>
  );
}

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
