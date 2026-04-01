import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, MapPin, Wrench, SlidersHorizontal, Star, X, ShoppingCart, Store, Check } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import ProductCard, { Product } from './ProductCard';
import { supabase } from '../lib/supabase';
import MainLayout from './MainLayout';
import { Skeleton } from './UI/Skeleton';

const CATEGORIES = ['الكل', 'إلكترونيات', 'ملابس', 'مستلزمات منزلية', 'أدوات مكتبية'];
const BRANDS = ['سامسونج', 'أبل', 'زارا', 'نايك', 'أخرى'];

const TOP_STORES = [
  { id: 1, name: 'إلكترونيات كفراوي', logo: 'https://picsum.photos/seed/store1/100/100', rating: 4.9, verified: true },
  { id: 2, name: 'أزياء الموضة', logo: 'https://picsum.photos/seed/store2/100/100', rating: 4.7, verified: true },
  { id: 3, name: 'بيت العائلة', logo: 'https://picsum.photos/seed/store3/100/100', rating: 4.5, verified: false },
  { id: 4, name: 'سوبر ماركت الأمل', logo: 'https://picsum.photos/seed/store4/100/100', rating: 4.8, verified: true },
  { id: 5, name: 'مكتبة القلم', logo: 'https://picsum.photos/seed/store5/100/100', rating: 4.6, verified: false },
];

export default function ProductList() {
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [sortBy, setSortBy] = useState('newest'); // newest, best_selling, highest_rated, price_asc, price_desc
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minRating, setMinRating] = useState(0);

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
          id: p.user_id,
          name: 'مستخدم السوق',
          avatar: 'https://picsum.photos/seed/user/100/100',
          joined: '2024'
        },
        description: p.description || '',
        // Mock data for new fields to demonstrate filtering/sorting
        rating: 3 + Math.random() * 2,
        salesCount: Math.floor(Math.random() * 500),
        brand: BRANDS[Math.floor(Math.random() * BRANDS.length)],
      }));
      setProducts(formattedProducts);
    }
    setLoading(false);
  };

  let filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'الكل' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply Filters
    const pPrice = parseFloat(p.price.replace(/[^\d.]/g, ''));
    const matchesMinPrice = priceMin ? pPrice >= parseFloat(priceMin) : true;
    const matchesMaxPrice = priceMax ? pPrice <= parseFloat(priceMax) : true;
    const matchesBrand = selectedBrand ? p.brand === selectedBrand : true;
    const matchesRating = minRating > 0 ? (p.rating || 0) >= minRating : true;

    return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice && matchesBrand && matchesRating;
  });

  // Apply Sorting
  filteredProducts.sort((a, b) => {
    if (sortBy === 'best_selling') return (b.salesCount || 0) - (a.salesCount || 0);
    if (sortBy === 'highest_rated') return (b.rating || 0) - (a.rating || 0);
    
    const priceA = parseFloat(a.price.replace(/[^\d.]/g, ''));
    const priceB = parseFloat(b.price.replace(/[^\d.]/g, ''));
    if (sortBy === 'price_asc') return priceA - priceB;
    if (sortBy === 'price_desc') return priceB - priceA;
    
    return 0; // newest (default, already sorted by DB)
  });

  return (
    <MainLayout>
      <div className="bg-white min-h-screen md:rounded-lg md:shadow-sm md:mt-4 overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-slate-900">سوق كفراوي</h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/marketplace/register-store')}
                className="flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-full text-sm font-bold transition-colors border border-blue-100"
              >
                <Store className="w-4 h-4" />
                متجري
              </button>
              <button 
                onClick={() => navigate('/marketplace/cart')}
                className="relative w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-slate-900" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">2</span>
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث عن المنتجات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            />
          </div>
          
          <div className="flex gap-2 mb-2">
            <button 
              onClick={() => navigate('/marketplace/create')}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              بيع
            </button>
            <Link 
              to="/services"
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors border border-blue-100"
            >
              <Wrench className="w-5 h-5" />
              الخدمات
            </Link>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${showFilters ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              تصفية
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-4 py-4 bg-slate-50 border-b border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900">تصفية وترتيب</h3>
              <button onClick={() => {
                setSortBy('newest');
                setPriceMin('');
                setPriceMax('');
                setSelectedBrand('');
                setMinRating(0);
              }} className="text-sm text-blue-600 font-medium">إعادة ضبط</button>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ترتيب حسب</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
              >
                <option value="newest">الأحدث</option>
                <option value="best_selling">الأكثر مبيعاً</option>
                <option value="highest_rated">الأعلى تقييماً</option>
                <option value="price_asc">السعر: من الأقل للأعلى</option>
                <option value="price_desc">السعر: من الأعلى للأقل</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">نطاق السعر (ج.م)</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="من" 
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                />
                <input 
                  type="number" 
                  placeholder="إلى" 
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                />
              </div>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">العلامة التجارية</label>
              <select 
                value={selectedBrand} 
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
              >
                <option value="">الكل</option>
                {BRANDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">التقييم</label>
              <div className="flex gap-2 flex-wrap">
                {[4, 3, 2, 1].map(star => (
                  <button
                    key={star}
                    onClick={() => setMinRating(star === minRating ? 0 : star)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-colors ${minRating === star ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Star className={`w-4 h-4 ${minRating === star ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                    <span>{star}+</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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

        {/* Top Stores Section */}
        <div className="pt-4 pb-2 border-b border-slate-200 bg-white">
          <div className="flex justify-between items-center mb-3 px-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" />
              أفضل المتاجر
            </h2>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">عرض الكل</button>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 pb-2 snap-x hide-scrollbar">
            {TOP_STORES.map(store => (
              <div 
                key={store.id} 
                onClick={() => navigate('/marketplace')} // In a real app, navigate to store profile
                className="flex-shrink-0 w-[72px] flex flex-col items-center snap-start cursor-pointer group"
              >
                <div className="relative w-16 h-16 mb-2">
                  <img 
                    src={store.logo} 
                    alt={store.name} 
                    className="w-full h-full rounded-full object-cover border-2 border-slate-100 group-hover:border-blue-500 transition-colors shadow-sm" 
                  />
                  {store.verified && (
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <h3 className="text-[11px] font-bold text-slate-800 text-center line-clamp-1 w-full leading-tight">{store.name}</h3>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-bold text-slate-600">{store.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Offers */}
        <div className="p-2 md:p-4 border-b border-slate-200 bg-blue-50/30">
          <div className="flex justify-between items-center mb-3 px-2">
            <h2 className="text-lg font-bold text-blue-900">عروض اليوم / خصومات 🔥</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">عرض الكل</button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-2 pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[140px] bg-white rounded-lg shadow-sm border border-blue-100 overflow-hidden flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow">
                <div className="aspect-square bg-slate-100 relative">
                  <img src={`https://picsum.photos/seed/offer${i}/200/200`} alt="Offer" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    -20%
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-sm font-semibold text-slate-900 truncate">منتج مخفض {i}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-bold text-blue-600">150 ج.م</p>
                    <p className="text-xs text-slate-400 line-through">200 ج.م</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="p-2 md:p-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-3 px-2">منتجات مميزة (Top Picks)</h2>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                  <Skeleton className="w-full aspect-square mb-2" />
                  <Skeleton className="w-3/4 h-4 mb-2" />
                  <Skeleton className="w-1/2 h-4" />
                </div>
              ))}
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
