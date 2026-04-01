import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Upload, X, Tag, AlignLeft, DollarSign, Package, Percent, Plus } from 'lucide-react';
import MainLayout from './MainLayout';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [stock, setStock] = useState('1');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [isEditMode, id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) {
      setTitle(data.title);
      setDescription(data.description || '');
      setPrice(data.price.toString());
      setStock(data.stock.toString());
      setCategory(data.category);
      if (data.image_url) setImages([data.image_url]);
    }
  };

  const categories = [
    'إلكترونيات',
    'ملابس',
    'أدوات منزلية',
    'أطعمة ومشروبات',
    'خدمات',
    'أخرى'
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (images.length + e.target.files.length > 5) {
        toast.error('يمكنك رفع 5 صور كحد أقصى');
        return;
      }
      
      const files = Array.from(e.target.files);
      const uploadedUrls: string[] = [];
      
      setIsSubmitting(true);
      try {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `product-images/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          const { data } = supabase.storage.from('products').getPublicUrl(filePath);
          uploadedUrls.push(data.publicUrl);
        }
        setImages([...images, ...uploadedUrls]);
        toast.success('تم رفع الصور بنجاح');
      } catch (error) {
        console.error('Error uploading images:', error);
        toast.error('حدث خطأ أثناء رفع الصور');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      toast.error('يرجى إضافة صورة واحدة على الأقل للمنتج');
      return;
    }

    if (!category) {
      toast.error('يرجى اختيار تصنيف للمنتج');
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        title,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        image_url: images[0] || 'https://picsum.photos/seed/new/400/400',
        // In a real app, store_id would come from the authenticated user's store
        store_id: '11111111-1111-1111-1111-111111111111' 
      };

      if (isEditMode) {
        const { error } = await supabase.from('products').update(productData).eq('id', id);
        if (error) throw error;
        toast.success('تم تحديث المنتج بنجاح!');
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        toast.success('تمت إضافة المنتج بنجاح!');
      }
      
      navigate('/marketplace/manage-products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(isEditMode ? 'حدث خطأ أثناء تحديث المنتج' : 'حدث خطأ أثناء إضافة المنتج');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen md:rounded-lg md:shadow-sm md:mt-4 pb-24 md:pb-8" dir="rtl">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 h-14 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors -mr-2">
            <ChevronRight className="w-6 h-6 text-slate-900" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">{isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h1>
        </div>

        <div className="p-4 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Images Section */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                صور المنتج <span className="text-xs font-normal text-slate-500">(حتى 5 صور)</span>
              </h2>
              
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                {/* Upload Button */}
                {images.length < 5 && (
                  <label className="flex-shrink-0 w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-colors snap-start">
                    <Plus className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-[10px] font-medium text-slate-500">إضافة صورة</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                  </label>
                )}

                {/* Image Previews */}
                {images.map((img, index) => (
                  <div key={index} className="flex-shrink-0 relative w-24 h-24 rounded-xl border border-slate-200 snap-start group">
                    <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-xl" />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5 rounded-b-xl backdrop-blur-sm">
                        الرئيسية
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                المعلومات الأساسية
              </h2>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">اسم المنتج</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="مثال: هاتف سامسونج جالاكسي S24"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">التصنيف</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-2 text-xs font-bold rounded-lg border transition-colors text-center ${
                        category === cat 
                          ? 'bg-blue-50 border-blue-500 text-blue-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <AlignLeft className="w-4 h-4 text-slate-400" />
                  الوصف والمواصفات
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none h-32"
                  placeholder="اكتب وصفاً دقيقاً للمنتج، مميزاته، ومواصفاته..."
                />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                السعر والمخزون
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">السعر الأساسي</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-3 pl-12 border border-slate-300 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-sm font-bold">ج.م</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Percent className="w-3 h-3 text-slate-400" />
                    سعر الخصم <span className="text-[10px] font-normal text-slate-400">(اختياري)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full p-3 pl-12 border border-slate-300 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-sm font-bold">ج.م</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Package className="w-4 h-4 text-slate-400" />
                  الكمية المتاحة (المخزون)
                </label>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setStock(Math.max(0, parseInt(stock || '0') - 1).toString())}
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-600 font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="flex-1 p-3 border border-slate-300 rounded-xl bg-slate-50 text-center font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setStock((parseInt(stock || '0') + 1).toString())}
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-600 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 pb-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    {isEditMode ? 'حفظ التعديلات' : 'حفظ وإضافة للمتجر'}
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </MainLayout>
  );
}
