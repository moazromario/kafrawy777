import React, { useEffect, useState } from 'react';
import { 
  Settings, Save, Globe, Shield, 
  Mail, Phone, MapPin, Image as ImageIcon,
  CheckCircle, AlertCircle, Trash2, Plus,
  Lock, User, Bell
} from 'lucide-react';
import { fetchAdminSettings, updateAdminSettings } from '../../services/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await fetchAdminSettings();
      setSettings(data);
    } catch (err) {
      toast.error('فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: any) => {
    setSaving(true);
    try {
      await updateAdminSettings({ key, value });
      toast.success('تم حفظ الإعدادات بنجاح');
      loadSettings();
    } catch (err) {
      toast.error('فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const general = settings.find(s => s.key === 'general')?.value || {};
  const policies = settings.find(s => s.key === 'policies')?.value || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* General Settings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-gray-900/50">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-500" />
            الإعدادات العامة
          </h3>
          <button 
            onClick={() => handleUpdate('general', general)}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">اسم التطبيق</label>
            <input 
              type="text"
              value={general.app_name || ''}
              onChange={(e) => {
                const newGeneral = { ...general, app_name: e.target.value };
                setSettings(settings.map(s => s.key === 'general' ? { ...s, value: newGeneral } : s));
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">رابط اللوجو</label>
            <input 
              type="text"
              value={general.logo_url || ''}
              onChange={(e) => {
                const newGeneral = { ...general, logo_url: e.target.value };
                setSettings(settings.map(s => s.key === 'general' ? { ...s, value: newGeneral } : s));
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">بريد التواصل</label>
            <input 
              type="email"
              value={general.contact_email || ''}
              onChange={(e) => {
                const newGeneral = { ...general, contact_email: e.target.value };
                setSettings(settings.map(s => s.key === 'general' ? { ...s, value: newGeneral } : s));
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">رقم الهاتف</label>
            <input 
              type="text"
              value={general.contact_phone || ''}
              onChange={(e) => {
                const newGeneral = { ...general, contact_phone: e.target.value };
                setSettings(settings.map(s => s.key === 'general' ? { ...s, value: newGeneral } : s));
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Policies Settings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-gray-900/50">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-500" />
            السياسات والشروط
          </h3>
          <button 
            onClick={() => handleUpdate('policies', policies)}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">شروط الخدمة</label>
            <textarea 
              value={policies.terms || ''}
              onChange={(e) => {
                const newPolicies = { ...policies, terms: e.target.value };
                setSettings(settings.map(s => s.key === 'policies' ? { ...s, value: newPolicies } : s));
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 h-40 custom-scrollbar"
              placeholder="اكتب شروط الخدمة هنا..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">سياسة الخصوصية</label>
            <textarea 
              value={policies.privacy || ''}
              onChange={(e) => {
                const newPolicies = { ...policies, privacy: e.target.value };
                setSettings(settings.map(s => s.key === 'policies' ? { ...s, value: newPolicies } : s));
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 h-40 custom-scrollbar"
              placeholder="اكتب سياسة الخصوصية هنا..."
            />
          </div>
        </div>
      </motion.div>

      {/* Security Info */}
      <div className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-2xl flex gap-4">
        <div className="p-3 bg-blue-600/20 rounded-xl h-fit">
          <Lock className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h4 className="font-bold text-blue-500 mb-1">تنبيه أمني</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            هذه الإعدادات تؤثر على جميع مستخدمي التطبيق. أي تغيير في السياسات سيتم إخطار المستخدمين به تلقائياً في المرة القادمة التي يفتحون فيها التطبيق.
          </p>
        </div>
      </div>
    </div>
  );
}
