import React, { useEffect, useState, useCallback } from 'react';
import { Clock } from 'lucide-react';

const LiveTimer = ({ endTime, onEnd }) => {
  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(endTime) - +new Date();
    if (difference > 0) {
      return {
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
        total: difference
      };
    }
    return { h: 0, m: 0, s: 0, total: 0 };
  }, [endTime]);  // ← recalculates whenever endTime changes (e.g. after extension)

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    // Immediately recalculate when endTime changes (time extension)
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft.total <= 0) {
        clearInterval(timer);
        if (onEnd) onEnd();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, calculateTimeLeft, onEnd]);

  const format = (num) => String(num).padStart(2, '0');

  const isUrgent = timeLeft.h === 0 && timeLeft.m < 5 && timeLeft.total > 0;
  const isExpired = timeLeft.total <= 0;

  return (
    <div className="glass-morphism" style={{
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '160px',
      border: isUrgent ? '1px solid rgba(244,63,94,0.4)' : '1px solid rgba(255,255,255,0.08)',
      background: isUrgent ? 'rgba(244,63,94,0.06)' : 'rgba(255,255,255,0.03)',
    }}>
      <Clock size={16} style={{ color: isExpired ? '#94a3b8' : isUrgent ? '#f43f5e' : 'var(--primary)' }} />
      <span style={{
        fontSize: '1.3rem',
        fontWeight: 900,
        fontVariantNumeric: 'tabular-nums',
        color: isExpired ? '#94a3b8' : isUrgent ? '#f43f5e' : '#fff',
        letterSpacing: '2px',
        fontFamily: '"JetBrains Mono", monospace'
      }}>
        {isExpired ? 'CLOSED' : `${format(timeLeft.h)}:${format(timeLeft.m)}:${format(timeLeft.s)}`}
      </span>
    </div>
  );
};

export default LiveTimer;
