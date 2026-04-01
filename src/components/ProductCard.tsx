import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ShoppingCart } from 'lucide-react';

export interface Product {
  id: string;
  title: string;
  price: string;
  location: string;
  image: string;
  category: string;
  condition: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    joined: string;
  };
  description: string;
  rating?: number;
  reviewsCount?: number;
  brand?: string;
  salesCount?: number;
}

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/marketplace/item/${product.id}`} className="group cursor-pointer">
      <div className="aspect-square overflow-hidden rounded-lg mb-2 bg-slate-100 relative">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {product.brand && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            {product.brand}
          </div>
        )}
      </div>
      <div className="px-1">
        <div className="flex justify-between items-start">
          <p className="font-bold text-blue-600 leading-tight">{product.price}</p>
          {product.rating && (
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] font-bold">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-slate-700 truncate mt-0.5 font-medium">{product.title}</p>
        
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[80px]">{product.location}</span>
          </p>
          {product.salesCount !== undefined && product.salesCount > 0 && (
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <ShoppingCart className="w-3 h-3" />
              <span>{product.salesCount} بيع</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
