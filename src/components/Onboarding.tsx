import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const slides = [
  { title: "مرحباً بك في كفراوي بوك", description: "تطبيقك الشامل لكل احتياجاتك اليومية." },
  { title: "دليل الخدمات المتكامل", description: "ابحث عن أفضل الصنايعية، المدرسين، والأطباء في كفر البطيخ." },
  { title: "سوق كفراوي", description: "بيع واشتري كل اللي محتاجه بسهولة وأمان." },
  { title: "ابدأ الآن", description: "سجل دخولك واستمتع بكافة الخدمات." },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="space-y-4"
        >
          <h2 className="text-3xl font-bold text-blue-600">{slides[index].title}</h2>
          <p className="text-gray-600">{slides[index].description}</p>
        </motion.div>
      </AnimatePresence>
      <button
        onClick={handleNext}
        className="mt-10 px-8 py-3 bg-blue-600 text-white rounded-full font-semibold"
      >
        {index === slides.length - 1 ? 'ابدأ' : 'التالي'}
      </button>
    </div>
  );
}
