import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Share2, MoreHorizontal, MessageCircle, MapPin, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from './ProductCard';
import MainLayout from './MainLayout';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

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
          name: 'مستخدم السوق',
          avatar: 'https://picsum.photos/seed/user/100/100',
          joined: '2024'
        },
        description: data.description || ''
      });
    }
    setLoading(false);
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
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <Share2 className="w-5 h-5 text-slate-900" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <MoreHorizontal className="w-5 h-5 text-slate-900" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="w-full aspect-square md:aspect-video bg-slate-100">
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="p-4">
          {/* Title & Price */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">{product.title}</h1>
            <p className="text-xl font-semibold text-slate-900">{product.price}</p>
            <p className="text-sm text-slate-500 mt-2">تم النشر حديثاً في {product.location}</p>
          </div>

          {/* Message Button */}
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mb-6">
            <MessageCircle className="w-5 h-5" />
            مراسلة البائع
          </button>

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
            <h2 className="text-lg font-bold text-slate-900 mb-2">الوصف</h2>
            <p className="text-slate-700 whitespace-pre-line leading-relaxed">
              {product.description}
            </p>
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
              <div>
                <p className="font-bold text-slate-900">{product.seller.name}</p>
                <p className="text-sm text-slate-500">انضم في {product.seller.joined}</p>
              </div>
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
