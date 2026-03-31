import React, { useEffect, useState } from 'react';
import { 
  Users, Search, Filter, MoreVertical, 
  CheckCircle, XCircle, Edit2, Trash2, 
  Shield, User, Wallet, Mail, Calendar,
  ChevronRight, ChevronLeft
} from 'lucide-react';
import { fetchAdminUsers, updateAdminUser } from '../../services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      toast.error('فشل تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      await updateAdminUser(user.id, { is_active: !user.is_active });
      toast.success(`تم ${user.is_active ? 'تعطيل' : 'تفعيل'} المستخدم بنجاح`);
      loadUsers();
    } catch (err) {
      toast.error('فشل تحديث الحالة');
    }
  };

  const handleUpdateRole = async (user: any, role: string) => {
    try {
      await updateAdminUser(user.id, { role });
      toast.success('تم تحديث الصلاحيات بنجاح');
      loadUsers();
      setShowEdit(false);
    } catch (err) {
      toast.error('فشل تحديث الصلاحيات');
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث عن مستخدم بالاسم أو المعرف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pr-11 pl-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-colors">
            <Filter className="w-5 h-5 text-gray-400" />
            <span>تصفية</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-900/40">
            <Users className="w-5 h-5" />
            <span>إضافة مستخدم</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right">
            <thead className="bg-gray-900/50 border-b border-gray-700 text-gray-400 text-sm font-medium">
              <tr>
                <th className="px-6 py-4">المستخدم</th>
                <th className="px-6 py-4">الصلاحية</th>
                <th className="px-6 py-4">الرصيد</th>
                <th className="px-6 py-4">تاريخ الانضمام</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-100">{user.full_name}</p>
                        <p className="text-xs text-gray-500 font-mono">{user.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-amber-500 font-bold">
                      <Wallet className="w-4 h-4" />
                      {user.wallets?.[0]?.balance || 0} ج.م
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        user.is_active 
                          ? 'bg-green-500/10 text-green-500 hover:bg-red-500/10 hover:text-red-500' 
                          : 'bg-red-500/10 text-red-500 hover:bg-green-500/10 hover:text-green-500'
                      }`}
                    >
                      {user.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.is_active ? 'نشط' : 'معطل'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedUser(user); setShowEdit(true); }}
                        className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-6 bg-gray-900/50 border-t border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500">عرض {filteredUsers.length} من أصل {users.length} مستخدم</p>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 disabled:opacity-50" disabled>
              <ChevronRight className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">1</button>
            <button className="px-4 py-2 hover:bg-gray-700 rounded-lg text-sm font-bold">2</button>
            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEdit && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-bold">تعديل صلاحيات المستخدم</h3>
                <button onClick={() => setShowEdit(false)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-blue-500/50">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.id}`} alt="" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{selectedUser.full_name}</p>
                    <p className="text-sm text-gray-500">معرف: {selectedUser.id.substring(0, 12)}...</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-400">تغيير الصلاحيات</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleUpdateRole(selectedUser, 'user')}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        selectedUser.role === 'user' 
                          ? 'bg-blue-600/10 border-blue-600 text-blue-500' 
                          : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <User className="w-8 h-8" />
                      <span className="font-bold">مستخدم عادي</span>
                    </button>
                    <button 
                      onClick={() => handleUpdateRole(selectedUser, 'admin')}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        selectedUser.role === 'admin' 
                          ? 'bg-purple-600/10 border-purple-600 text-purple-500' 
                          : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <Shield className="w-8 h-8" />
                      <span className="font-bold">مدير نظام</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-900/50 border-t border-gray-700 flex justify-end gap-4">
                <button 
                  onClick={() => setShowEdit(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => setShowEdit(false)}
                  className="px-8 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all"
                >
                  حفظ التغييرات
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
