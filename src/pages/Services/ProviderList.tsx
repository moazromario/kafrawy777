import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Filter, Search, Loader2, AlertCircle } from 'lucide-react';
import { servicesApi, ServiceProvider, ServiceCategory } from '../../services/servicesApi';
import ServiceCard from '../../components/Services/ServiceCard';
import SearchBar from '../../components/Services/SearchBar';
import KafrawyLayout from '../../components/KafrawyLayout';
import { toast } from 'sonner';

const ProviderList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as ServiceCategory | null;
  const minRatingParam = searchParams.get('minRating') ? parseInt(searchParams.get('minRating')!) : 0;

  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ minRating: minRatingParam, location: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, count: 0 });

  const fetchProviders = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await servicesApi.getProviders({
        category: categoryParam || undefined,
        search: searchQuery,
        minRating: filters.minRating,
        location: filters.location,
        page,
        limit: 9
      });
      setProviders(result.data);
      setPagination({
        page: result.page,
        totalPages: result.totalPages,
        count: result.count
      });
    } catch (err: any) {
      const msg = err.message || 'حدث خطأ أثناء جلب البيانات';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders(1);
  }, [categoryParam, searchQuery, filters]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProviders(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full">
        <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/services" className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
            <ArrowRight size={24} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {categoryParam ? `قائمة ${categoryParam}` : 'جميع مقدمي الخدمات'}
            </h1>
            <p className="text-slate-500 text-sm">اكتشف أفضل المتخصصين في كفر البطيخ</p>
          </div>
        </div>

        <SearchBar 
          onSearch={(q) => setSearchQuery(q)} 
          onFilterChange={(f) => setFilters({ ...filters, ...f })} 
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-bold">جاري البحث عن أفضل النتائج...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-8 rounded-3xl border border-red-100 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-900 mb-2">حدث خطأ ما</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => fetchProviders(1)}
              className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : providers.length > 0 ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {providers.map((provider) => (
                  <ServiceCard key={provider.id} provider={provider} />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination UI */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  <ArrowRight size={20} className="rotate-180" />
                </button>
                
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show only current page, first, last, and pages around current
                  if (
                    pageNum === 1 || 
                    pageNum === pagination.totalPages || 
                    (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-12 h-12 rounded-2xl font-bold transition-all ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    (pageNum === 2 && pagination.page > 3) || 
                    (pageNum === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 2)
                  ) {
                    return <span key={pageNum} className="text-slate-400">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center"
          >
            <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={48} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد نتائج</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">لم نجد أي مقدم خدمة يطابق بحثك حالياً. جرب تغيير كلمات البحث أو الفلاتر.</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilters({ minRating: 0, location: '' });
              }}
              className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors"
            >
              عرض جميع الخدمات
            </button>
          </motion.div>
        )}
        </div>
      </div>
    </KafrawyLayout>
  );
};

export default ProviderList;
