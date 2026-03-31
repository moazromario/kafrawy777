import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Search, Home, Loader2, Star, MapPin } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Link } from 'react-router-dom';

// Types
interface Category {
  id: number;
  name_ar: string;
  name_en: string | null;
  parent_id: number | null;
  icon: string | null;
  image: string | null;
  is_active: boolean;
  children?: Category[];
}

interface Service {
  id: number;
  name: string;
  category_id: number;
  description: string;
  location: string;
  rating: number;
}

// Helper to render dynamic lucide icons
const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} />;
};

export default function CategoriesSystem() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation State
  const [currentPath, setCurrentPath] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Fetch initial tree
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Fetch services when a category is selected
  useEffect(() => {
    if (currentPath.length > 0) {
      const currentCat = currentPath[currentPath.length - 1];
      // Only fetch services if it's a leaf node (no children) or we just want to show services anyway
      if (!currentCat.children || currentCat.children.length === 0) {
        setServicesLoading(true);
        fetch(`/api/categories/${currentCat.id}/services`)
          .then(res => res.json())
          .then(data => {
            setServices(data);
            setServicesLoading(false);
          })
          .catch(err => {
            console.error(err);
            setServicesLoading(false);
          });
      } else {
        setServices([]);
      }
    } else {
      setServices([]);
    }
  }, [currentPath]);

  // Determine which categories to show based on current path and search
  const displayedCategories = useMemo(() => {
    let currentLevel = categories;
    
    if (currentPath.length > 0) {
      currentLevel = currentPath[currentPath.length - 1].children || [];
    }

    if (searchQuery) {
      // Flatten tree for search
      const flatten = (cats: Category[]): Category[] => {
        return cats.reduce((acc: Category[], cat) => {
          const match = cat.name_ar.includes(searchQuery) || (cat.name_en && cat.name_en.toLowerCase().includes(searchQuery.toLowerCase()));
          if (match) acc.push(cat);
          if (cat.children) acc.push(...flatten(cat.children));
          return acc;
        }, []);
      };
      return flatten(categories);
    }

    return currentLevel;
  }, [categories, currentPath, searchQuery]);

  const handleCategoryClick = (category: Category) => {
    if (searchQuery) {
      // If searching, clicking should jump to that category's path
      // For simplicity, we just set it as the current path
      setCurrentPath([category]);
      setSearchQuery('');
    } else {
      setCurrentPath(prev => [...prev, category]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(prev => prev.slice(0, index + 1));
  };

  const goHome = () => {
    setCurrentPath([]);
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  const currentCategory = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
  const isLeaf = currentCategory && (!currentCategory.children || currentCategory.children.length === 0);

  return (
    <div className="min-h-screen bg-slate-50 w-full pb-24" dir="rtl">
      {/* Header & Search */}
      <div className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg mb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">دليل الخدمات الشامل</h1>
          
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن مطعم، صيدلية، مكتبة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-200 rounded-2xl py-4 px-12 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumbs */}
        {!searchQuery && (
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 text-sm font-medium text-slate-600 whitespace-nowrap">
            <button onClick={goHome} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              <Home size={16} /> الرئيسية
            </button>
            
            {currentPath.map((cat, index) => (
              <React.Fragment key={cat.id}>
                <ChevronLeft size={16} className="text-slate-400 shrink-0" />
                <button 
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`hover:text-blue-600 transition-colors ${index === currentPath.length - 1 ? 'text-blue-600 font-bold' : ''}`}
                >
                  {cat.name_ar}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Categories Grid */}
        {(!isLeaf || searchQuery) && (
          <motion.div 
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12"
          >
            <AnimatePresence mode="popLayout">
              {displayedCategories.map(category => (
                <motion.button
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all flex flex-col items-center justify-center gap-4 group"
                >
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <DynamicIcon name={category.icon || 'Folder'} className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-center">{category.name_ar}</h3>
                  {category.name_en && (
                    <span className="text-xs text-slate-400">{category.name_en}</span>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
            
            {displayedCategories.length === 0 && searchQuery && (
              <div className="col-span-full py-12 text-center text-slate-500">
                لا توجد نتائج مطابقة لبحثك "{searchQuery}"
              </div>
            )}
          </motion.div>
        )}

        {/* Services List (Shows when a leaf category is selected) */}
        {isLeaf && !searchQuery && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-4">
              الخدمات المتاحة في {currentCategory.name_ar}
            </h2>
            
            {servicesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(service => (
                  <div key={service.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-slate-900">{service.name}</h3>
                      <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg text-sm font-bold">
                        <Star size={14} className="fill-current" />
                        {service.rating}
                      </div>
                    </div>
                    
                    <p className="text-slate-600">{service.description}</p>
                    
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-auto pt-4 border-t border-slate-50">
                      <MapPin size={16} />
                      {service.location}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-500">
                <DynamicIcon name={currentCategory.icon || 'Folder'} className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg">لا توجد خدمات مسجلة في هذا القسم حالياً</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
