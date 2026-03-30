import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h2 className="text-3xl font-bold text-blue-600 mb-8">استعادة كلمة المرور</h2>
      <form className="w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg"
        />
        <button type="submit" className="w-full p-4 bg-blue-600 text-white rounded-lg font-bold">
          إرسال رابط الاستعادة
        </button>
      </form>
      <Link to="/login" className="mt-4 text-blue-600">العودة لتسجيل الدخول</Link>
    </div>
  );
}
