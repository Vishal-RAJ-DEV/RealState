'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface StatProps {
  value: string;
  numericValue: number;
  label: string;
  suffix?: string;
}

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function StatsSection() {
  const stats: StatProps[] = [
    { value: '12,400', numericValue: 12400, label: 'Properties Listed', suffix: '+' },
    { value: '340', numericValue: 340, label: 'Cities Covered', suffix: '+' },
    { value: '50,000', numericValue: 50000, label: 'Happy Buyers', suffix: '+' },
  ];

  return (
    <section className="w-full py-20 lg:py-32 bg-charcoal">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="font-serif text-5xl sm:text-6xl lg:text-7xl text-cream mb-2">
                <AnimatedNumber target={stat.numericValue} suffix={stat.suffix} />
              </div>
              <div className="text-cream/60 text-sm font-sans uppercase tracking-widest">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
