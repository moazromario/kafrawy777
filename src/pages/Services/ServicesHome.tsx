import React from 'react';
import { motion } from 'motion/react';
import { Plus, Briefcase, Star, Search, Car, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import CategoryGrid from '../../components/Services/CategoryGrid';
import SearchBar from '../../components/Services/SearchBar';
import KafrawyLayout from '../../components/KafrawyLayout';

const ServicesHome: React.FC = () => {
  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full">
        <div className="max-w-7xl mx-auto px-4 pt-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 mb-10 text-white relative overflow-hidden shadow-xl shadow-blue-200"
        >
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">دليل خدمات كفر البطيخ</h1>
            <p className="text-blue-100 text-lg mb-8 max-w-xl">ابحث عن أفضل الصنايعية، المدرسين، والأطباء في منطقتك بكل سهولة وثقة.</p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                to="/services/register"
                className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg"
              >
                <Plus size={20} />
                سجل كمقدم خدمة
              </Link>
              <Link
                to="/services/list"
                className="bg-blue-500/30 backdrop-blur-sm text-white border border-blue-400/30 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-500/40 transition-colors"
              >
                <Search size={20} />
                تصفح الكل
              </Link>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
        </motion.div>

        {/* Search Bar */}
        <SearchBar onSearch={(q) => console.log(q)} onFilterChange={(f) => console.log(f)} />

        {/* Categories Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">الأقسام الرئيسية</h2>
            <Link 
              to="/services/list" 
              className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl font-black text-sm hover:bg-blue-100 transition-all group shadow-sm border border-blue-100/50"
            >
              عرض الكل (النظام الشامل)
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
          <CategoryGrid />
        </div>

          {/* Featured Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6 group"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Car size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">كفراوي جو</h3>
                <p className="text-slate-500 mb-4">احجز رحلتك داخل كفر البطيخ بأمان وسرعة.</p>
                <Link to="/kafrawy-go" className="text-blue-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  احجز الآن
                  <span className="text-lg">←</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6 group"
            >
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Briefcase size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">الوظائف</h3>
                <p className="text-slate-500 mb-4">ابحث عن وظيفة أحلامك أو أعلن عن وظيفة شاغرة.</p>
                <Link to="/services/jobs" className="text-blue-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  استكشف الوظائف
                  <span className="text-lg">←</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6 group"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Briefcase size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">أفضل الصنايعية</h3>
                <p className="text-slate-500 mb-4">تصفح قائمة بأمهر الفنيين والعمال في كفر البطيخ بتقييمات حقيقية.</p>
                <Link to="/services/list?category=صنايعية" className="text-blue-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  استكشف الآن
                  <span className="text-lg">←</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6 group"
            >
              <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Star size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">الأعلى تقييماً</h3>
                <p className="text-slate-500 mb-4">اكتشف مقدمي الخدمات الذين حصلوا على أعلى التقييمات من أهالي كفر البطيخ.</p>
                <Link to="/services/list?minRating=4" className="text-blue-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  شاهد القائمة
                  <span className="text-lg">←</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </KafrawyLayout>
  );
};

export default ServicesHome;
