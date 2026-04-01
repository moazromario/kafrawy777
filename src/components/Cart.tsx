import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Trash2, Minus, Plus, CreditCard, Wallet, Banknote, ShoppingCart } from 'lucide-react';
import MainLayout from './MainLayout';
import { toast } from 'sonner';

export default function Cart() {
  const navigate = useNavigate();
  
  // Mock cart items
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      title: 'هاتف ذكي سامسونج جالاكسي',
      price: 15000,
      quantity: 1,
      image: 'https://picsum.photos/seed/phone/100/100',
      seller: 'محل الإلكترونيات'
    },
    {
      id: '2',
      title: 'سماعات رأس لاسلكية',
      price: 1200,
      quantity: 2,
      image: 'https://picsum.photos/seed/headphones/100/100',
      seller: 'محل الإلكترونيات'
    }
  ]);

  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash, card, wallet

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items => items.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
    toast.success('تم إزالة المنتج من السلة');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 50;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('السلة فارغة');
      return;
    }
    navigate('/marketplace/checkout');
  };

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen md:rounded-lg md:shadow-sm md:mt-4 pb-24 md:pb-8" dir="rtl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors -mr-2">
              <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">سلة المشتريات</h1>
          </div>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
            {cartItems.length} منتجات
          </span>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">سلتك فارغة</h2>
            <p className="text-slate-500 mb-6">تصفح السوق وأضف بعض المنتجات الرائعة إلى سلتك.</p>
            <button 
              onClick={() => navigate('/marketplace')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              تسوق الآن
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Cart Items */}
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 flex gap-3 shadow-sm">
                  <img src={item.image} alt={item.title} className="w-20 h-20 rounded-lg object-cover bg-slate-100" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{item.title}</h3>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">البائع: {item.seller}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="font-bold text-blue-600">{item.price.toLocaleString()} ج.م</p>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <div className="w-8 h-8 flex items-center justify-center font-bold text-sm text-slate-900 border-x border-slate-200 bg-white">
                          {item.quantity}
                        </div>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">ملخص الطلب</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع الفرعي ({cartItems.length} منتجات)</span>
                  <span className="font-medium text-slate-900">{subtotal.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>رسوم التوصيل</span>
                  <span className="font-medium text-slate-900">{shipping.toLocaleString()} ج.م</span>
                </div>
                <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between items-center">
                  <span className="font-bold text-slate-900">الإجمالي</span>
                  <span className="text-xl font-black text-blue-600">{total.toLocaleString()} ج.م</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fixed Bottom Checkout Bar */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe z-20 md:relative md:bg-transparent md:border-t-0 md:p-4">
            <button 
              onClick={handleCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
            >
              تابع للدفع ({total.toLocaleString()} ج.م)
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
