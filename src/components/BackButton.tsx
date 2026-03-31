import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(-1)}
      className="p-2 rounded-full hover:bg-slate-100 transition"
    >
      <ChevronRight className="w-6 h-6 text-slate-700" />
    </button>
  );
}
