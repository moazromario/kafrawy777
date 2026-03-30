import React from 'react';
import { ThumbsUp, MessageSquare, UserPlus, MoreHorizontal } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  { 
    id: 1, 
    user: 'أحمد محمد', 
    action: 'أعجب بمنشورك.', 
    time: 'منذ 10 دقائق', 
    icon: ThumbsUp, 
    color: 'bg-blue-600', 
    unread: true, 
    avatar: 'https://picsum.photos/seed/ahmed/100/100' 
  },
  { 
    id: 2, 
    user: 'سارة محمود', 
    action: 'علقت على صورتك: "ما شاء الله جميل جداً!"', 
    time: 'منذ ساعتين', 
    icon: MessageSquare, 
    color: 'bg-green-500', 
    unread: true, 
    avatar: 'https://picsum.photos/seed/sara/100/100' 
  },
  { 
    id: 3, 
    user: 'محمود علي', 
    action: 'أرسل لك طلب صداقة.', 
    time: 'أمس', 
    icon: UserPlus, 
    color: 'bg-slate-800', 
    unread: false, 
    avatar: 'https://picsum.photos/seed/mahmoud/100/100' 
  },
  { 
    id: 4, 
    user: 'إدارة كفراوي', 
    action: 'مرحباً بك في تطبيق كفراوي! استكشف السوق والوظائف الآن.', 
    time: 'منذ 3 أيام', 
    icon: MessageSquare, 
    color: 'bg-blue-600', 
    unread: false, 
    avatar: 'https://ui-avatars.com/api/?name=K&background=0D8ABC&color=fff' 
  },
];

export default function Notifications() {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white min-h-screen md:rounded-lg md:shadow-sm md:mt-2 overflow-hidden pb-20 md:pb-0">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold text-slate-900">الإشعارات</h1>
        <button className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
          <MoreHorizontal className="w-5 h-5 text-slate-900" />
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {MOCK_NOTIFICATIONS.map(notif => (
          <div 
            key={notif.id} 
            className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
              notif.unread ? 'bg-blue-50/50' : 'hover:bg-slate-50'
            }`}
          >
            <div className="relative">
              <img src={notif.avatar} alt={notif.user} className="w-16 h-16 rounded-full object-cover border border-slate-200" />
              <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center ${notif.color}`}>
                <notif.icon className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-slate-900 text-base leading-relaxed">
                <span className="font-bold">{notif.user}</span> {notif.action}
              </p>
              <p className={`text-sm mt-1 ${notif.unread ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                {notif.time}
              </p>
            </div>
            {notif.unread && (
              <div className="w-3 h-3 bg-blue-600 rounded-full mt-3"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
