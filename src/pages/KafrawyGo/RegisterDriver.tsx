import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Upload, CheckCircle, ChevronRight, Shield, FileText, Camera, Truck, Bike, Loader2 } from 'lucide-react';
import KafrawyLayout from '../../components/KafrawyLayout';
import { motion, AnimatePresence } from 'motion/react';

export default function RegisterDriver() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState({
    idFront: false,
    idBack: false,
    license: false,
    carLicense: false
  });

  const vehicleTypes = [
    { id: 'car', name: 'سيارة ملاكي', icon: <Car size={24} /> },
    { id: 'bike', name: 'موتوسيكل', icon: <Bike size={24} /> },
    { id: 'truck', name: 'نص نقل / شحن', icon: <Truck size={24} /> },
  ];

  const handleUpload = (docType: keyof typeof documents) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setDocuments(d => ({ ...d, [docType]: true }));
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      navigate('/kafrawy-go/driver-dashboard');
    }
  };

  const allDocsUploaded = documents.idFront && documents.idBack && documents.license && documents.carLicense;


  return (
    <KafrawyLayout>
      <div className="pb-24 min-h-screen bg-slate-50 w-full" dir="rtl">
        <div className="max-w-3xl mx-auto px-4 pt-8">
          {/* Header */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 mb-8 flex items-center gap-4">
            <button onClick={() => navigate('/kafrawy-go')} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>
            <h1 className="text-2xl font-black text-slate-900">انضم لكباتن كفراوي</h1>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            {/* Progress Bar */}
            <div className="flex justify-between mb-10 relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500" 
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>
              {[1, 2, 3, 4].map((s) => (
                <div 
                  key={s} 
                  className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 font-black transition-all duration-500 ${
                    step >= s ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-100' : 'bg-white border-2 border-slate-100 text-slate-300'
                  }`}
                >
                  {step > s ? <CheckCircle size={20} /> : s}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <Shield size={40} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900">بياناتك الشخصية</h2>
                      <p className="text-slate-500 font-bold">نحتاج لبعض المعلومات الأساسية للبدء</p>
                    </div>
                    
                    <div className="space-y-4">
                      <input type="text" placeholder="الاسم الكامل (كما في البطاقة)" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" required />
                      <input type="tel" placeholder="رقم الهاتف" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" required />
                      <input type="text" placeholder="الرقم القومي" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" required />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <Car size={40} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900">بيانات المركبة</h2>
                      <p className="text-slate-500 font-bold">اختر نوع وسيلة المواصلات الخاصة بك</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {vehicleTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setVehicleType(type.id)}
                          className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
                            vehicleType === type.id 
                              ? 'border-blue-600 bg-blue-50 shadow-md' 
                              : 'border-slate-100 bg-white hover:border-blue-200'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              vehicleType === type.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'
                            }`}>
                              {type.icon}
                            </div>
                            <span className="font-black text-lg text-slate-900">{type.name}</span>
                          </div>
                          {vehicleType === type.id && <CheckCircle className="text-blue-600" />}
                        </button>
                      ))}
                    </div>

                    {vehicleType && (
                      <div className="space-y-4 pt-4">
                        <input type="text" placeholder="موديل المركبة (مثلاً: هيونداي فيرنا 2015)" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" required />
                        <input type="text" placeholder="رقم اللوحة" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" required />
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <FileText size={40} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900">رفع المستندات</h2>
                      <p className="text-slate-500 font-bold">نحتاج لصور واضحة من رخصتك ورخصة المركبة</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* ID Front */}
                      <div 
                        onClick={() => !documents.idFront && !isUploading && handleUpload('idFront')}
                        className={`border-2 border-dashed p-6 rounded-3xl text-center transition-all cursor-pointer group ${documents.idFront ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400'}`}
                      >
                        {documents.idFront ? (
                          <CheckCircle className="mx-auto mb-3 text-green-500" size={32} />
                        ) : (
                          <Camera className="mx-auto mb-3 text-slate-300 group-hover:text-blue-500 transition-colors" size={32} />
                        )}
                        <p className={`font-black ${documents.idFront ? 'text-green-700' : 'text-slate-900'}`}>البطاقة (أمامي)</p>
                      </div>

                      {/* ID Back */}
                      <div 
                        onClick={() => !documents.idBack && !isUploading && handleUpload('idBack')}
                        className={`border-2 border-dashed p-6 rounded-3xl text-center transition-all cursor-pointer group ${documents.idBack ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400'}`}
                      >
                        {documents.idBack ? (
                          <CheckCircle className="mx-auto mb-3 text-green-500" size={32} />
                        ) : (
                          <Camera className="mx-auto mb-3 text-slate-300 group-hover:text-blue-500 transition-colors" size={32} />
                        )}
                        <p className={`font-black ${documents.idBack ? 'text-green-700' : 'text-slate-900'}`}>البطاقة (خلفي)</p>
                      </div>

                      {/* Driving License */}
                      <div 
                        onClick={() => !documents.license && !isUploading && handleUpload('license')}
                        className={`border-2 border-dashed p-6 rounded-3xl text-center transition-all cursor-pointer group ${documents.license ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400'}`}
                      >
                        {documents.license ? (
                          <CheckCircle className="mx-auto mb-3 text-green-500" size={32} />
                        ) : (
                          <Camera className="mx-auto mb-3 text-slate-300 group-hover:text-blue-500 transition-colors" size={32} />
                        )}
                        <p className={`font-black ${documents.license ? 'text-green-700' : 'text-slate-900'}`}>رخصة القيادة</p>
                      </div>

                      {/* Car License */}
                      <div 
                        onClick={() => !documents.carLicense && !isUploading && handleUpload('carLicense')}
                        className={`border-2 border-dashed p-6 rounded-3xl text-center transition-all cursor-pointer group ${documents.carLicense ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400'}`}
                      >
                        {documents.carLicense ? (
                          <CheckCircle className="mx-auto mb-3 text-green-500" size={32} />
                        ) : (
                          <Camera className="mx-auto mb-3 text-slate-300 group-hover:text-blue-500 transition-colors" size={32} />
                        )}
                        <p className={`font-black ${documents.carLicense ? 'text-green-700' : 'text-slate-900'}`}>رخصة المركبة</p>
                      </div>
                    </div>

                    {/* Upload Progress Overlay */}
                    <AnimatePresence>
                      {isUploading && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
                        >
                          <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center text-center max-w-xs w-full">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                            <h3 className="text-xl font-black text-slate-900 mb-2">جاري الرفع...</h3>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 transition-all duration-200"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-sm font-bold text-slate-500 mt-2">{uploadProgress}%</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                )}

                {step === 4 && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10 space-y-6"
                  >
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-50">
                      <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900">تم استلام طلبك!</h2>
                    <p className="text-slate-500 font-bold max-w-xs mx-auto">
                      جاري مراجعة بياناتك من قبل فريق كفراوي جو. سيتم تفعيل حسابك خلال 24 ساعة.
                    </p>
                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-right">
                      <h4 className="font-black text-blue-900 mb-2">ماذا بعد؟</h4>
                      <ul className="text-sm text-blue-700 space-y-2 font-bold">
                        <li className="flex items-center gap-2">• ستصلك رسالة نصية عند التفعيل.</li>
                        <li className="flex items-center gap-2">• يمكنك البدء في استقبال الرحلات فوراً.</li>
                        <li className="flex items-center gap-2">• تأكد من شحن محفظتك للبدء.</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button 
                type="submit" 
                disabled={(step === 2 && !vehicleType) || (step === 3 && !allDocsUploaded)}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none active:scale-95"
              >
                {step === 4 ? 'الذهاب للوحة التحكم' : 'التالي'}
                <ChevronRight className="rotate-180" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </KafrawyLayout>
  );
}
