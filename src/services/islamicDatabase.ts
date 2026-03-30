import { supabase } from '../lib/supabase';

export interface Zikr {
  id: string;
  category: string;
  content: string;
  count: number;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  type: 'ذكر' | 'آية';
  ref_id: string;
  created_at: string;
}

// 1. جلب الأذكار حسب التصنيف
export async function getAzkarByCategory(category: string) {
  const { data, error } = await supabase
    .from('azkar')
    .select('*')
    .eq('category', category);
  
  if (error) throw error;
  return data as Zikr[];
}

// 2. إضافة إلى المفضلة
export async function addToFavorites(userId: string, type: 'ذكر' | 'آية', refId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .insert([{ user_id: userId, type, ref_id: refId }])
    .select();
  
  if (error) throw error;
  return data[0] as Favorite;
}

// 3. جلب المفضلات للمستخدم
export async function getUserFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data as Favorite[];
}

// 4. حذف من المفضلة
export async function removeFromFavorites(userId: string, type: 'ذكر' | 'آية', refId: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .match({ user_id: userId, type, ref_id: refId });
  
  if (error) throw error;
}
