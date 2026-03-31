import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  MapPin, 
  Phone, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Navigation, 
  ChevronLeft, 
  History, 
  Wallet,
  Bell,
  Settings,
  User as UserIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function CaptainDashboard({ user }: { user: any }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/captain/orders/${user.id}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      toast.error('خطأ في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/captain/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('خطأ في تحديث الحالة');
      toast.success(`تم تحديث الحالة إلى ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error('خطأ في تحديث الحالة');
    }
  };

  const filteredOrders = orders.filter(o => 
    activeTab === 'active' ? (o.status === 'pending' || o.status === 'accepted' || o.status === 'ongoing') : o.status === 'completed'
  );

  if (loading) return <div className="h-96 flex items-center justify-center animate-pulse text-gray-400">جاري التحميل...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">أهلاً كابتن، {user?.full_name}</h1>
          <p className="text-gray-500">لديك {orders.filter(o => o.status === 'pending').length} طلبات جديدة بانتظارك</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
              <Car size={24} />
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">إجمالي الرحلات</span>
          </div>
          <div className="text-4xl font-bold text-gray-900">{orders.length} <span className="text-xl font-medium text-gray-400">رحلة</span></div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">أرباح اليوم</span>
          </div>
          <div className="text-4xl font-bold text-gray-900">850 <span className="text-xl font-medium text-gray-400">ج.م</span></div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Clock size={24} />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">ساعات العمل</span>
          </div>
          <div className="text-4xl font-bold text-gray-900">6.5 <span className="text-xl font-medium text-gray-400">ساعة</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-100 pb-4">
        <button
          onClick={() => setActiveTab('active')}
          className={cn(
            "text-sm font-bold transition-all relative",
            activeTab === 'active' ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
          )}
        >
          الطلبات النشطة
          {activeTab === 'active' && <motion.div layoutId="tab" className="absolute -bottom-4 left-0 right-0 h-1 bg-orange-600 rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "text-sm font-bold transition-all relative",
            activeTab === 'history' ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
          )}
        >
          سجل الرحلات
          {activeTab === 'history' && <motion.div layoutId="tab" className="absolute -bottom-4 left-0 right-0 h-1 bg-orange-600 rounded-full" />}
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order) => (
            <motion.div
              layout
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/30 space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <UserIcon size={28} />
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-gray-900">{order.profiles?.full_name}</div>
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      <Phone size={14} />
                      {order.profiles?.phone}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">قيمة الرحلة</div>
                  <div className="text-2xl font-bold text-orange-600">{order.total_price} ج.م</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-y border-gray-50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">موقع الالتقاء</div>
                    <div className="font-bold text-gray-700">{order.pickup_location || 'غير محدد'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                    <Navigation size={20} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">الوجهة</div>
                    <div className="font-bold text-gray-700">{order.dropoff_location || 'غير محدد'}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(order.id, 'accepted')}
                      className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      قبول الطلب
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, 'cancelled')}
                      className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} />
                      رفض
                    </button>
                  </>
                )}
                {order.status === 'accepted' && (
                  <button
                    onClick={() => updateStatus(order.id, 'ongoing')}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Navigation size={20} />
                    بدء الرحلة
                  </button>
                )}
                {order.status === 'ongoing' && (
                  <button
                    onClick={() => updateStatus(order.id, 'completed')}
                    className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    إنهاء الرحلة
                  </button>
                )}
                {order.status === 'completed' && (
                  <div className="w-full text-center py-4 text-green-600 font-bold bg-green-50 rounded-2xl">
                    تم إكمال الرحلة بنجاح
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredOrders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200 text-gray-400">
            لا توجد رحلات حالية
          </div>
        )}
      </div>
    </div>
  );
}
