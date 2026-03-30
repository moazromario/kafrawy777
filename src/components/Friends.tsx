"use client";
import React, { useState, useEffect } from 'react';
import { Search, UserPlus, UserCheck, UserX, UserMinus, Loader2, Users } from 'lucide-react';
import { useCommunity, Profile, Friendship } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import MainLayout from './MainLayout';

export default function Friends() {
  const { user } = useAuth();
  const { 
    friendships, 
    loading, 
    sendFriendRequest, 
    acceptFriendRequest, 
    deleteFriendship, 
    searchProfiles 
  } = useCommunity();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'discover'>('friends');

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const delayDebounceFn = setTimeout(async () => {
        setIsSearching(true);
        const results = await searchProfiles(searchQuery);
        setSearchResults(results.filter(p => p.id !== user?.id));
        setIsSearching(false);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, user?.id]);

  const getFriendshipStatus = (profileId: string) => {
    const friendship = friendships.find(f => f.user_id === profileId || f.friend_id === profileId);
    if (!friendship) return null;
    return friendship;
  };

  const acceptedFriends = (friendships || []).filter(f => f.status === 'accepted');
  const pendingRequests = (friendships || []).filter(f => f.status === 'pending' && f.friend_id === user?.id);
  const sentRequests = (friendships || []).filter(f => f.status === 'pending' && f.user_id === user?.id);

  return (
    <MainLayout>
      <div className="p-4 bg-white shadow-sm md:rounded-lg mb-4" dir="rtl">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="text-blue-600" />
          الأصدقاء
        </h1>

        <div className="flex border-b border-slate-200 mb-4">
          <button 
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'friends' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
          >
            أصدقائي ({acceptedFriends?.length || 0})
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'requests' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
          >
            الطلبات ({pendingRequests?.length || 0})
          </button>
          <button 
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'discover' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
          >
            اكتشاف
          </button>
        </div>

        {activeTab === 'discover' && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="ابحث عن أشخاص..." 
                className="w-full bg-slate-100 border-none rounded-full py-3 pr-10 pl-4 focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="mt-4 space-y-3">
              {isSearching ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin text-blue-600" />
                </div>
              ) : (searchResults?.length || 0) > 0 ? (
                searchResults.map(profile => (
                  <ProfileCard 
                    key={profile.id} 
                    profile={profile} 
                    friendship={getFriendshipStatus(profile.id)}
                    onAdd={() => sendFriendRequest(profile.id)}
                    onAccept={(id) => acceptFriendRequest(id)}
                    onRemove={(id) => deleteFriendship(id)}
                    currentUserId={user?.id || ''}
                  />
                ))
              ) : (searchQuery?.length || 0) > 1 ? (
                <p className="text-center text-slate-500 py-4">لم يتم العثور على نتائج</p>
              ) : (
                <p className="text-center text-slate-500 py-4 italic">ابدأ البحث للعثور على أصدقاء جدد</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-3">
            {(acceptedFriends?.length || 0) > 0 ? (
              acceptedFriends.map(f => {
                const friendProfile = f.user_id === user?.id ? f.friend : f.user;
                if (!friendProfile) return null;
                return (
                  <ProfileCard 
                    key={f.id} 
                    profile={friendProfile} 
                    friendship={f}
                    onRemove={() => deleteFriendship(f.id)}
                    currentUserId={user?.id || ''}
                  />
                );
              })
            ) : (
              <div className="text-center py-10 text-slate-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>ليس لديك أصدقاء بعد. ابدأ باكتشاف أشخاص جدد!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">طلبات واردة</h3>
              {(pendingRequests?.length || 0) > 0 ? (
                pendingRequests.map(f => (
                  <ProfileCard 
                    key={f.id} 
                    profile={f.user!} 
                    friendship={f}
                    onAccept={() => acceptFriendRequest(f.id)}
                    onRemove={() => deleteFriendship(f.id)}
                    currentUserId={user?.id || ''}
                  />
                ))
              ) : (
                <p className="text-slate-400 text-sm italic">لا توجد طلبات صداقة واردة</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">طلبات مرسلة</h3>
              {(sentRequests?.length || 0) > 0 ? (
                sentRequests.map(f => (
                  <ProfileCard 
                    key={f.id} 
                    profile={f.friend!} 
                    friendship={f}
                    onRemove={() => deleteFriendship(f.id)}
                    currentUserId={user?.id || ''}
                  />
                ))
              ) : (
                <p className="text-slate-400 text-sm italic">لا توجد طلبات صداقة مرسلة</p>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

const ProfileCard: React.FC<{ 
  profile: Profile, 
  friendship: Friendship | null,
  onAdd?: () => void,
  onAccept?: (id: string) => void,
  onRemove?: (id: string) => void,
  currentUserId: string
}> = ({ 
  profile, 
  friendship, 
  onAdd, 
  onAccept, 
  onRemove,
  currentUserId
}) => {
  return (
    <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3">
        <img 
          src={profile.avatar_url || 'https://picsum.photos/seed/user/100/100'} 
          alt={profile.full_name} 
          className="w-12 h-12 rounded-full object-cover border border-slate-200"
          referrerPolicy="no-referrer"
        />
        <div>
          <h4 className="font-bold text-slate-900">{profile.full_name}</h4>
          {profile.bio && <p className="text-xs text-slate-500 line-clamp-1">{profile.bio}</p>}
        </div>
      </div>

      <div className="flex gap-2">
        {!friendship && onAdd && (
          <button 
            onClick={onAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        )}

        {friendship?.status === 'pending' && friendship.friend_id === currentUserId && onAccept && (
          <>
            <button 
              onClick={() => onAccept(friendship.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>قبول</span>
            </button>
            <button 
              onClick={() => onRemove?.(friendship.id)}
              className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-300 transition-colors"
            >
              <UserX className="w-4 h-4" />
              <span>رفض</span>
            </button>
          </>
        )}

        {friendship?.status === 'pending' && friendship.user_id === currentUserId && (
          <button 
            onClick={() => onRemove?.(friendship.id)}
            className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-300 transition-colors"
          >
            <UserX className="w-4 h-4" />
            <span>إلغاء الطلب</span>
          </button>
        )}

        {friendship?.status === 'accepted' && (
          <button 
            onClick={() => onRemove?.(friendship.id)}
            className="bg-slate-100 text-slate-500 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors group"
          >
            <UserMinus className="w-4 h-4" />
            <span className="group-hover:hidden">صديق</span>
            <span className="hidden group-hover:inline">إزالة</span>
          </button>
        )}
      </div>
    </div>
  );
}
