import React from 'react';
import { motion } from 'motion/react';
import { Wrench, GraduationCap, Scale, Calculator, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ServiceCategory } from '../../services/servicesApi';

const categories: { name: ServiceCategory; icon: React.ReactNode; color: string; bg: string }[] = [
  { name: 'صنايعية', icon: <Wrench size={24} />, color: 'text-orange-600', bg: 'bg-orange-50' },
  { name: 'مدرسين', icon: <GraduationCap size={24} />, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'محامين', icon: <Scale size={24} />, color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'محاسبين', icon: <Calculator size={24} />, color: 'text-green-600', bg: 'bg-green-50' },
  { name: 'أطباء', icon: <Stethoscope size={24} />, color: 'text-red-600', bg: 'bg-red-50' },
];

const CategoryGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {categories.map((category, index) => (
        <motion.div
          key={category.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to={`/services/list?category=${category.name}`}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group"
          >
            <div className={`w-16 h-16 ${category.bg} ${category.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              {category.icon}
            </div>
            <span className="text-lg font-bold text-slate-800">{category.name}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default CategoryGrid;
