import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import AuthLayout from './AuthLayout';
import Input from './UI/Input';
import Button from './UI/Button';

const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يتكون من حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل'),
});

export default function Register() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    const result = registerSchema.safeParse(data);

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

    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          name: result.data.name,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    navigate('/profile');
  };

  return (
    <AuthLayout title="إنشاء حساب جديد">
      <form onSubmit={handleRegister} className="space-y-4">
        {authError && <p className="text-red-500 text-sm">{authError}</p>}
        <Input name="name" label="الاسم الكامل" type="text" error={errors.name} />
        <Input name="email" label="البريد الإلكتروني" type="email" error={errors.email} />
        <Input name="password" label="كلمة المرور" type="password" error={errors.password} />
        <Button type="submit">تسجيل</Button>
      </form>
      <p className="mt-4 text-center text-sm">لديك حساب بالفعل؟ <Link to="/login" className="text-blue-600 font-bold">تسجيل الدخول</Link></p>
    </AuthLayout>
  );
}
