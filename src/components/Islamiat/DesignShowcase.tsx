import React, { useState, useEffect } from 'react';
import { generateIslamicUIImages } from '../../services/imageService';
import { Loader2, Download, ExternalLink, Image as ImageIcon } from 'lucide-react';
import MainLayout from '../MainLayout';

export default function DesignShowcase() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImages() {
      try {
        const generatedImages = await generateIslamicUIImages();
        setImages(generatedImages);
      } catch (error) {
        console.error("Failed to generate images:", error);
      } finally {
        setLoading(false);
      }
    }
    loadImages();
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 p-8" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-black text-emerald-800 mb-4">معرض تصاميم الإسلاميات</h1>
            <p className="text-slate-600 font-medium">تصاميم واجهة المستخدم المقترحة لتطبيق كفراوي - القسم الإسلامي</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
              <p className="text-slate-500 font-bold">جاري توليد التصاميم عالية الجودة...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {images.map((img, index) => (
                <div key={index} className="group relative bg-white p-4 rounded-[2.5rem] shadow-xl shadow-emerald-100/50 border border-emerald-50 overflow-hidden">
                  <div className="aspect-[9/16] rounded-[2rem] overflow-hidden bg-slate-100">
                    <img 
                      src={img} 
                      alt={`Design ${index + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between px-2">
                    <span className="text-emerald-700 font-black">تصميم رقم {index + 1}</span>
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = img;
                        link.download = `islamic-ui-design-${index + 1}.png`;
                        link.click();
                      }}
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
