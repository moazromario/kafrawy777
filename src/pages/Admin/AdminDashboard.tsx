import React, { useEffect, useState } from 'react';
import { 
  Users, Calendar, CreditCard, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Package, 
  Activity, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { fetchAdminStats } from '../../services/api';
import { motion } from 'framer-motion';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const data = [
    { name: 'السبت', bookings: 40, revenue: 2400 },
    { name: 'الأحد', bookings: 30, revenue: 1398 },
    { name: 'الاثنين', bookings: 20, revenue: 9800 },
    { name: 'الثلاثاء', bookings: 27, revenue: 3908 },
    { name: 'الأربعاء', bookings: 18, revenue: 4800 },
    { name: 'الخميس', bookings: 23, revenue: 3800 },
    { name: 'الجمعة', bookings: 34, revenue: 4300 },
  ];

  const pieData = [
    { name: 'غرف', value: 400 },
    { name: 'خدمات', value: 300 },
    { name: 'فعاليات', value: 300 },
  ];

  const cards = [
    { label: 'إجمالي المستخدمين', value: stats.totalUsers, icon: Users, color: 'blue', trend: '+12%' },
    { label: 'إجمالي الحجوزات', value: stats.totalBookings, icon: Calendar, color: 'green', trend: '+5%' },
    { label: 'إجمالي الإيرادات', value: `${stats.totalRevenue} ج.م`, icon: CreditCard, color: 'amber', trend: '+18%' },
    { label: 'الخدمات المتاحة', value: stats.totalItems, icon: Package, color: 'purple', trend: '0%' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg group hover:border-blue-500/50 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-${card.color}-500/10 text-${card.color}-500 group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-500 flex items-center gap-1`}>
                <ArrowUpRight className="w-3 h-3" />
                {card.trend}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{card.label}</h3>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              تحليل الإيرادات والحجوزات
            </h3>
            <select className="bg-gray-700 border-none text-xs rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500">
              <option>آخر 7 أيام</option>
              <option>آخر 30 يوم</option>
            </select>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            توزيع الحجوزات
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-6">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span className="text-gray-400">{item.name}</span>
                </div>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            آخر الأنشطة
          </h3>
          <button className="text-blue-500 text-sm font-medium hover:underline">عرض الكل</button>
        </div>
        <div className="divide-y divide-gray-700">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="p-6 flex items-center justify-between hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-100">تم تأكيد حجز جديد</p>
                  <p className="text-sm text-gray-500">من قبل المستخدم: محمد أحمد • منذ 5 دقائق</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-500">+450 ج.م</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">محفظة</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
