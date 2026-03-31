import React from 'react';
import { Home, Users, PlusSquare, Bell, Menu, Search, MessageCircle, Store, Briefcase, Moon, Wrench, Calendar, Wallet, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  return (
    <div className="h-full w-full flex flex-col bg-slate-100" dir="rtl">
      {/* Top App Bar */}
      <header className="bg-white shadow-sm z-50 h-14 md:h-16 flex-shrink-0 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/feed" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl hover:bg-blue-700 transition-colors">
            ك
          </Link>
          <div className="hidden md:flex items-center bg-slate-100 rounded-full px-3 py-2 w-64">
            <Search className="w-4 h-4 text-slate-500" />
            <input type="text" placeholder="ابحث في كفراوي" className="bg-transparent border-none focus:outline-none ml-2 mr-2 text-sm w-full" />
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:flex items-center justify-center flex-1 h-full max-w-2xl px-12 gap-2">
          <NavTab to="/feed" icon={<Home />} active={location.pathname === '/feed'} />
          <NavTab to="/friends" icon={<Users />} active={location.pathname === '/friends'} />
          <NavTab to="/marketplace" icon={<Store />} active={location.pathname.startsWith('/marketplace')} />
          <NavTab to="/services" icon={<Wrench />} active={location.pathname.startsWith('/services')} />
          <NavTab to="/bookings" icon={<Calendar />} active={location.pathname.startsWith('/bookings')} />
          <NavTab to="/wallet" icon={<Wallet />} active={location.pathname === '/wallet'} />
          <NavTab to="/admin" icon={<LayoutDashboard />} active={location.pathname === '/admin'} />
          <NavTab to="/jobs" icon={<Briefcase />} active={location.pathname.startsWith('/jobs')} />
          <NavTab to="/islamiat" icon={<Moon />} active={location.pathname === '/islamiat'} />
        </div>

        <div className="flex items-center gap-2">
          <button className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors md:hidden">
            <PlusSquare className="w-5 h-5 text-slate-700" />
          </button>
          <button className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors md:hidden">
            <Search className="w-5 h-5 text-slate-700" />
          </button>
          <Link to="/chat" className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${location.pathname === '/chat' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <MessageCircle className="w-5 h-5" />
          </Link>
          <Link to="/notifications" className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${location.pathname === '/notifications' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <Bell className="w-5 h-5" />
          </Link>
          <Link to="/profile" className="hidden md:block w-10 h-10 rounded-full overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity">
            <img src="https://picsum.photos/seed/user/100/100" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </Link>
        </div>
      </header>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden w-full relative custom-scrollbar">
        <div className={`${location.pathname === '/profile' ? 'max-w-6xl' : 'max-w-2xl'} mx-auto w-full px-0 md:px-4 py-4 pb-20 md:pb-8`}>
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="bg-white border-t border-slate-200 flex justify-around items-center h-16 flex-shrink-0 md:hidden z-50">
        <NavItem to="/feed" icon={<Home />} active={location.pathname === '/feed'} />
        <NavItem to="/marketplace" icon={<Store />} active={location.pathname.startsWith('/marketplace')} />
        <NavItem to="/bookings" icon={<Calendar />} active={location.pathname.startsWith('/bookings')} />
        <NavItem to="/services" icon={<Wrench />} active={location.pathname.startsWith('/services')} />
        <NavItem to="/islamiat" icon={<Moon />} active={location.pathname === '/islamiat'} />
        <NavItem to="/profile" icon={<Menu />} active={location.pathname === '/profile'} />
      </nav>
    </div>
  );
}

function NavTab({ to, icon, active }: { to: string, icon: React.ReactNode, active: boolean }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center justify-center w-full h-full border-b-4 transition-colors ${
        active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:bg-slate-50 rounded-lg my-1'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6 ${active ? 'fill-blue-600' : ''}` })}
    </Link>
  );
}

function NavItem({ to, icon, active }: { to: string, icon: React.ReactNode, active: boolean }) {
  return (
    <Link to={to} className={`flex flex-col items-center justify-center w-full h-full ${active ? 'text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: `w-7 h-7 ${active ? 'fill-blue-100' : ''}` })}
    </Link>
  );
}
