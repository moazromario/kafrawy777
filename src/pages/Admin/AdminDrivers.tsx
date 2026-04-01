import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, CheckCircle, XCircle, FileText, User, 
  Phone, Search, Filter, Eye, ShieldAlert, ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data for driver applications
const mockDrivers = [
  {
    id: 'DRV-001',
    name: 'محمد علي',
    phone: '01012345678',
    nationalId: '29001011234567',
    vehicleType: 'سيارة ملاكي',
    vehicleModel: 'هيونداي فيرنا 2015',
    plateNumber: 'أ ب ج 1234',
    status: 'pending',
    appliedAt: '2026-04-01T10:30:00Z',
    documents: {
      idFront: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400&q=80',
      idBack: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400&q=80',
      license: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400&q=80',
      carLicense: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400&q=80'
    }
  },
  {
    id: 'DRV-002',
    name: 'أحمد حسن',
    phone: '01198765432',
    nationalId: '28505057654321',
    vehicleType: 'موتوسيكل',
    vehicleModel: 'بجاج بلسر 2020',
    plateNumber: 'س ص ع 987',
    status: 'approved',
    appliedAt: '2026-03-30T14:15:00Z',
    documents: {
      idFront: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400&q=80',
      idBack: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400&q=80',
      license: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400&q=80',
      carLicense: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400&q=80'
    }
  },
  {
    id: 'DRV-003',
    name: 'محمود إبراهيم',
    phone: '01234567890',
    nationalId: '29512129876543',
    vehicleType: 'نص نقل / شحن',
    vehicleModel: 'شيفروليه الدبابة 2018',
    plateNumber: 'ط ك م 456',
    status: 'rejected',
    appliedAt: '2026-03-29T09:45:00Z',
    documents: {
      idFront: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400&q=80',
      idBack: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400&q=80',
      license: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400&q=80',
      carLicense: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400&q=80'
    }
  }
];

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState(mockDrivers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.includes(searchTerm) || driver.phone.includes(searchTerm) || driver.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: 'approved' } : d));
    toast.success('تم قبول الكابتن بنجاح');
    setSelectedDriver(null);
  };

  const handleReject = (id: string) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected' } : d));
    toast.error('تم رفض طلب الكابتن');
    setSelectedDriver(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><ShieldCheck size={14} /> مقبول</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle size={14} /> مرفوض</span>;
      default:
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertTriangle size={14} /> قيد المراجعة</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">طلبات الكباتن</h2>
          <p className="text-gray-400 text-sm">مراجعة واعتماد مستندات السائقين الجدد</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="بحث بالاسم أو الهاتف..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-gray-900 border border-gray-700 text-white rounded-xl py-2.5 pr-10 pl-4 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 bg-gray-900 border border-gray-700 text-white rounded-xl py-2.5 pr-10 pl-4 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers List */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-900/50 text-gray-400 text-sm">
              <tr>
                <th className="p-4 font-medium">الكود</th>
                <th className="p-4 font-medium">الكابتن</th>
                <th className="p-4 font-medium">المركبة</th>
                <th className="p-4 font-medium">تاريخ الطلب</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 text-gray-300 font-mono text-sm">{driver.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-white">{driver.name}</p>
                        <p className="text-xs text-gray-400">{driver.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Car size={16} className="text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-200">{driver.vehicleType}</p>
                        <p className="text-xs text-gray-500">{driver.plateNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(driver.appliedAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(driver.status)}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => setSelectedDriver(driver)}
                      className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                    >
                      <Eye size={16} /> مراجعة
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    لا توجد طلبات تطابق بحثك
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedDriver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">مراجعة مستندات الكابتن</h3>
                    <p className="text-sm text-gray-400">{selectedDriver.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDriver(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Info */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-white border-b border-gray-700 pb-2">البيانات الشخصية والمركبة</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">الاسم الكامل</p>
                        <p className="font-bold text-gray-200">{selectedDriver.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">رقم الهاتف</p>
                        <p className="font-bold text-gray-200">{selectedDriver.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">الرقم القومي</p>
                        <p className="font-bold text-gray-200">{selectedDriver.nationalId}</p>
                      </div>
                      <div className="pt-4 border-t border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">نوع المركبة</p>
                        <p className="font-bold text-gray-200">{selectedDriver.vehicleType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">الموديل</p>
                        <p className="font-bold text-gray-200">{selectedDriver.vehicleModel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">رقم اللوحة</p>
                        <p className="font-bold text-gray-200">{selectedDriver.plateNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-white border-b border-gray-700 pb-2">المستندات المرفقة</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400">البطاقة (أمامي)</p>
                        <div className="aspect-video bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative group">
                          <img src={selectedDriver.documents.idFront} alt="ID Front" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                            <Eye className="text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400">البطاقة (خلفي)</p>
                        <div className="aspect-video bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative group">
                          <img src={selectedDriver.documents.idBack} alt="ID Back" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                            <Eye className="text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400">رخصة القيادة</p>
                        <div className="aspect-video bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative group">
                          <img src={selectedDriver.documents.license} alt="License" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                            <Eye className="text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400">رخصة المركبة</p>
                        <div className="aspect-video bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative group">
                          <img src={selectedDriver.documents.carLicense} alt="Car License" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                            <Eye className="text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-700 bg-gray-900/50 flex items-center justify-end gap-4">
                {selectedDriver.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleReject(selectedDriver.id)}
                      className="px-6 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-bold transition-colors"
                    >
                      رفض الطلب
                    </button>
                    <button 
                      onClick={() => handleApprove(selectedDriver.id)}
                      className="px-6 py-2.5 bg-green-600 text-white hover:bg-green-700 rounded-xl font-bold transition-colors shadow-lg shadow-green-900/20"
                    >
                      اعتماد الكابتن
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 font-bold">
                    تمت المراجعة: {getStatusBadge(selectedDriver.status)}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
