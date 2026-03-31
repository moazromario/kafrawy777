import React, { useState } from 'react';
import { Search, Filter, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onFilterChange }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleFilterSubmit = () => {
    onFilterChange({ minRating, location });
    setIsFilterOpen(false);
  };

  const handleReset = () => {
    setMinRating(0);
    setLocation('');
    onFilterChange({ minRating: 0, location: '' });
    setIsFilterOpen(false);
  };

  return (
    <div className="relative mb-8">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن صنايعي، مدرس، أو طبيب..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pr-12 pl-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`p-4 rounded-2xl border transition-all duration-300 ${
            isFilterOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          <Filter size={24} />
        </motion.button>
      </form>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 z-50"
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-slate-900">تصفية النتائج</h4>
              <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">الموقع / المنطقة</label>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="مثلاً: سيدي سالم، دسوق..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-3">الحد الأدنى للتقييم</label>
              <div className="flex gap-2">
                {[4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setMinRating(rating)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                      minRating === rating 
                        ? 'bg-yellow-50 border-yellow-500 text-yellow-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {rating}+ نجوم
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleFilterSubmit}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                تطبيق الفلاتر
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                إعادة ضبط
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
