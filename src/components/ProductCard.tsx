import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export interface Product {
  id: string;
  title: string;
  price: string;
  location: string;
  image: string;
  category: string;
  condition: string;
  seller: {
    name: string;
    avatar: string;
    joined: string;
  };
  description: string;
}

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/marketplace/item/${product.id}`} className="group cursor-pointer">
      <div className="aspect-square overflow-hidden rounded-lg mb-2 bg-slate-100">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="px-1">
        <p className="font-semibold text-slate-900 leading-tight">{product.price}</p>
        <p className="text-sm text-slate-700 truncate">{product.title}</p>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {product.location}
        </p>
      </div>
    </Link>
  );
}
