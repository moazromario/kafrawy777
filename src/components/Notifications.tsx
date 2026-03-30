"use client";
import React from 'react';
import MainLayout from './MainLayout';
import { Bell, Heart, MessageCircle, UserPlus, Store } from 'lucide-react';

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      type: 'like',
      user: 'أحمد محمد',
      avatar: 'https://picsum.photos/seed/user1/50/50',
      content: 'أعجب بمنشورك.',
      time: 'منذ ساعتين',
      read: false,
      icon: <Heart className="w-4 h-4 text-white" />,
      iconBg: 'bg-red-500'
    },
    {
      id: 2,
      type: 'comment',
      user: 'سارة أحمد',
      avatar: 'https://picsum.photos/seed/user2/50/50',
      content: 'علق على صورتك: "صورة رائعة!"',
      time: 'منذ 3 ساعات',
      read: false,
      icon: <MessageCircle className="w-4 h-4 text-white" />,
      iconBg: 'bg-green-500'
    },
    {
      id: 3,
      type: 'friend_request',
      user: 'محمد علي',
      avatar: 'https://picsum.photos/seed/user3/50/50',
      content: 'أرسل لك طلب صداقة.',
      time: 'منذ 5 ساعات',
      read: true,
      icon: <UserPlus className="w-4 h-4 text-white" />,
      iconBg: 'bg-blue-500'
    },
    {
      id: 4,
      type: 'marketplace',
      user: 'محمود حسن',
      avatar: 'https://picsum.photos/seed/user4/50/50',
      content: 'أضاف منتجاً جديداً في السوق.',
      time: 'منذ يوم واحد',
      read: true,
      icon: <Store className="w-4 h-4 text-white" />,
      iconBg: 'bg-orange-500'
    }
  ];

  return (
    <MainLayout>
      <div className="bg-white min-h-screen md:min-h-0 md:rounded-lg shadow-sm" dir="rtl">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center sticky top-14 md:top-0 bg-white z-10 md:rounded-t-lg">
          <h1 className="text-2xl font-bold text-slate-900">الإشعارات</h1>
          <button className="text-blue-600 font-semibold text-sm hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors">
            تحديد الكل كمقروء
          </button>
        </div>
        
        <div className="divide-y divide-slate-100">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}
            >
              <div className="relative shrink-0">
                <img 
                  src={notification.avatar} 
                  alt={notification.user} 
                  className="w-14 h-14 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white ${notification.iconBg}`}>
                  {notification.icon}
                </div>
              </div>
              
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-[15px] text-slate-900 leading-snug">
                  <span className="font-bold">{notification.user}</span>{' '}
                  {notification.content}
                </p>
                <p className="text-sm text-blue-600 font-semibold mt-1">
                  {notification.time}
                </p>
              </div>
              
              {!notification.read && (
                <div className="w-3 h-3 bg-blue-600 rounded-full shrink-0 mt-3"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
