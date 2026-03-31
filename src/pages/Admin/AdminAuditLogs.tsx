import React, { useEffect, useState } from 'react';
import { 
  Activity, Search, Filter, Clock, 
  User, Database, Shield, ChevronRight, 
  ChevronLeft, AlertCircle, Info, Trash2,
  Edit2, Plus, LogIn, LogOut
} from 'lucide-react';
import { fetchAdminAuditLogs } from '../../services/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await fetchAdminAuditLogs();
      setLogs(data);
    } catch (err) {
      toast.error('فشل تحميل سجل الأنشطة');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.admins?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l.entity_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return <Plus className="w-4 h-4 text-green-500" />;
    if (action.includes('update')) return <Edit2 className="w-4 h-4 text-blue-500" />;
    if (action.includes('delete')) return <Trash2 className="w-4 h-4 text-red-500" />;
    if (action.includes('login')) return <LogIn className="w-4 h-4 text-amber-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

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
            placeholder="بحث في السجلات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pr-11 pl-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all">
            <Filter className="w-5 h-5" />
            <span>تصفية متقدمة</span>
          </button>
          <button 
            onClick={loadLogs}
            className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all"
          >
            <Activity className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right">
            <thead className="bg-gray-900/50 border-b border-gray-700 text-gray-400 text-sm font-medium">
              <tr>
                <th className="px-6 py-4">الأدمن</th>
                <th className="px-6 py-4">الإجراء</th>
                <th className="px-6 py-4">الكيان</th>
                <th className="px-6 py-4">الوقت</th>
                <th className="px-6 py-4">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-100">{log.admins?.username}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{log.admins?.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="text-sm font-bold text-gray-200">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-400">{log.entity_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="w-4 h-4" />
                      {new Date(log.created_at).toLocaleString('ar-EG', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-500 hover:text-blue-500 transition-all">
                      <Info className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-6 bg-gray-900/50 border-t border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500">عرض {filteredLogs.length} من أصل {logs.length} سجل</p>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 disabled:opacity-50" disabled>
              <ChevronRight className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">1</button>
            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
