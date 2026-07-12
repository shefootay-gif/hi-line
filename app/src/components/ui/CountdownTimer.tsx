import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Timer } from 'lucide-react';

export default function CountdownTimer({ targetDate }: { targetDate: string | Date }) {
  const { lang, isRTL } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  function calculateTimeLeft(target: string | Date) {
    const difference = new Date(target).getTime() - new Date().getTime();
    if (difference <= 0) return null;
    
    return {
      hours: Math.floor((difference / (1000 * 60 * 60))),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  if (!timeLeft) return null;

  return (
    <div className={`flex items-center gap-2 bg-[#D71920]/10 text-[#D71920] px-3 py-1.5 rounded-lg text-sm font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
      <Timer className="w-4 h-4" />
      <span className="flex items-center gap-1" dir="ltr">
        <span className="w-6 text-center bg-white rounded shadow-sm py-0.5">{timeLeft.hours.toString().padStart(2, '0')}</span>
        <span>:</span>
        <span className="w-6 text-center bg-white rounded shadow-sm py-0.5">{timeLeft.minutes.toString().padStart(2, '0')}</span>
        <span>:</span>
        <span className="w-6 text-center bg-white rounded shadow-sm py-0.5">{timeLeft.seconds.toString().padStart(2, '0')}</span>
      </span>
      <span className="text-xs font-semibold ml-1">
        {lang === 'ar' ? 'ينتهي العرض خلال' : 'Ends in'}
      </span>
    </div>
  );
}
