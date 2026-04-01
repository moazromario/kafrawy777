import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Edit, Trash2, Package, Plus, AlertCircle, Search, Loader2 } from 'lucide-react';
import MainLayout from './MainLayout';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

export default function ManageProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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
      toast.error('حدث خطأ أثناء جلب المنتجات');
    } else if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        toast.error('حدث خطأ أثناء الحذف');
      } else {
        setProducts(products.filter(p => p.id !== id));
        toast.success('تم حذف المنتج بنجاح');
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.title?.includes(searchQuery) || p.category?.includes(searchQuery)
  );

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen md:rounded-lg md:shadow-sm md:mt-4 pb-24 md:pb-8" dir="rtl">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/marketplace/dashboard')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors -mr-2">
              <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">إدارة المنتجات</h1>
          </div>
          <button 
            onClick={() => navigate('/marketplace/create')}
            className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          
          {/* Search Bar */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="ابحث في منتجاتك..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
            />
            <Search className="w-5 h-5 text-slate-400 absolute right-4 top-3" />
          </div>

          {/* Products List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div key={product.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-3">
                  {/* Product Image */}
                  <div className="w-24 h-24 rounded-lg bg-slate-100 flex-shrink-0 border border-slate-100 overflow-hidden relative">
                    <img src={product.image_url || 'https://picsum.photos/seed/placeholder/200/200'} alt={product.title} className="w-full h-full object-cover" />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">نفذت الكمية</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight mb-1">{product.title}</h3>
                      <p className="text-blue-600 font-black text-sm">{product.price.toLocaleString()} ج.م</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      {/* Stock Indicator */}
                      <div className={`flex items-center gap-1 text-xs font-medium ${
                        product.stock > 10 ? 'text-green-600' : 
                        product.stock > 0 ? 'text-amber-600' : 'text-red-500'
                      }`}>
                        {product.stock === 0 ? (
                          <AlertCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Package className="w-3.5 h-3.5" />
                        )}
                        <span>{product.stock === 0 ? 'غير متوفر' : `المتاح: ${product.stock}`}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => navigate(`/marketplace/edit/${product.id}`)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-sm mt-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
                <p className="font-bold text-slate-700">لا توجد منتجات</p>
                <p className="text-sm text-slate-500 mt-1">لم يتم العثور على منتجات مطابقة لبحثك.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
