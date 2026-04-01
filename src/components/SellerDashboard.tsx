import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Bell, 
  Settings, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  PlusCircle, 
  Package, 
  Clock, 
  CheckCircle2,
  ShoppingBag,
  List
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import MainLayout from './MainLayout';

// Mock Data
const stats = {
  daily: 1250,
  weekly: 8400,
  monthly: 32000,
  ordersToday: 5
};

const topProductsData = [
  { name: 'منتج أ', sales: 400 },
  { name: 'منتج ب', sales: 300 },
  { name: 'منتج ج', sales: 200 },
  { name: 'منتج د', sales: 150 },
];

const dailyProfitsData = [
  { day: 'السبت', profit: 1000 },
  { day: 'الأحد', profit: 1200 },
  { day: 'الاثنين', profit: 900 },
  { day: 'الثلاثاء', profit: 1500 },
  { day: 'الأربعاء', profit: 1250 },
];

const mockOrders = [
  { id: 'KFW-1001', customer: 'أحمد محمود', total: 450, status: 'new', time: 'منذ 10 دقائق', items: 2 },
  { id: 'KFW-1002', customer: 'سارة علي', total: 1200, status: 'new', time: 'منذ 45 دقيقة', items: 1 },
  { id: 'KFW-1003', customer: 'محمد حسن', total: 300, status: 'processing', time: 'منذ ساعتين', items: 3 },
  { id: 'KFW-1004', customer: 'فاطمة إبراهيم', total: 850, status: 'completed', time: 'أمس', items: 1 },
];

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'new' | 'processing' | 'completed'>('new');

  const filteredOrders = mockOrders.filter(order => order.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'جديد';
      case 'processing': return 'جاري التجهيز';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen md:rounded-lg md:shadow-sm md:mt-4 pb-24 md:pb-8" dir="rtl">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/marketplace')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors -mr-2">
              <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">إلكترونيات كفراوي</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-700" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <Settings className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/marketplace/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
            >
              <PlusCircle className="w-6 h-6" />
              إضافة منتج
            </button>
            <button 
              onClick={() => navigate('/marketplace/manage-products')}
              className="bg-white hover:bg-slate-50 text-slate-800 font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-slate-200 shadow-sm"
            >
              <List className="w-6 h-6 text-blue-600" />
              إدارة المنتجات
            </button>
          </div>

          {/* Stats Grid */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">إحصائيات المبيعات</h2>
            <div className="grid grid-cols-2 gap-3">
              {/* Daily */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">اليوم</span>
                </div>
                <p className="text-2xl font-black text-slate-900">{stats.daily.toLocaleString()} <span className="text-sm font-normal text-slate-500">ج.م</span></p>
                <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +15% عن الأمس
                </p>
              </div>

              {/* Weekly */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">هذا الأسبوع</span>
                </div>
                <p className="text-2xl font-black text-slate-900">{stats.weekly.toLocaleString()} <span className="text-sm font-normal text-slate-500">ج.م</span></p>
              </div>

              {/* Monthly (Full Width) */}
              <div className="col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-xl shadow-sm text-white flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 text-slate-300 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">مبيعات الشهر</span>
                  </div>
                  <p className="text-3xl font-black">{stats.monthly.toLocaleString()} <span className="text-sm font-normal text-slate-400">ج.م</span></p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">أكثر المنتجات مبيعاً</h3>
              <div className="h-64 min-h-[256px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">الأرباح اليومية</h3>
              <div className="h-64 min-h-[256px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyProfitsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="profit" stroke="#2563eb" fill="#bfdbfe" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-slate-900">إدارة الطلبات</h2>
              <span className="text-sm text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-lg">
                {stats.ordersToday} طلبات اليوم
              </span>
            </div>

            {/* Tabs */}
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 mb-4 shadow-sm">
              <button 
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'new' ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Package className="w-4 h-4" />
                جديدة
                {mockOrders.filter(o => o.status === 'new').length > 0 && (
                  <span className="w-5 h-5 bg-amber-500 text-white rounded-full text-[10px] flex items-center justify-center ml-1">
                    {mockOrders.filter(o => o.status === 'new').length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('processing')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'processing' ? 'bg-blue-100 text-blue-800' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Clock className="w-4 h-4" />
                جارية
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'completed' ? 'bg-green-100 text-green-800' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                مكتملة
              </button>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900">{order.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">العميل: <span className="font-medium text-slate-900">{order.customer}</span></p>
                      </div>
                      <div className="text-left">
                        <p className="font-black text-blue-600">{order.total} ج.م</p>
                        <p className="text-xs text-slate-400 mt-1">{order.time}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-500">{order.items} منتجات</p>
                      <button 
                        onClick={() => navigate(`/marketplace/seller/order/${order.id}`)}
                        className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="font-bold text-slate-700">لا توجد طلبات {getStatusText(activeTab)}</p>
                  <p className="text-sm text-slate-500 mt-1">ستظهر الطلبات هنا فور وصولها.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
