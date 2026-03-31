import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, CreditCard, Wallet, 
  Settings, LogOut, Bell, Shield, Activity, 
  Menu, X, ChevronLeft, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { id: 'dashboard', label: 'لوحة المعلومات', icon: LayoutDashboard, path: '/admin' },
  { id: 'users', label: 'المستخدمين', icon: Users, path: '/admin/users' },
  { id: 'bookings', label: 'الحجوزات', icon: Calendar, path: '/admin/bookings' },
  { id: 'payments', label: 'المدفوعات', icon: CreditCard, path: '/admin/payments' },
  { id: 'items', label: 'الخدمات والفئات', icon: Package, path: '/admin/items' },
  { id: 'notifications', label: 'الإشعارات', icon: Bell, path: '/admin/notifications' },
  { id: 'audit', label: 'سجل الأنشطة', icon: Activity, path: '/admin/audit', superOnly: true },
  { id: 'settings', label: 'الإعدادات العامة', icon: Settings, path: '/admin/settings', superOnly: true },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin_user');
    if (!storedAdmin) {
      navigate('/admin/login');
    } else {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-gray-800 border-l border-gray-700 flex flex-col z-50 relative shadow-2xl"
      >
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight">كفراوي أدمن</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            if (item.superOnly && admin.role !== 'super_admin') return null;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group relative ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-blue-400 transition-colors'}`} />
                {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                {!sidebarOpen && (
                  <div className="absolute right-full mr-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] border border-gray-700">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-gray-900/50 mb-4 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-inner">
              {admin.username[0].toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{admin.username}</p>
                <p className="text-xs text-gray-500 truncate uppercase tracking-widest">
                  {admin.role === 'super_admin' ? 'مدير عام' : 'مدير نظام'}
                </p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors group ${!sidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span className="font-medium">تسجيل الخروج</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-gray-800/50 backdrop-blur-md border-b border-gray-700 flex items-center justify-between px-8 z-40">
          <h1 className="text-xl font-bold text-gray-100">
            {menuItems.find(i => i.path === location.pathname)?.label || 'لوحة التحكم'}
          </h1>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <button className="p-2.5 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-800"></span>
              </button>
            </div>
            <div className="h-8 w-px bg-gray-700"></div>
            <div className="flex items-center gap-3">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold">{admin.username}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">متصل الآن</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${admin.username}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-900/50">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
