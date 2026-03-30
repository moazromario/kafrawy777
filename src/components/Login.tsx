import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import AuthLayout from './AuthLayout';
import Input from './UI/Input';
import Button from './UI/Button';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل'),
});

export default function Login() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    const result = loginSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    navigate('/profile');
  };

  return (
    <AuthLayout title="تسجيل الدخول">
      <form onSubmit={handleLogin} className="space-y-4">
        {!isConfigured && (
          <div className="p-4 text-sm text-yellow-800 bg-yellow-50 rounded-lg text-center">
            تنبيه: يرجى إعداد متغيرات بيئة Supabase في إعدادات المشروع لتمكين تسجيل الدخول.
          </div>
        )}
        {authError && <p className="text-red-500 text-sm">{authError}</p>}
        <Input name="email" label="البريد الإلكتروني" type="email" error={errors.email} />
        <Input name="password" label="كلمة المرور" type="password" error={errors.password} />
        <Button type="submit">دخول</Button>
      </form>
      <div className="mt-4 text-center space-y-2">
        <Link to="/forgot-password" className="text-blue-600 text-sm">نسيت كلمة المرور؟</Link>
        <p className="text-sm">ليس لديك حساب؟ <Link to="/register" className="text-blue-600 font-bold">سجل الآن</Link></p>
      </div>
    </AuthLayout>
  );
}
