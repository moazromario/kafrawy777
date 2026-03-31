import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Briefcase, 
  CreditCard, 
  Settings, 
  Bell, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  ShieldCheck,
  BarChart3,
  History,
  ChevronLeft,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#EA580C', '#EF4444', '#F97316', '#FB923C'];

export default function AdminDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPass, setAdminPass] = useState('');

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchStats();
    }
  }, [isAdminLoggedIn]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-id': user.id }
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      toast.error('خطأ في تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass === 'Mdhg0109022901@#$') {
      setIsAdminLoggedIn(true);
      toast.success('مرحباً بك في لوحة التحكم');
    } else {
      toast.error('كلمة المرور غير صحيحة');
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-8 text-center"
        >
          <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">لوحة تحكم الأدمن</h2>
            <p className="text-gray-500">يرجى إدخال كلمة المرور للمتابعة</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input
              type="password"
              placeholder="كلمة المرور"
              className="w-full bg-gray-50 border-none rounded-2xl py-5 px-6 text-center text-lg font-bold tracking-widest focus:ring-2 focus:ring-orange-500 transition-all"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
            />
            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-5 rounded-3xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-200"
            >
              دخول
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading || !stats) return <div className="h-96 flex items-center justify-center animate-pulse text-gray-400">جاري التحميل...</div>;

  const chartData = [
    { name: 'السبت', revenue: 4000, bookings: 24 },
    { name: 'الأحد', revenue: 3000, bookings: 18 },
    { name: 'الاثنين', revenue: 2000, bookings: 12 },
    { name: 'الثلاثاء', revenue: 2780, bookings: 20 },
    { name: 'الأربعاء', revenue: 1890, bookings: 15 },
    { name: 'الخميس', revenue: 2390, bookings: 22 },
    { name: 'الجمعة', revenue: 3490, bookings: 26 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-500">إحصائيات وتحليل أداء النظام بالكامل</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white px-6 py-3 rounded-2xl border border-gray-100 text-gray-600 font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
            <Plus size={18} />
            إضافة خدمة
          </button>
          <button className="bg-orange-600 px-6 py-3 rounded-2xl text-white font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 flex items-center gap-2">
            <Bell size={18} />
            إرسال إشعار
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي الإيرادات', value: stats.totalRevenue, icon: CreditCard, color: 'orange', trend: '+12.5%' },
          { label: 'إجمالي الحجوزات', value: stats.totalBookings, icon: BarChart3, color: 'blue', trend: '+8.2%' },
          { label: 'المستخدمين', value: stats.totalUsers, icon: Users, color: 'green', trend: '+5.4%' },
          { label: 'الكباتن', value: stats.totalCaptains, icon: Car, color: 'purple', trend: '+2.1%' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-6"
          >
            <div className="flex justify-between items-start">
              <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                <stat.icon size={28} />
              </div>
              <div className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                <TrendingUp size={12} />
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
              <div className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">تحليل الإيرادات</h3>
            <select className="bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-600 px-4 py-2">
              <option>آخر 7 أيام</option>
              <option>آخر 30 يوم</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA580C" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  itemStyle={{color: '#EA580C', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#EA580C" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">توزيع الخدمات</h3>
            <BarChart3 size={20} className="text-gray-400" />
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="bookings" fill="#EA580C" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <History size={24} className="text-orange-600" />
            سجل النشاطات الأخيرة
          </h3>
          <button className="text-orange-600 font-bold text-sm hover:underline flex items-center gap-1">
            عرض الكل <ChevronLeft size={16} />
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <LayoutDashboard size={24} />
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">تحديث حالة حجز #BK-8829</div>
                  <div className="text-xs text-gray-400">بواسطة: superadmin • منذ 5 دقائق</div>
                </div>
              </div>
              <div className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-widest">
                Update
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
