import React, { useEffect } from 'react';
import { Home, Store, Briefcase, MessageCircle, User, Search, Bell, Menu, Wrench } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import socket from '../services/socket';

const WatermelonLogo = () => (
  <div className="relative w-8 h-4 md:w-10 md:h-5 overflow-hidden">
    {/* Rind (Green) */}
    <div className="absolute inset-0 bg-emerald-600 rounded-b-full"></div>
    {/* White layer */}
    <div className="absolute inset-[1px] md:inset-[2px] bg-white rounded-b-full"></div>
    {/* Flesh (Red) */}
    <div className="absolute inset-[3px] md:inset-[4px] bg-rose-500 rounded-b-full flex justify-center items-start pt-0.5 gap-0.5 md:gap-1">
      {/* Seeds */}
      <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-slate-900 rounded-full mt-0.5"></div>
      <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-slate-900 rounded-full"></div>
      <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-slate-900 rounded-full mt-0.5"></div>
    </div>
  </div>
);

export default function KafrawyLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    // Global KafrawyGo Notifications
    const handleNewRideRequest = (ride: any) => {
      // Only show if not already on driver dashboard
      if (!location.pathname.includes('/driver-dashboard')) {
        toast.info('طلب رحلة جديد بالقرب منك!', {
          description: `من: ${ride.pickup} إلى: ${ride.destination}`,
          action: {
            label: 'عرض',
            onClick: () => window.location.href = '/kafrawy-go/driver-dashboard'
          }
        });
      }
    };

    const handleRideResponse = ({ response }: any) => {
      if (!location.pathname.includes('/matching')) {
        toast.success('كابتن جديد قدم عرضاً لرحلتك!', {
          description: `${response.driverName} عرض ${response.price} ج.م`,
          action: {
            label: 'التفاصيل',
            onClick: () => window.location.href = '/kafrawy-go/matching'
          }
        });
      }
    };

    const handleRideMatched = (ride: any) => {
      toast.success('تم تأكيد الرحلة!', {
        description: 'الكابتن في الطريق إليك الآن.',
      });
    };

    const handleRideCancelled = ({ cancelledBy }: any) => {
      toast.error('تم إلغاء الرحلة', {
        description: cancelledBy === 'driver' ? 'قام الكابتن بإلغاء الرحلة.' : 'قام العميل بإلغاء الرحلة.'
      });
    };

    const handleReceiveMessage = (data: any) => {
      // Don't show toast if chat is likely open (we can't know for sure here, but we can guess based on active ride page)
      toast('رسالة جديدة', {
        description: data.message,
        icon: <MessageCircle className="w-4 h-4 text-blue-500" />
      });
    };

    socket.on('new_ride_request', handleNewRideRequest);
    socket.on('ride_response', handleRideResponse);
    socket.on('ride_matched', handleRideMatched);
    socket.on('ride_cancelled', handleRideCancelled);
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('new_ride_request', handleNewRideRequest);
      socket.off('ride_response', handleRideResponse);
      socket.off('ride_matched', handleRideMatched);
      socket.off('ride_cancelled', handleRideCancelled);
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [location.pathname]);

  const NavItem = ({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) => (
    <Link 
      to={to} 
      className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
        active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { 
        className: `w-6 h-6 ${active ? 'fill-blue-600/20' : ''}` 
      })}
      <span className="text-[10px] font-medium">{label}</span>
      {active && <div className="absolute top-0 w-12 h-1 bg-blue-600 rounded-b-full" />}
    </Link>
  );

  const DesktopNavTab = ({ to, icon, active }: { to: string, icon: React.ReactNode, active: boolean }) => (
    <Link 
      to={to} 
      className={`relative flex items-center justify-center flex-1 h-full transition-colors rounded-lg mx-1 ${
        active ? 'text-blue-600' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { 
        className: `w-7 h-7 ${active ? 'fill-blue-600/20' : ''}` 
      })}
      {active && <div className="absolute bottom-0 w-full h-1 bg-blue-600 rounded-t-full" />}
    </Link>
  );

  return (
    <div className="h-full w-full flex flex-col bg-slate-100 text-slate-900" dir="rtl">
      {/* Top Navbar (Desktop & Mobile) */}
      <header className="z-50 bg-white shadow-sm h-14 md:h-16 flex-shrink-0 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <WatermelonLogo />
            <span className="text-2xl md:text-3xl font-black text-blue-600 tracking-tighter">كفراوي</span>
          </Link>
          <div className="hidden md:flex items-center bg-slate-100 rounded-full px-3 py-2 ms-2">
            <Search className="w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="ابحث في كفراوي..." 
              className="bg-transparent border-none outline-none text-sm ms-2 w-48"
            />
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:flex items-center justify-center flex-1 h-full max-w-2xl px-12">
          <DesktopNavTab to="/" icon={<Home />} active={location.pathname === '/'} />
          <DesktopNavTab to="/marketplace" icon={<Store />} active={location.pathname.startsWith('/marketplace')} />
          <DesktopNavTab to="/services" icon={<Wrench />} active={location.pathname.startsWith('/services')} />
          <DesktopNavTab to="/jobs" icon={<Briefcase />} active={location.pathname.startsWith('/jobs')} />
          <DesktopNavTab to="/chat" icon={<MessageCircle />} active={location.pathname.startsWith('/chat')} />
        </div>

        <div className="flex items-center gap-2">
          <button className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors md:hidden">
            <Search className="w-5 h-5 text-slate-900" />
          </button>
          <Link to="/notifications" className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative ${location.pathname === '/notifications' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}>
            <Bell className={`w-5 h-5 ${location.pathname === '/notifications' ? 'fill-blue-600/20' : ''}`} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </Link>
          <button className="hidden md:flex w-10 h-10 bg-slate-100 rounded-full items-center justify-center hover:bg-slate-200 transition-colors">
            <Menu className="w-5 h-5 text-slate-900" />
          </button>
          <Link to="/profile" className="hidden md:block">
            <img src="https://ui-avatars.com/api/?name=Me&background=random" alt="Profile" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
          </Link>
        </div>
      </header>

      {/* Scrollable Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden w-full relative custom-scrollbar">
        <div className="max-w-7xl mx-auto flex justify-center py-4 pb-20 md:pb-8">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="bg-white border-t border-slate-200 flex justify-around items-center h-14 flex-shrink-0 md:hidden z-50 pb-safe">
        <NavItem to="/" icon={<Home />} label="الرئيسية" active={location.pathname === '/'} />
        <NavItem to="/marketplace" icon={<Store />} label="السوق" active={location.pathname.startsWith('/marketplace')} />
        <NavItem to="/services" icon={<Wrench />} label="الخدمات" active={location.pathname.startsWith('/services')} />
        <NavItem to="/jobs" icon={<Briefcase />} label="الوظائف" active={location.pathname.startsWith('/jobs')} />
        <NavItem to="/chat" icon={<MessageCircle />} label="الرسائل" active={location.pathname.startsWith('/chat')} />
        <NavItem to="/profile" icon={<User />} label="حسابي" active={location.pathname === '/profile'} />
      </nav>
    </div>
  );
}
