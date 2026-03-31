import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/onboarding'), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-full w-full flex items-center justify-center bg-blue-600">
      <h1 className="text-4xl font-bold text-white">كفراوي بوك</h1>
    </div>
  );
}
