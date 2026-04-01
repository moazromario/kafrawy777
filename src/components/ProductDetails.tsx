import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Share2, MoreHorizontal, MessageCircle, MapPin, ShieldCheck, Loader2, Star, Minus, Plus, ShoppingCart, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from './ProductCard';
import MainLayout from './MainLayout';
import { toast } from 'sonner';
import ReviewForm from './ReviewForm';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  
  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, user_id')
      .eq('product_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setReviews(data || []);
    }
  };

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
    } else if (data) {
      setProduct({
        id: data.id,
        title: data.title,
        price: `${data.price} ج.م`,
        location: data.location,
        image: data.image_url || 'https://picsum.photos/seed/placeholder/400/400',
        category: data.category,
        condition: data.condition,
        seller: {
          id: data.user_id,
          name: 'مستخدم السوق',
          avatar: 'https://picsum.photos/seed/user/100/100',
          joined: '2024'
        },
        description: data.description || '',
        rating: 4.5,
        reviewsCount: 128,
        brand: 'ماركة مميزة',
        salesCount: 350
      });
    }
    setLoading(false);
  };

  const handleAddToCart = () => {
    toast.success('تمت الإضافة إلى السلة بنجاح!', {
      description: `${quantity} × ${product?.title}`
    });
  };

  const handleBuyNow = () => {
    toast.info('جاري الانتقال لصفحة الدفع...');
    navigate('/marketplace/checkout');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-white" dir="rtl">
          <p className="text-slate-500">المنتج غير موجود.</p>
          <button onClick={() => navigate('/marketplace')} className="mt-4 text-blue-600 font-semibold">
            العودة إلى السوق
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-white min-h-screen md:rounded-lg md:shadow-sm md:mt-4 pb-20 md:pb-0" dir="rtl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <ChevronRight className="w-6 h-6 text-slate-900" />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/marketplace/cart')}
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-slate-900" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">2</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <Share2 className="w-5 h-5 text-slate-900" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <MoreHorizontal className="w-5 h-5 text-slate-900" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="w-full aspect-square md:aspect-video bg-slate-100 relative">
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {product.brand && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-800 text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">
              {product.brand}
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Title & Price */}
          <div className="mb-4">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{product.title}</h1>
              <div className="flex flex-col items-end">
                <p className="text-2xl font-black text-blue-600 whitespace-nowrap">{product.price}</p>
                <p className="text-sm text-slate-400 line-through">{(parseFloat(product.price) * 1.2).toFixed(0)} ج.م</p>
                <div className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded mt-1">خصم 20%</div>
              </div>
            </div>
            
            {/* Rating & Sales */}
            <div className="flex items-center gap-4 text-sm mt-3">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{product.rating}</span>
                <span className="text-slate-500">({product.reviewsCount} تقييم)</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <div className="text-slate-600">
                <span className="font-bold text-slate-900">{product.salesCount}</span> تم البيع
              </div>
            </div>
          </div>

          <hr className="border-slate-200 mb-6" />

          {/* Quantity Selector */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3">الكمية</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-12 h-10 flex items-center justify-center font-bold text-slate-900 border-x border-slate-300">
                  {quantity}
                </div>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-slate-500">متاح 15 قطعة</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-blue-200"
            >
              <ShoppingCart className="w-5 h-5" />
              أضف للسلة
            </button>
            <button 
              onClick={handleBuyNow}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-600/20"
            >
              <CreditCard className="w-5 h-5" />
              اشتري الآن
            </button>
          </div>

          <hr className="border-slate-200 mb-6" />

          {/* Details */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">التفاصيل</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="text-slate-500">الحالة</div>
              <div className="font-medium text-slate-900">{product.condition}</div>
              <div className="text-slate-500">الفئة</div>
              <div className="font-medium text-slate-900">{product.category}</div>
            </div>
          </div>

          <hr className="border-slate-200 mb-6" />

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">الوصف والمواصفات</h2>
            <p className="text-slate-700 whitespace-pre-line leading-relaxed text-sm">
              {product.description || 'لا يوجد وصف متاح لهذا المنتج.'}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 list-disc list-inside">
              <li>ضمان لمدة عام كامل</li>
              <li>شحن مجاني للطلبات فوق 500 ج.م</li>
              <li>إمكانية الاسترجاع خلال 14 يوم</li>
            </ul>
          </div>

          <hr className="border-slate-200 mb-6" />

          {/* Reviews Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">تقييمات العملاء</h2>
              <button className="text-sm text-blue-600 font-medium hover:underline">عرض الكل ({product.reviewsCount})</button>
            </div>
            
            {/* Review Summary */}
            <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-xl">
              <div className="text-center">
                <p className="text-4xl font-black text-slate-900">{product.rating}</p>
                <div className="flex text-amber-500 justify-center my-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={`w-4 h-4 ${star <= (product.rating || 0) ? 'fill-current' : 'text-slate-300'}`} />
                  ))}
                </div>
                <p className="text-xs text-slate-500">{product.reviewsCount} تقييم</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-2">{star}</span>
                    <Star className="w-3 h-3 text-slate-400" />
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real Reviews */}
            <ReviewForm productId={id!} onReviewAdded={fetchReviews} />
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={`https://picsum.photos/seed/${review.user_id}/40/40`} alt="User" className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">مستخدم</p>
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'fill-current' : 'text-slate-300'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 mr-auto">{new Date(review.created_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <p className="text-sm text-slate-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-200 mb-6" />

          {/* Seller Info */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">معلومات البائع</h2>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={product.seller.avatar} 
                alt={product.seller.name} 
                className="w-12 h-12 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <p className="font-bold text-slate-900">{product.seller.name}</p>
                <p className="text-sm text-slate-500">انضم في {product.seller.joined}</p>
              </div>
              <button 
                onClick={() => navigate('/marketplace/chat', { state: { userId: product.seller.id } })}
                className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                تواصل مع البائع
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span>تم التحقق من الهوية</span>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">الموقع</h2>
            <div className="flex items-center gap-2 text-slate-700 mb-3">
              <MapPin className="w-5 h-5" />
              <span>{product.location}</span>
            </div>
            <div className="w-full h-48 bg-slate-200 rounded-lg flex items-center justify-center">
              <p className="text-slate-500 text-sm">عرض الخريطة غير متوفر</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
