import React, { useEffect, useState } from 'react';
import { 
  Calendar, Search, Filter, MoreVertical, 
  CheckCircle, XCircle, Clock, MapPin, 
  User, Package, ChevronRight, ChevronLeft,
  AlertCircle, Trash2, Edit2
} from 'lucide-react';
import { fetchAdminBookings, updateAdminBooking } from '../../services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await fetchAdminBookings();
      setBookings(data);
    } catch (err) {
      toast.error('فشل تحميل الحجوزات');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateAdminBooking(id, { status });
      toast.success('تم تحديث حالة الحجز بنجاح');
      loadBookings();
    } catch (err) {
      toast.error('فشل تحديث الحالة');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.booking_items?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث عن حجز باسم المستخدم أو الخدمة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pr-11 pl-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">كل الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="cancelled">ملغي</option>
          </select>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-900/40">
            <Calendar className="w-5 h-5" />
            <span>إضافة حجز يدوي</span>
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right">
            <thead className="bg-gray-900/50 border-b border-gray-700 text-gray-400 text-sm font-medium">
              <tr>
                <th className="px-6 py-4">المستخدم</th>
                <th className="px-6 py-4">الخدمة / الغرفة</th>
                <th className="px-6 py-4">تاريخ الحجز</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.user_id}`} alt="" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-100">{booking.profiles?.full_name}</p>
                        <p className="text-xs text-gray-500 font-mono">{booking.user_id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-100">{booking.booking_items?.title}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {booking.booking_items?.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-100">
                        {new Date(booking.start_date).toLocaleDateString('ar-EG')}
                      </span>
                      {booking.end_date && (
                        <span className="text-xs text-gray-500">
                          إلى {new Date(booking.end_date).toLocaleDateString('ar-EG')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-blue-500">{booking.total_price} ج.م</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 w-fit ${
                      booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                      booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {booking.status === 'confirmed' ? <CheckCircle className="w-3 h-3" /> :
                       booking.status === 'cancelled' ? <XCircle className="w-3 h-3" /> :
                       <Clock className="w-3 h-3" />}
                      {booking.status === 'confirmed' ? 'مؤكد' :
                       booking.status === 'cancelled' ? 'ملغي' : 'قيد الانتظار'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {booking.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                          className="p-2 hover:bg-green-500/10 text-green-500 rounded-lg transition-colors"
                          title="تأكيد الحجز"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                          className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                          title="إلغاء الحجز"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-6 bg-gray-900/50 border-t border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500">عرض {filteredBookings.length} من أصل {bookings.length} حجز</p>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 disabled:opacity-50" disabled>
              <ChevronRight className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">1</button>
            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
