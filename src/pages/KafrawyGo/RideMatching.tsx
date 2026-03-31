import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Star, Car, DollarSign } from 'lucide-react';
import BackButton from '../../components/BackButton';

const mockDrivers = [
  { id: 1, name: 'محمد علي', rating: 4.8, car: 'هيونداي فيرنا', price: 80 },
  { id: 2, name: 'أحمد حسن', rating: 4.9, car: 'كيا سيراتو', price: 85 },
  { id: 3, name: 'محمود إبراهيم', rating: 4.7, car: 'تويوتا كورولا', price: 75 },
];

export default function RideMatching() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<typeof mockDrivers>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDrivers(mockDrivers);
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 space-y-6 pb-24">
      <BackButton />
      <h1 className="text-2xl font-bold text-slate-900">عروض الكباتن</h1>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-500">جاري استقبال عروض الكباتن...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {drivers.map(driver => (
            <div key={driver.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Car className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{driver.name}</p>
                    <p className="text-sm text-slate-500">{driver.car}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{driver.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
                  <DollarSign size={20} />
                  {driver.price} ج.م
                </div>
                <button 
                  onClick={() => navigate('/kafrawy-go/active')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  قبول العرض
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
