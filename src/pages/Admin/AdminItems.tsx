import React, { useEffect, useState } from 'react';
import { 
  Package, Search, Plus, Edit2, Trash2, 
  MapPin, Tag, DollarSign, Users, 
  Image as ImageIcon, XCircle, CheckCircle,
  Home, Briefcase, Ticket
} from 'lucide-react';
import { fetchAdminItems, createAdminItem, updateAdminItem } from '../../services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminItems() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    type: 'service',
    title: '',
    description: '',
    price: '',
    capacity: '1',
    location: '',
    image_url: ''
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await fetchAdminItems();
      setItems(data);
    } catch (err) {
      toast.error('فشل تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateAdminItem(editingItem.id, formData);
        toast.success('تم تحديث الخدمة بنجاح');
      } else {
        await createAdminItem(formData);
        toast.success('تم إضافة الخدمة بنجاح');
      }
      loadItems();
      setShowModal(false);
      setEditingItem(null);
      setFormData({ type: 'service', title: '', description: '', price: '', capacity: '1', location: '', image_url: '' });
    } catch (err) {
      toast.error('فشل حفظ البيانات');
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      title: item.title,
      description: item.description,
      price: item.price.toString(),
      capacity: item.capacity.toString(),
      location: item.location,
      image_url: item.image_url || ''
    });
    setShowModal(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث عن خدمة أو غرفة..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pr-11 pl-4 text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          onClick={() => { setEditingItem(null); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-900/40"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة خدمة جديدة</span>
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <motion.div 
            key={item.id}
            layout
            className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden group hover:border-blue-500/50 transition-all shadow-xl"
          >
            <div className="h-48 bg-gray-700 relative overflow-hidden">
              {item.image_url ? (
                <img src={item.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 ${
                  item.type === 'room' ? 'bg-purple-600 text-white' :
                  item.type === 'service' ? 'bg-blue-600 text-white' :
                  'bg-amber-600 text-white'
                }`}>
                  {item.type === 'room' ? <Home className="w-3 h-3" /> :
                   item.type === 'service' ? <Briefcase className="w-3 h-3" /> :
                   <Ticket className="w-3 h-3" />}
                  {item.type === 'room' ? 'غرفة' : item.type === 'service' ? 'خدمة' : 'فعالية'}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-100">{item.title}</h3>
                <span className="text-blue-500 font-bold text-lg">{item.price} ج.م</span>
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {item.location}
                </div>
                {item.capacity > 1 && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {item.capacity} أشخاص
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-gray-700 pt-4">
                <button 
                  onClick={() => handleEdit(item)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-700 hover:bg-blue-600 rounded-lg transition-all text-sm font-bold"
                >
                  <Edit2 className="w-4 h-4" />
                  تعديل
                </button>
                <button className="p-2 bg-gray-700 hover:bg-red-600 rounded-lg transition-all text-red-400 hover:text-white">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingItem ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">نوع الخدمة</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="service">خدمة / موعد</option>
                    <option value="room">غرفة / إقامة</option>
                    <option value="event">تذكرة / فعالية</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">العنوان</label>
                  <input 
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: غرفة ديلوكس"
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-400">الوصف</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 h-24"
                    placeholder="وصف تفصيلي للخدمة..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">السعر (ج.م)</label>
                  <input 
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">السعة / الأشخاص</label>
                  <input 
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">الموقع</label>
                  <input 
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: وسط البلد"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">رابط الصورة</label>
                  <input 
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-4 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit"
                    className="px-10 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40"
                  >
                    {editingItem ? 'تحديث البيانات' : 'إضافة الخدمة'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
