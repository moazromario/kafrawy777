import { supabase } from './supabase';

// Fetch all posts with their comments and likes
export async function fetchPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      comments(*),
      likes(user_id)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  return data as any[];
}

// Create a new post
export async function createPost(userId: string, authorName: string, authorAvatar: string, content: string, imageUrl?: string) {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      { user_id: userId, author_name: authorName, author_avatar: authorAvatar, content, image_url: imageUrl }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a post
export async function deletePost(postId: string, userId: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Update a post
export async function updatePost(postId: string, userId: string, content: string) {
  const { data, error } = await supabase
    .from('posts')
    .update({ content })
    .eq('id', postId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Add a comment to a post
export async function addComment(postId: string, userId: string, authorName: string, authorAvatar: string, content: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert([
      { post_id: postId, user_id: userId, author_name: authorName, author_avatar: authorAvatar, content }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Toggle a like on a post
export async function toggleLike(postId: string, userId: string) {
  // First check if the like exists
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id);
    if (error) throw error;
    return { liked: false };
  } else {
    // Like
    const { error } = await supabase
      .from('likes')
      .insert([{ post_id: postId, user_id: userId }]);
    if (error) throw error;
    return { liked: true };
  }
}

// Fetch all stories from the last 24 hours
export async function fetchStories() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .gte('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching stories:", error);
    return [];
  }
  return data as any[];
}

// Create a new story
export async function createStory(userId: string, authorName: string, authorAvatar: string, imageUrl: string) {
  const { data, error } = await supabase
    .from('stories')
    .insert([
      { user_id: userId, author_name: authorName, author_avatar: authorAvatar, image_url: imageUrl }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Subscribe to real-time changes
export function subscribeToPosts(callback: () => void) {
  const subscription = supabase
    .channel('public:posts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}

// Upload media file to Supabase Storage
export async function uploadMedia(file: File) {
  if (!file) throw new Error('لم يتم تحديد ملف');
  
  if (file.size > 50 * 1024 * 1024) {
    throw new Error('حجم الملف كبير جداً. الحد الأقصى هو 50 ميجابايت.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error(`تأكد من إنشاء مجلد (Bucket) باسم 'media' في Supabase. تفاصيل الخطأ: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from('media').getPublicUrl(filePath);
  return data.publicUrl;
}
