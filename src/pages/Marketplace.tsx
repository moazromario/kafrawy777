import React, { useState, useEffect } from 'react';
import { Search, MapPin, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['الكل', 'مركبات', 'عقارات', 'ملابس', 'إلكترونيات', 'أثاث', 'أشياء مجانية'];

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const filteredProducts = activeCategory === 'الكل' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white min-h-screen md:rounded-lg md:shadow-sm md:mt-2 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-900">السوق</h1>
          <button className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
            <Search className="w-5 h-5 text-slate-900" />
          </button>
        </div>
        
        <div className="flex gap-2 mb-2">
          <button className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Plus className="w-5 h-5" />
            بيع عنصر
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
        <h2 className="text-lg font-semibold text-slate-900 mb-3 px-2">اكتشف منتجات اليوم</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200 m-2">
            لا توجد منتجات في هذه الفئة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="group cursor-pointer">
                <div className="aspect-square overflow-hidden rounded-lg mb-2 bg-slate-100 relative">
                  <img 
                    src={product.image_url || `https://picsum.photos/seed/${product.id}/400/400`} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="px-1">
                  <p className="font-bold text-slate-900 leading-tight">{product.price} ج.م</p>
                  <p className="text-sm text-slate-700 truncate">{product.title}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {product.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
