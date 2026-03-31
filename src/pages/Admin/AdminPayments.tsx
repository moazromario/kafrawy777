import React, { useEffect, useState } from 'react';
import { 
  CreditCard, Search, Filter, MoreVertical, 
  CheckCircle, XCircle, Clock, Wallet, 
  Smartphone, User, ChevronRight, ChevronLeft,
  AlertCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { fetchAdminPayments, updateAdminPayment } from '../../services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await fetchAdminPayments();
      setPayments(data);
    } catch (err) {
      toast.error('فشل تحميل المدفوعات');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateAdminPayment(id, { status });
      toast.success('تم تحديث حالة الدفع بنجاح');
      loadPayments();
    } catch (err) {
      toast.error('فشل تحديث الحالة');
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.transaction_ref?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
            placeholder="بحث بالاسم أو رقم العملية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pr-11 pl-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">كل الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="completed">مكتمل</option>
            <option value="failed">فاشل</option>
          </select>
          <button className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-lg shadow-amber-900/40">
            <CreditCard className="w-5 h-5" />
            <span>تسوية يدوية</span>
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right">
            <thead className="bg-gray-900/50 border-b border-gray-700 text-gray-400 text-sm font-medium">
              <tr>
                <th className="px-6 py-4">المستخدم</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">الطريقة</th>
                <th className="px-6 py-4">النوع</th>
                <th className="px-6 py-4">رقم العملية</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${payment.user_id}`} alt="" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-100">{payment.profiles?.full_name}</p>
                        <p className="text-xs text-gray-500 font-mono">{payment.user_id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-lg ${payment.type === 'deposit' ? 'text-green-500' : 'text-blue-500'}`}>
                      {payment.amount} ج.م
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      {payment.method === 'vodafone_cash' ? (
                        <><Smartphone className="w-4 h-4 text-red-500" /> فودافون كاش</>
                      ) : (
                        <><Wallet className="w-4 h-4 text-blue-500" /> المحفظة</>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                      payment.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {payment.type === 'deposit' ? 'شحن رصيد' : 'دفع حجز'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-sm">
                    {payment.transaction_ref || '---'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 w-fit ${
                      payment.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                      payment.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {payment.status === 'completed' ? <CheckCircle className="w-3 h-3" /> :
                       payment.status === 'failed' ? <XCircle className="w-3 h-3" /> :
                       <Clock className="w-3 h-3" />}
                      {payment.status === 'completed' ? 'مكتمل' :
                       payment.status === 'failed' ? 'فاشل' : 'قيد المراجعة'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {payment.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(payment.id, 'completed')}
                            className="p-2 hover:bg-green-500/10 text-green-500 rounded-lg transition-colors"
                            title="قبول العملية"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(payment.id, 'failed')}
                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                            title="رفض العملية"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
