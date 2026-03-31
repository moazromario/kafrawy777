import { supabase } from '../lib/supabase';

/**
 * موديول الخدمات - كفراوي (Kafrawy Services Module)
 * Backend API Functions using Supabase
 */

export type ServiceCategory = 'صنايعية' | 'مدرسين' | 'محامين' | 'محاسبين' | 'أطباء';

export interface ServiceProvider {
  id: string;
  user_id: string;
  name: string;
  category: ServiceCategory;
  title: string;
  description: string;
  location: string;
  phone: string;
  whatsapp?: string;
  avatar_url?: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  provider_id: string;
  title: string;
  description?: string;
  price?: number;
  created_at: string;
}

export interface Review {
  id: string;
  provider_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

// واجهة لنتائج البحث مع الترقيم (Pagination)
export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  totalPages: number;
}

/**
 * معالج الأخطاء باللغة العربية
 */
const handleError = (error: any, defaultMsg: string) => {
  console.error('Supabase Error:', error);
  if (error.code === '23505') return 'هذا السجل موجود بالفعل.';
  if (error.code === '42501') return 'ليس لديك صلاحية للقيام بهذا الإجراء.';
  return error.message || defaultMsg;
};

export const servicesApi = {
  /**
   * جلب مقدمي الخدمات مع فلاتر متقدمة وترقيم (Pagination)
   */
  getProviders: async (options: {
    category?: ServiceCategory;
    location?: string;
    search?: string;
    minRating?: number;
    page?: number;
    limit?: number;
  } = {}) => {
    const { 
      category, 
      location, 
      search, 
      minRating = 0, 
      page = 1, 
      limit = 10 
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
      let query = supabase
        .from('service_providers')
        .select('*', { count: 'exact' })
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false });

      // الفلترة حسب القسم
      if (category) {
        query = query.eq('category', category);
      }

      // الفلترة حسب الموقع
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      // البحث النصي بالكلمات
      if (search) {
        query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // الفلترة حسب الحد الأدنى للتقييم
      if (minRating > 0) {
        query = query.gte('rating', minRating);
      }

      // الترقيم (Pagination)
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as ServiceProvider[],
        count: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      } as PaginatedResult<ServiceProvider>;

    } catch (error: any) {
      throw new Error(handleError(error, 'حدث خطأ أثناء جلب مقدمي الخدمات.'));
    }
  },

  /**
   * جلب تفاصيل مقدم خدمة معين مع خدماته وتقييماته
   */
  getProviderById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select(`
          *,
          services (*),
          service_reviews (
            *,
            profiles:user_id (full_name, avatar_url)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(handleError(error, 'لم نتمكن من العثور على مقدم الخدمة المطلوب.'));
    }
  },

  /**
   * جلب بروفايل مقدم الخدمة الخاص بالمستخدم الحالي
   */
  getProviderByUserId: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as ServiceProvider | null;
    } catch (error: any) {
      throw new Error(handleError(error, 'حدث خطأ أثناء التحقق من بروفايل مقدم الخدمة.'));
    }
  },

  /**
   * إنشاء بروفايل مقدم خدمة جديد
   */
  createProvider: async (provider: Omit<ServiceProvider, 'id' | 'rating' | 'review_count' | 'is_verified' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .insert([provider])
        .select()
        .single();

      if (error) throw error;
      return data as ServiceProvider;
    } catch (error: any) {
      throw new Error(handleError(error, 'فشل إنشاء بروفايل مقدم الخدمة.'));
    }
  },

  /**
   * تحديث بيانات بروفايل مقدم الخدمة
   */
  updateProvider: async (id: string, updates: Partial<ServiceProvider>) => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ServiceProvider;
    } catch (error: any) {
      throw new Error(handleError(error, 'فشل تحديث بيانات البروفايل.'));
    }
  },

  /**
   * إضافة خدمة جديدة لمقدم الخدمة
   */
  addService: async (service: Omit<Service, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([service])
        .select()
        .single();

      if (error) throw error;
      return data as Service;
    } catch (error: any) {
      throw new Error(handleError(error, 'فشل إضافة الخدمة الجديدة.'));
    }
  },

  /**
   * حذف خدمة
   */
  deleteService: async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error: any) {
      throw new Error(handleError(error, 'فشل حذف الخدمة.'));
    }
  },

  /**
   * إضافة تقييم جديد
   * ملاحظة: يتم حساب متوسط التقييم تلقائياً في قاعدة البيانات عبر Trigger
   */
  addReview: async (review: Omit<Review, 'id' | 'created_at' | 'profiles'>) => {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .insert([review])
        .select()
        .single();

      if (error) throw error;
      return data as Review;
    } catch (error: any) {
      throw new Error(handleError(error, 'فشل إضافة التقييم. قد تكون قمت بتقييم هذا الشخص مسبقاً.'));
    }
  },

  /**
   * التبديل بين إضافة/إزالة من المفضلة
   */
  toggleFavorite: async (userId: string, providerId: string) => {
    try {
      const { data: existing } = await supabase
        .from('service_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('provider_id', providerId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('service_favorites')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return false; // تمت الإزالة
      } else {
        const { error } = await supabase
          .from('service_favorites')
          .insert([{ user_id: userId, provider_id: providerId }]);
        if (error) throw error;
        return true; // تمت الإضافة
      }
    } catch (error: any) {
      throw new Error(handleError(error, 'حدث خطأ أثناء تحديث المفضلة.'));
    }
  }
};
