import React from 'react';
import { Search, Edit, MoreVertical } from 'lucide-react';

const MOCK_CHATS = [
  {
    id: 1,
    name: 'أحمد محمد',
    avatar: 'https://picsum.photos/seed/ahmed/100/100',
    lastMessage: 'تمام، هكلمك لما أوصل.',
    time: '10:30 ص',
    unread: 2
  },
  {
    id: 2,
    name: 'سارة محمود',
    avatar: 'https://picsum.photos/seed/sara/100/100',
    lastMessage: 'هل المنتج لسه متاح؟',
    time: 'أمس',
    unread: 0
  },
  {
    id: 3,
    name: 'محمود علي',
    avatar: 'https://picsum.photos/seed/mahmoud/100/100',
    lastMessage: 'شكراً جداً يا غالي',
    time: 'الجمعة',
    unread: 0
  }
];

export default function Chat() {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white min-h-screen md:rounded-lg md:shadow-sm md:mt-2 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-slate-900">الدردشات</h1>
        <div className="flex gap-2">
          <button className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
            <Edit className="w-5 h-5 text-slate-900" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="ابحث في الرسائل..." 
            className="w-full bg-slate-100 text-slate-900 rounded-full py-2 pr-10 pl-4 outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {MOCK_CHATS.map(chat => (
          <div key={chat.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="relative">
              <img src={chat.avatar} alt={chat.name} className="w-14 h-14 rounded-full object-cover" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className={`font-semibold truncate ${chat.unread > 0 ? 'text-slate-900' : 'text-slate-800'}`}>
                  {chat.name}
                </h3>
                <span className={`text-xs whitespace-nowrap ms-2 ${chat.unread > 0 ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                  {chat.time}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className={`text-sm truncate ${chat.unread > 0 ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                  {chat.lastMessage}
                </p>
                {chat.unread > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full ms-2">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
