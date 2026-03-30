"use client";
import React from 'react';
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
      <CreatePost />
      <div className="flex flex-col">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </MainLayout>
  );
}
