import React from 'react';
import { motion } from 'motion/react';
import { Star, MapPin, Phone, MessageCircle, CheckCircle } from 'lucide-react';
import { ServiceProvider } from '../../services/servicesApi';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
  provider: ServiceProvider;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ provider }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300"
    >
      <Link to={`/services/provider/${provider.id}`} className="block">
        <div className="relative h-48 bg-slate-100 overflow-hidden">
          {provider.avatar_url ? (
            <img
              src={provider.avatar_url}
              alt={provider.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
              <span className="text-4xl font-bold">{provider.name.charAt(0)}</span>
            </div>
          )}
          {provider.is_verified && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-1 rounded-full text-blue-600 shadow-sm">
              <CheckCircle size={20} fill="currentColor" className="text-white" />
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
            {provider.category}
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{provider.name}</h3>
            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
              <Star size={14} className="text-yellow-500 fill-current mr-1" />
              <span className="text-sm font-bold text-yellow-700">{provider.rating || '0.0'}</span>
            </div>
          </div>
          
          <p className="text-sm text-blue-600 font-medium mb-3">{provider.title}</p>
          
          <div className="flex items-center text-slate-500 text-sm mb-4">
            <MapPin size={14} className="ml-1" />
            <span>{provider.location}</span>
          </div>

          <div className="flex gap-2">
            <a
              href={`tel:${provider.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-slate-700 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              <Phone size={16} />
              اتصال
            </a>
            {provider.whatsapp && (
              <a
                href={`https://wa.me/${provider.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 py-2 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors"
              >
                <MessageCircle size={16} />
                واتساب
              </a>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ServiceCard;
