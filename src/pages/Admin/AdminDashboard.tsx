import React, { useEffect, useState } from 'react';
import { fetchAdminStats } from '../../services/api';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  const data = [
    { name: 'السبت', bookings: 12, revenue: 1200 },
    { name: 'الأحد', bookings: 19, revenue: 2100 },
    { name: 'الاثنين', bookings: 15, revenue: 1800 },
    { name: 'الثلاثاء', bookings: 22, revenue: 2500 },
    { name: 'الأربعاء', bookings: 30, revenue: 3500 },
    { name: 'الخميس', bookings: 25, revenue: 2800 },
    { name: 'الجمعة', bookings: 18, revenue: 1900 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">لوحة تحكم الإدارة</h1>
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          تحديث مباشر
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="إجمالي الحجوزات" value={stats.totalBookings} icon={<Calendar className="w-6 h-6 text-blue-600" />} trend="+12%" isUp={true} />
        <StatCard title="إجمالي الإيرادات" value={`${stats.totalRevenue} ج.م`} icon={<DollarSign className="w-6 h-6 text-green-600" />} trend="+8%" isUp={true} />
        <StatCard title="المستخدمين النشطين" value={stats.totalUsers} icon={<Users className="w-6 h-6 text-purple-600" />} trend="+15%" isUp={true} />
        <StatCard title="معدل الإلغاء" value="4%" icon={<ArrowDownRight className="w-6 h-6 text-red-600" />} trend="-2%" isUp={false} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">نمو الحجوزات الأسبوعي</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">تحليل الإيرادات</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6">آخر الحجوزات</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="text-slate-400 text-sm border-b border-slate-50">
                <th className="pb-4 font-semibold">المستخدم</th>
                <th className="pb-4 font-semibold">الخدمة</th>
                <th className="pb-4 font-semibold">التاريخ</th>
                <th className="pb-4 font-semibold">المبلغ</th>
                <th className="pb-4 font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-bold text-slate-900">أحمد محمد</td>
                  <td className="py-4 text-slate-600">جناح ملكي</td>
                  <td className="py-4 text-slate-500 text-sm">2024-03-31</td>
                  <td className="py-4 font-bold text-blue-600">2500 ج.م</td>
                  <td className="py-4">
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold">مؤكد</span>
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

function StatCard({ title, value, icon, trend, isUp }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-xl">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
          {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trend}
        </div>
      </div>
      <h3 className="text-slate-500 text-sm font-semibold mb-1">{title}</h3>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </motion.div>
  );
}
