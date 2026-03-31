import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Upload, CheckCircle } from 'lucide-react';

export default function RegisterDriver() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate('/kafrawy-go');
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">سجل ككابتن في كفراوي جو</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {s}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold">بياناتك الشخصية</h2>
              <input type="text" placeholder="الاسم الكامل" className="w-full p-3 border rounded-xl" required />
              <input type="tel" placeholder="رقم الهاتف" className="w-full p-3 border rounded-xl" required />
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold">بيانات السيارة</h2>
              <input type="text" placeholder="نوع السيارة" className="w-full p-3 border rounded-xl" required />
              <input type="text" placeholder="رقم اللوحة" className="w-full p-3 border rounded-xl" required />
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-lg font-semibold">رفع المستندات</h2>
              <div className="border-2 border-dashed p-6 rounded-xl text-center text-slate-400">
                <Upload className="mx-auto mb-2" />
                صورة رخصة القيادة
              </div>
              <div className="border-2 border-dashed p-6 rounded-xl text-center text-slate-400">
                <Upload className="mx-auto mb-2" />
                صورة رخصة السيارة
              </div>
            </>
          )}
          
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition">
            {step === 3 ? 'إرسال الطلب للمراجعة' : 'التالي'}
          </button>
        </form>
      </div>
    </div>
  );
}
