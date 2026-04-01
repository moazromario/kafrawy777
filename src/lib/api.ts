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
export async function createPost(userId: string, authorName: string, authorAvatar: string, content: string, imageUrl?: string, feeling?: string, activity?: string) {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      { user_id: userId, author_name: authorName, author_avatar: authorAvatar, content, image_url: imageUrl, feeling, activity }
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
export async function updatePost(postId: string, userId: string, content: string, feeling?: string, activity?: string) {
  const { data, error } = await supabase
    .from('posts')
    .update({ content, feeling, activity })
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
    .select('*, story_comments(*)')
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

// Add a comment to a story
export async function addStoryComment(storyId: string, userId: string, authorName: string, authorAvatar: string, content: string) {
  const { data, error } = await supabase
    .from('story_comments')
    .insert([
      { story_id: storyId, user_id: userId, author_name: authorName, author_avatar: authorAvatar, content }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Fetch all active live streams
export async function fetchLiveStreams() {
  const { data, error } = await supabase
    .from('live_streams')
    .select('*')
    .eq('is_live', true)
    .order('started_at', { ascending: false });

  if (error) {
    console.error("Error fetching live streams:", error);
    return [];
  }
  return data as any[];
}

// Start a live stream
export async function startLiveStream(userId: string, authorName: string, authorAvatar: string, title: string) {
  const { data, error } = await supabase
    .from('live_streams')
    .insert([
      { user_id: userId, author_name: authorName, author_avatar: authorAvatar, title }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// End a live stream
export async function endLiveStream(streamId: string, userId: string) {
  const { error } = await supabase
    .from('live_streams')
    .update({ is_live: false, ended_at: new Date().toISOString() })
    .eq('id', streamId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Send a message in live stream chat
export async function sendLiveMessage(streamId: string, userId: string, authorName: string, authorAvatar: string, content: string) {
  const { data, error } = await supabase
    .from('live_messages')
    .insert([
      { stream_id: streamId, user_id: userId, author_name: authorName, author_avatar: authorAvatar, content }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Subscribe to live stream changes
export function subscribeToLiveStreams(callback: () => void) {
  const subscription = supabase
    .channel('public:live_streams')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'live_messages' }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}

// Subscribe to real-time changes
export function subscribeToPosts(callback: () => void) {
  const subscription = supabase
    .channel('public:posts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'story_comments' }, callback)
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

// --- Friendships API ---

// Fetch all profiles (for searching friends)
export async function fetchProfiles(query?: string) {
  let request = supabase
    .from('profiles')
    .select('*');
  
  if (query) {
    request = request.ilike('full_name', `%${query}%`);
  }

  const { data, error } = await request.limit(20);
  if (error) throw error;
  return data;
}

// Fetch all friendships for a user
export async function fetchFriendships(userId: string) {
  // Fetch friendships first
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select('*')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

  if (friendshipsError) throw friendshipsError;
  if (!friendships || friendships.length === 0) return [];

  // Extract all unique user IDs from the friendships
  const profileIds = new Set<string>();
  friendships.forEach(f => {
    profileIds.add(f.user_id);
    profileIds.add(f.friend_id);
  });

  // Fetch all related profiles in one query
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', Array.from(profileIds));

  if (profilesError) throw profilesError;

  // Create a map for quick profile lookups
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  // Combine the data
  return friendships.map(f => ({
    ...f,
    user: profileMap.get(f.user_id) || null,
    friend: profileMap.get(f.friend_id) || null
  }));
}

// Send a friend request
export async function sendFriendRequest(userId: string, friendId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .insert([{ user_id: userId, friend_id: friendId, status: 'pending' }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Accept a friend request
export async function acceptFriendRequest(requestId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Reject or Cancel a friend request / Remove a friend
export async function deleteFriendship(requestId: string) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', requestId);

  if (error) throw error;
}

// --- Jobs API ---

export async function fetchJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      employer:employer_id(id, full_name, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchJobById(id: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      employer:employer_id(id, full_name, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createJob(employerId: string, jobData: any) {
  const { data, error } = await supabase
    .from('jobs')
    .insert([{ ...jobData, employer_id: employerId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function applyForJob(jobId: string, applicantId: string, cvUrl: string, coverLetter: string) {
  const { data, error } = await supabase
    .from('job_applications')
    .insert([{ job_id: jobId, applicant_id: applicantId, cv_url: cvUrl, cover_letter: coverLetter }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchJobApplications(jobId: string) {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      applicant:applicant_id(id, full_name, avatar_url, cv_url)
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  const { data, error } = await supabase
    .from('job_applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchUserApplications(userId: string) {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      job:job_id(*)
    `)
    .eq('applicant_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// --- Messages API ---
export function subscribeToFriendships(callback: () => void) {
  const subscription = supabase
    .channel('public:friendships')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, profileData: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchUserPosts(userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchUserProducts(userId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchUserJobs(userId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('employer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchUserFriends(userId: string) {
  // Fetch accepted friendships first
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select('*')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (friendshipsError) throw friendshipsError;
  if (!friendships || friendships.length === 0) return [];

  // Extract all unique user IDs from the friendships
  const profileIds = new Set<string>();
  friendships.forEach(f => {
    profileIds.add(f.user_id);
    profileIds.add(f.friend_id);
  });

  // Fetch all related profiles in one query
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, bio')
    .in('id', Array.from(profileIds));

  if (profilesError) throw profilesError;

  // Create a map for quick profile lookups
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  // Combine the data
  return friendships.map(f => ({
    ...f,
    user: profileMap.get(f.user_id) || null,
    friend: profileMap.get(f.friend_id) || null
  }));
}
