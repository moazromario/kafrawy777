import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Camera, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import MainLayout from './MainLayout';

export default function AddProduct() {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    condition: '',
    description: '',
    location: 'القاهرة، مصر'
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImages([...images, file]);
      setImageUrls([...imageUrls, URL.createObjectURL(file)]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newUrls = [...imageUrls];
    newUrls.splice(index, 1);
    setImageUrls(newUrls);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.category || !formData.condition) {
      alert('يرجى ملء جميع الحقول المطلوبة (العنوان، السعر، الفئة، الحالة).');
      return;
    }

    try {
      setLoading(true);

      let uploadedImageUrl = '';
      
      if (images.length > 0) {
        const file = images[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw new Error('فشل رفع الصورة. تأكد من إعدادات التخزين.');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedImageUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('products')
        .insert({
          title: formData.title,
          price: Number(formData.price),
          category: formData.category,
          condition: formData.condition,
          description: formData.description,
          location: formData.location,
          image_url: uploadedImageUrl,
        });

      if (insertError) {
        console.error('Insert error details:', insertError);
        throw new Error(insertError.message);
      }

      navigate('/marketplace');
    } catch (error: any) {
      console.error('Error adding product:', error);
      alert(`فشل إضافة المنتج: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-white min-h-screen md:rounded-lg md:shadow-sm md:mt-4 pb-20 md:pb-0" dir="rtl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">إضافة منتج جديد</h1>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="text-blue-600 font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            نشر
          </button>
        </div>

        <div className="p-4 max-w-xl mx-auto">
          {/* Photo Upload */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-slate-900">الصور</h2>
              <span className="text-sm text-slate-500">{images.length}/10 - يمكنك إضافة حتى 10 صور.</span>
            </div>
            
            <input 
              type="file" 
              hidden 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
            />

            <div className="grid grid-cols-3 gap-2">
              {imageUrls.map((img, index) => (
                <div key={index} className="aspect-square relative rounded-lg overflow-hidden border border-slate-200">
                  <img src={img} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {images.length < 10 && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-400 transition-colors"
                >
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">إضافة صور</span>
                </button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">العنوان</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="ماذا تبيع؟" 
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">السعر</label>
              <div className="relative">
                <span className="absolute right-3 top-2.5 text-slate-500">ج.م</span>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0" 
                  className="w-full border border-slate-300 rounded-lg pr-12 pl-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">الفئة</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">اختر الفئة</option>
                <option value="مركبات">مركبات</option>
                <option value="عقارات للإيجار">عقارات للإيجار</option>
                <option value="ملابس">ملابس</option>
                <option value="إلكترونيات">إلكترونيات</option>
                <option value="أثاث">أثاث</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">الحالة</label>
              <select 
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">اختر الحالة</option>
                <option value="جديد">جديد</option>
                <option value="مستعمل - كالجديد">مستعمل - كالجديد</option>
                <option value="مستعمل - جيد">مستعمل - جيد</option>
                <option value="مستعمل - مقبول">مستعمل - مقبول</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">الوصف</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="صف منتجك (اختياري)" 
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">الموقع</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="ابحث عن مدينة أو حي" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
