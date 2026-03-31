import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  Smartphone, 
  Plus, 
  History, 
  Bell, 
  Settings,
  Car,
  Briefcase,
  Wrench,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function UserDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [transactionRef, setTransactionRef] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [walletRes, ordersRes] = await Promise.all([
        fetch(`/api/wallet/${user.id}`),
        fetch(`/api/captain/orders/${user.id}`) // Reusing for user orders for now
      ]);
      const walletData = await walletRes.json();
      const ordersData = await ordersRes.json();
      setWallet(walletData);
      setOrders(ordersData);
    } catch (err) {
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || !transactionRef) {
      toast.error('يرجى إدخال المبلغ ورقم العملية');
      return;
    }
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: Number(depositAmount),
          transactionRef
        })
      });
      if (!res.ok) throw new Error('خطأ في الإيداع');
      toast.success('تم إرسال طلب الإيداع بنجاح');
      setIsDepositOpen(false);
      fetchData();
    } catch (err) {
      toast.error('خطأ في الإيداع');
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center animate-pulse text-gray-400">جاري التحميل...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">أهلاً، {user?.full_name}</h1>
          <p className="text-gray-500">مرحباً بك في لوحة التحكم الخاصة بك</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white p-3 rounded-2xl border border-gray-100 text-gray-500 hover:text-orange-600 transition-all">
            <Bell size={20} />
          </button>
          <button className="bg-white p-3 rounded-2xl border border-gray-100 text-gray-500 hover:text-orange-600 transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-orange-600 to-red-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-orange-200 relative overflow-hidden"
        >
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-center">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Wallet size={24} />
              </div>
              <button
                onClick={() => setIsDepositOpen(true)}
                className="bg-white text-orange-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-50 transition-all flex items-center gap-2"
              >
                <Plus size={14} />
                شحن الرصيد
              </button>
            </div>
            <div className="space-y-1">
              <span className="text-orange-100 text-sm font-medium opacity-80">رصيدك الحالي</span>
              <div className="text-4xl font-bold">{wallet?.balance || 0} <span className="text-xl font-medium">ج.م</span></div>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </motion.div>

        {/* Orders Stats */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <History size={24} />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">إجمالي الطلبات</span>
          </div>
          <div className="text-4xl font-bold text-gray-900">{orders.length} <span className="text-xl font-medium text-gray-400">طلب</span></div>
        </div>

        {/* Active Orders */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">طلبات نشطة</span>
          </div>
          <div className="text-4xl font-bold text-gray-900">
            {orders.filter(o => o.status === 'ongoing' || o.status === 'pending').length} 
            <span className="text-xl font-medium text-gray-400"> نشط</span>
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="space-y-6">
        <div className="flex gap-4 border-b border-gray-100 pb-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={cn(
              "text-sm font-bold transition-all relative",
              activeTab === 'orders' ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            طلباتي الأخيرة
            {activeTab === 'orders' && <motion.div layoutId="tab" className="absolute -bottom-4 left-0 right-0 h-1 bg-orange-600 rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={cn(
              "text-sm font-bold transition-all relative",
              activeTab === 'transactions' ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            سجل المعاملات
            {activeTab === 'transactions' && <motion.div layoutId="tab" className="absolute -bottom-4 left-0 right-0 h-1 bg-orange-600 rounded-full" />}
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' ? (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {orders.length > 0 ? orders.map((order) => (
                  <div key={order.id} className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-orange-200 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center",
                        order.entity_type === 'vehicle' ? "bg-orange-50 text-orange-600" : 
                        order.entity_type === 'service' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                      )}>
                        {order.entity_type === 'vehicle' ? <Car size={28} /> : 
                         order.entity_type === 'service' ? <Wrench size={28} /> : <Briefcase size={28} />}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-lg">
                          {order.entity_type === 'vehicle' ? 'رحلة نقل' : 
                           order.entity_type === 'service' ? 'طلب خدمة' : 'مشروع داخلي'}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <Clock size={14} />
                          {new Date(order.created_at).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <div className="text-sm text-gray-400">المبلغ</div>
                        <div className="font-bold text-gray-900">{order.total_price} ج.م</div>
                      </div>
                      <div className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold",
                        order.status === 'completed' ? "bg-green-50 text-green-600" : 
                        order.status === 'pending' ? "bg-yellow-50 text-yellow-600" : 
                        order.status === 'cancelled' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {order.status === 'completed' ? 'مكتمل' : 
                         order.status === 'pending' ? 'قيد الانتظار' : 
                         order.status === 'cancelled' ? 'ملغي' : 'جاري التنفيذ'}
                      </div>
                      <button className="text-gray-400 hover:text-orange-600 transition-colors">
                        <ChevronLeft size={20} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
                    لا توجد طلبات حالية
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="transactions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Mock Transactions */}
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        i % 2 === 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      )}>
                        {i % 2 === 0 ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{i % 2 === 0 ? 'إيداع رصيد' : 'دفع حجز'}</div>
                        <div className="text-xs text-gray-400">24 مارس 2024</div>
                      </div>
                    </div>
                    <div className={cn("font-bold text-lg", i % 2 === 0 ? "text-green-600" : "text-red-600")}>
                      {i % 2 === 0 ? '+' : '-'}{i * 100} ج.م
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {isDepositOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDepositOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 relative z-10 shadow-2xl space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">شحن عبر فودافون كاش</h3>
                <p className="text-gray-500 text-sm">قم بتحويل المبلغ إلى الرقم <span className="font-bold text-red-600">01012345678</span> ثم أدخل البيانات أدناه</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 mr-2">المبلغ المراد شحنه</label>
                  <input
                    type="number"
                    placeholder="مثال: 500"
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-orange-500 transition-all"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 mr-2">رقم العملية / المرجع</label>
                  <input
                    type="text"
                    placeholder="أدخل رقم العملية المرسل في الرسالة"
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-orange-500 transition-all"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setIsDepositOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeposit}
                  className="flex-[2] bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
                >
                  تأكيد الإرسال
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
