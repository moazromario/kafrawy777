import React, { useEffect, useState } from 'react';
import { fetchWalletBalance, depositWallet } from '../../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Plus, ArrowUpRight, ArrowDownRight, History, Wallet, Smartphone, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '../../context/AuthContext';

export default function WalletPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [amount, setAmount] = useState('');
  const [ref, setRef] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWalletBalance(user.id).then(w => setBalance(w.balance)).finally(() => setLoading(false));
    }
  }, [user]);

  const handleDeposit = async () => {
    if (!user) return toast.error('يرجى تسجيل الدخول');
    if (!amount || !ref) return toast.error('يرجى إدخال المبلغ ورقم العملية');
    
    setDepositLoading(true);
    try {
      const result = await depositWallet(user.id, Number(amount), ref);
      setBalance(result.balance);
      toast.success('تم شحن المحفظة بنجاح!');
      setShowDeposit(false);
      setAmount('');
      setRef('');
    } catch (err) {
      toast.error('فشل الشحن');
    } finally {
      setDepositLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">المحفظة الإلكترونية</h1>

      {/* Wallet Card */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Wallet className="w-8 h-8" />
            </div>
            <div className="text-right">
              <div className="text-blue-100 text-sm font-semibold mb-1">الرصيد الحالي</div>
              <div className="text-4xl font-bold">{balance} ج.م</div>
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="text-blue-200 text-xs font-bold uppercase tracking-widest">رقم المحفظة</div>
              <div className="text-lg font-mono tracking-widest">**** **** **** 4242</div>
            </div>
            <button 
              onClick={() => setShowDeposit(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              شحن الرصيد
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-bold">إجمالي الشحن</div>
            <div className="text-lg font-bold text-slate-900">5,400 ج.م</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-bold">إجمالي الإنفاق</div>
            <div className="text-lg font-bold text-slate-900">3,200 ج.م</div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            سجل المعاملات
          </h2>
          <button className="text-blue-600 text-sm font-bold">عرض الكل</button>
        </div>
        
        <div className="divide-y divide-slate-50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${i === 1 ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                  {i === 1 ? <Plus className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{i === 1 ? 'شحن رصيد - فودافون كاش' : 'حجز خدمة - د. محمد علي'}</div>
                  <div className="text-slate-400 text-xs">اليوم، 10:30 صباحاً</div>
                </div>
              </div>
              <div className={`font-bold ${i === 1 ? 'text-green-600' : 'text-slate-900'}`}>
                {i === 1 ? '+' : '-'}{i === 1 ? '500' : '300'} ج.م
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDeposit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">شحن الرصيد</h2>
              <p className="text-slate-500 text-sm mb-8">استخدم فودافون كاش لشحن محفظتك فوراً</p>
              
              <div className="space-y-6 mb-8">
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">V</div>
                  <div>
                    <div className="text-red-900 font-bold text-sm">حول المبلغ إلى الرقم التالي:</div>
                    <div className="text-red-600 font-mono font-bold text-lg">01012345678</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">المبلغ المراد شحنه</label>
                  <input 
                    type="number" 
                    placeholder="مثلاً: 500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">رقم العملية (Reference)</label>
                  <input 
                    type="text" 
                    placeholder="أدخل رقم العملية للتأكيد"
                    value={ref}
                    onChange={(e) => setRef(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleDeposit}
                  disabled={depositLoading}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {depositLoading ? 'جاري التأكيد...' : 'تأكيد الشحن'}
                </button>
                <button 
                  onClick={() => setShowDeposit(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
                <ShieldCheck className="w-4 h-4" />
                معاملة آمنة ومحمية
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
