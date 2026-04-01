import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Wallet, ChevronRight, Calendar, ArrowUpRight, ArrowDownLeft, CreditCard, Banknote } from 'lucide-react';
import KafrawyLayout from '../../components/KafrawyLayout';
import { motion } from 'motion/react';

export default function DriverEarnings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  const transactions = [
    { id: 1, type: 'trip', title: 'رحلة وسط البلد', amount: 80, date: 'اليوم، ١٢:٣٠ م', status: 'completed' },
    { id: 2, type: 'trip', title: 'رحلة محطة القطار', amount: 65, date: 'اليوم، ١١:١٥ ص', status: 'completed' },
    { id: 3, type: 'bonus', title: 'بونص إكمال ٥ رحلات', amount: 50, date: 'اليوم، ١٠:٠٠ ص', status: 'completed' },
    { id: 4, type: 'withdraw', title: 'سحب رصيد (فودافون كاش)', amount: -300, date: 'أمس، ٠٩:٤٥ م', status: 'pending' },
  ];

  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          {/* Header */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 mb-8 flex items-center gap-4">
            <button onClick={() => navigate('/kafrawy-go/driver-dashboard')} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>
            <h1 className="text-2xl font-black text-slate-900">الأرباح والمحفظة</h1>
          </div>

          {/* Balance Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl mb-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <p className="text-slate-400 font-bold mb-2">الرصيد المتاح للسحب</p>
              <div className="flex items-baseline gap-2 mb-8">
                <h2 className="text-5xl font-black">١,٢٥٠</h2>
                <span className="text-xl font-bold text-slate-400">ج.م</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95">
                  <ArrowUpRight size={20} />
                  سحب الرصيد
                </button>
                <button className="bg-white/10 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-95">
                  <Wallet size={20} />
                  شحن المحفظة
                </button>
              </div>
            </div>
          </div>

          {/* Stats Tabs */}
          <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 mb-8 flex">
            <button 
              onClick={() => setActiveTab('daily')}
              className={`flex-1 py-4 rounded-2xl font-black transition-all ${activeTab === 'daily' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              يومي
            </button>
            <button 
              onClick={() => setActiveTab('weekly')}
              className={`flex-1 py-4 rounded-2xl font-black transition-all ${activeTab === 'weekly' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              أسبوعي
            </button>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-3">
                <TrendingUp size={20} />
              </div>
              <p className="text-xs text-emerald-700 font-black mb-1">صافي الأرباح</p>
              <p className="text-2xl font-black text-emerald-900">٤٥٠ <span className="text-sm">ج.م</span></p>
            </div>
            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-3">
                <Calendar size={20} />
              </div>
              <p className="text-xs text-blue-700 font-black mb-1">عدد الرحلات</p>
              <p className="text-2xl font-black text-blue-900">١٢ <span className="text-sm">رحلة</span></p>
            </div>
          </div>

          {/* Transaction History */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 px-2">سجل العمليات</h3>
            
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    tx.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {tx.amount > 0 ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{tx.title}</p>
                    <p className="text-xs text-slate-400 font-bold">{tx.date}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`font-black text-lg ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} ج.م
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${
                    tx.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {tx.status === 'completed' ? 'مكتملة' : 'قيد المراجعة'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </KafrawyLayout>
  );
}
