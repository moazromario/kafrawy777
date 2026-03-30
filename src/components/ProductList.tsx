import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard, { Product } from './ProductCard';
import { supabase } from '../lib/supabase';
import MainLayout from './MainLayout';

const CATEGORIES = ['الكل', 'مركبات', 'عقارات للإيجار', 'ملابس', 'إلكترونيات', 'أثاث', 'أشياء مجانية'];

export default function ProductList() {
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else if (data) {
      const formattedProducts: Product[] = data.map(p => ({
        id: p.id,
        title: p.title,
        price: `${p.price} ج.م`,
        location: p.location,
        image: p.image_url || 'https://picsum.photos/seed/placeholder/400/400',
        category: p.category,
        condition: p.condition,
        seller: {
          name: 'مستخدم السوق',
          avatar: 'https://picsum.photos/seed/user/100/100',
          joined: '2024'
        },
        description: p.description || ''
      }));
      setProducts(formattedProducts);
    }
    setLoading(false);
  };

  const filteredProducts = activeCategory === 'الكل' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <MainLayout>
      <div className="bg-white min-h-screen md:rounded-lg md:shadow-sm md:mt-4 overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-slate-900">السوق</h1>
            <div className="flex gap-2">
              <button className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                <Search className="w-5 h-5 text-slate-900" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 mb-2">
            <button 
              onClick={() => navigate('/marketplace/create')}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              بيع
            </button>
            <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-colors">
              الفئات
            </button>
          </div>
        </div>

        {/* Categories Scroll */}
        <div className="px-4 py-3 border-b border-slate-200 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="p-2 md:p-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-3 px-2">مختارات اليوم</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
              {(filteredProducts?.length || 0) === 0 && (
                <div className="col-span-full text-center text-slate-500 py-12">
                  لا توجد منتجات في هذه الفئة.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
