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
  feeling?: string;
  activity?: string;
  likes: number;
  likedByMe: boolean;
  comments: Comment[];
}

export interface Story {
  id: string;
  userId: string;
  user: string;
  avatar: string;
  image: string;
  time: string;
  isUser?: boolean;
  comments: Comment[];
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  bio?: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  user?: Profile;
  friend?: Profile;
}

interface CommunityContextType {
  posts: Post[];
  stories: Story[];
  friendships: Friendship[];
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  addPost: (content: string, image?: string, feeling?: string, activity?: string) => Promise<void>;
  editPost: (postId: string, content: string, feeling?: string, activity?: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  addStory: (imageUrl: string) => Promise<void>;
  addStoryComment: (storyId: string, content: string) => Promise<void>;
  liveStreams: any[];
  startLive: (title: string) => Promise<string>;
  endLive: (streamId: string) => Promise<void>;
  sendLiveMsg: (streamId: string, content: string) => Promise<void>;
  showLiveModal: boolean;
  setShowLiveModal: (show: boolean) => void;
  // Friend functions
  sendFriendRequest: (friendId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  deleteFriendship: (requestId: string) => Promise<void>;
  searchProfiles: (query: string) => Promise<Profile[]>;
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
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadData = async () => {
    try {
      const api = await import('../lib/api');
      const [postsData, storiesData, liveData, friendshipsData] = await Promise.all([
        api.fetchPosts(),
        api.fetchStories(),
        api.fetchLiveStreams(),
        user ? api.fetchFriendships(user.id) : Promise.resolve([])
      ]);
      
      const formattedPosts: Post[] = postsData.map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        user: p.author_name || 'User Name',
        avatar: p.author_avatar || 'https://picsum.photos/seed/user/100/100',
        time: formatTime(p.created_at),
        content: p.content,
        image: p.image_url,
        feeling: p.feeling,
        activity: p.activity,
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
        userId: s.user_id,
        user: s.author_name || 'User Name',
        avatar: s.author_avatar || 'https://picsum.photos/seed/user/100/100',
        image: s.image_url,
        time: formatTime(s.created_at),
        isUser: s.user_id === user?.id,
        comments: (s.story_comments || []).map((c: any) => ({
          id: c.id,
          user: c.author_name || 'User Name',
          avatar: c.author_avatar || 'https://picsum.photos/seed/user/100/100',
          content: c.content,
          time: formatTime(c.created_at)
        })).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      }));

      setPosts(formattedPosts);
      setStories(formattedStories);
      setLiveStreams(liveData);
      setFriendships(friendshipsData || []);
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

    const liveUnsubscribe = import('../lib/api').then(api => api.subscribeToLiveStreams(() => {
      loadData();
    }));

    const friendsUnsubscribe = import('../lib/api').then(api => api.subscribeToFriendships(() => {
      loadData();
    }));

    return () => {
      unsubscribe();
      liveUnsubscribe.then(unsub => unsub());
      friendsUnsubscribe.then(unsub => unsub());
    };
  }, [user]);

  const addPost = async (content: string, image?: string, feeling?: string, activity?: string) => {
    if (!user) return;
    const authorName = user.user_metadata?.name || user.email?.split('@')[0] || 'User Name';
    const authorAvatar = 'https://picsum.photos/seed/user/100/100';
    
    try {
      await apiCreatePost(user.id, authorName, authorAvatar, content, image, feeling, activity);
      // Realtime subscription will trigger a reload
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setError(`خطأ في النشر: ${err?.message || 'تأكد من إعداد جداول قاعدة البيانات في Supabase'}`);
    }
  };

  const editPost = async (postId: string, content: string, feeling?: string, activity?: string) => {
    if (!user) return;
    
    // Optimistic update
    setPosts(currentPosts => currentPosts.map(post => 
      post.id === postId ? { ...post, content, feeling, activity } : post
    ));

    try {
      await apiUpdatePost(postId, user.id, content, feeling, activity);
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

  const addStoryComment = async (storyId: string, content: string) => {
    if (!user) return;
    const authorName = user.user_metadata?.name || user.email?.split('@')[0] || 'User Name';
    const authorAvatar = 'https://picsum.photos/seed/user/100/100';

    try {
      await import('../lib/api').then(api => api.addStoryComment(storyId, user.id, authorName, authorAvatar, content));
      // Realtime subscription will trigger a reload
    } catch (err: any) {
      console.error('Failed to add story comment:', err);
      setError(`خطأ في التعليق على القصة: ${err?.message || 'حدث خطأ'}`);
    }
  };

  const startLive = async (title: string) => {
    if (!user) throw new Error('يجب تسجيل الدخول');
    const authorName = user.user_metadata?.name || user.email?.split('@')[0] || 'User Name';
    const authorAvatar = 'https://picsum.photos/seed/user/100/100';

    try {
      const stream = await import('../lib/api').then(api => api.startLiveStream(user.id, authorName, authorAvatar, title));
      return stream.id;
    } catch (err: any) {
      console.error('Failed to start live:', err);
      throw err;
    }
  };

  const endLive = async (streamId: string) => {
    if (!user) return;
    try {
      await import('../lib/api').then(api => api.endLiveStream(streamId, user.id));
    } catch (err: any) {
      console.error('Failed to end live:', err);
    }
  };

  const sendLiveMsg = async (streamId: string, content: string) => {
    if (!user) return;
    const authorName = user.user_metadata?.name || user.email?.split('@')[0] || 'User Name';
    const authorAvatar = 'https://picsum.photos/seed/user/100/100';

    try {
      await import('../lib/api').then(api => api.sendLiveMessage(streamId, user.id, authorName, authorAvatar, content));
    } catch (err: any) {
      console.error('Failed to send live message:', err);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;
    try {
      await import('../lib/api').then(api => api.sendFriendRequest(user.id, friendId));
    } catch (err: any) {
      console.error('Failed to send friend request:', err);
      setError(`خطأ في إرسال طلب الصداقة: ${err?.message || 'حدث خطأ'}`);
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    if (!user) return;
    try {
      await import('../lib/api').then(api => api.acceptFriendRequest(requestId));
    } catch (err: any) {
      console.error('Failed to accept friend request:', err);
      setError(`خطأ في قبول طلب الصداقة: ${err?.message || 'حدث خطأ'}`);
    }
  };

  const deleteFriendship = async (requestId: string) => {
    if (!user) return;
    try {
      await import('../lib/api').then(api => api.deleteFriendship(requestId));
    } catch (err: any) {
      console.error('Failed to delete friendship:', err);
      setError(`خطأ في حذف الصداقة: ${err?.message || 'حدث خطأ'}`);
    }
  };

  const searchProfiles = async (query: string) => {
    try {
      return await import('../lib/api').then(api => api.fetchProfiles(query));
    } catch (err: any) {
      console.error('Failed to search profiles:', err);
      return [];
    }
  };

  return (
    <CommunityContext.Provider value={{ 
      posts, stories, friendships, liveStreams, loading, error, setError, 
      addPost, editPost, deletePost, toggleLike, addComment, 
      addStory, addStoryComment, startLive, endLive, sendLiveMsg,
      showLiveModal, setShowLiveModal,
      sendFriendRequest, acceptFriendRequest, deleteFriendship, searchProfiles
    }}>
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
