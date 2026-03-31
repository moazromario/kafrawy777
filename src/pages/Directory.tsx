import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  Briefcase, 
  Wrench, 
  ChevronLeft, 
  Star, 
  MapPin, 
  Clock, 
  Search, 
  Filter,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchDirectory } from '../services/api';

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'service' | 'vehicle' | 'project';
  image_url: string;
  category?: string;
  status?: string;
  location?: string;
}

export default function Directory({ filter }: { filter?: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(filter || 'all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await fetchDirectory();
      
      const combined: Item[] = [
        ...(data.services || []).map((s: any) => ({ ...s, type: 'service' })),
        ...(data.vehicles || []).map((v: any) => ({ ...v, title: v.model, type: 'vehicle' })),
        ...(data.projects || []).map((p: any) => ({ ...p, type: 'project' }))
      ];
      
      setItems(combined);
    } catch (err) {
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const tabs = [
    { id: 'all', name: 'الكل', icon: Filter },
    { id: 'vehicle', name: 'خدمات النقل', icon: Car },
    { id: 'service', name: 'خدمات', icon: Wrench },
    { id: 'project', name: 'مشاريع', icon: Briefcase },
  ];

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-gray-100" />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-600 to-red-600 p-8 sm:p-12 text-white shadow-2xl shadow-orange-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-2xl"
        >
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            كل ما تحتاجه في مكان واحد
          </h1>
          <p className="text-orange-100 text-lg mb-8 opacity-90">
            تصفح دليل الخدمات، احجز رحلتك، أو تابع مشاريعك بكل سهولة وسرعة.
          </p>
          
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-300 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="ابحث عن خدمة، سيارة، أو مشروع..."
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-4 pr-12 pl-4 text-white placeholder:text-orange-200 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </motion.div>
        
        {/* Decorative Circles */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl" />
      </section>

      {/* Tabs */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-orange-600 shadow-lg shadow-orange-100 border border-orange-100"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <tab.icon size={18} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, idx) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100 transition-all cursor-pointer"
              onClick={() => navigate(`/booking/${item.type}/${item.id}`)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image_url || `https://picsum.photos/seed/${item.id}/800/600`}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                  {item.type === 'vehicle' ? 'خدمات النقل' : item.type === 'service' ? 'خدمة' : 'مشروع'}
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-lg font-bold text-orange-600">
                    {item.price} ج.م
                  </div>
                </div>
                
                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-gray-600">4.9</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>فوري</span>
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-xs font-medium text-orange-600 flex items-center gap-1">
                    احجز الآن <ChevronLeft size={14} />
                  </span>
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <ArrowRight size={16} className="rotate-180" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-300" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد نتائج</h3>
          <p className="text-gray-500">جرب البحث بكلمات أخرى أو تغيير التصنيف</p>
        </div>
      )}
    </div>
  );
}
