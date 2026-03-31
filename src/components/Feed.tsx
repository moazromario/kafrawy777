"use client";
import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ArrowLeft } from 'lucide-react';
import MainLayout from './MainLayout';
import Stories from './Stories';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import { useCommunity } from '../context/CommunityContext';

export default function Feed() {
  const { posts } = useCommunity();

  return (
    <MainLayout>
      <Stories />
      
      {/* Services Quick Access Banner */}
      <div className="bg-white p-4 shadow-sm md:rounded-lg mb-4 border border-blue-100 bg-gradient-to-r from-blue-50 to-white overflow-hidden relative group">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <Wrench size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900">دليل خدمات كفر البطيخ</h3>
              <p className="text-xs text-slate-500 font-bold">ابحث عن صنايعي، مدرس، أو طبيب في منطقتك</p>
            </div>
          </div>
          <Link 
            to="/services" 
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-100"
          >
            استكشف الآن
            <ArrowLeft size={16} />
          </Link>
        </div>
        {/* Decorative background elements */}
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl"></div>
        <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-blue-600/5 rounded-full blur-xl"></div>
      </div>

      <CreatePost />
      <div className="flex flex-col">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </MainLayout>
  );
}
