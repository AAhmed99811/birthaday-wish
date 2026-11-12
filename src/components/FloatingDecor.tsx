import { motion, useReducedMotion } from 'framer-motion';

const FLOATING_ITEMS = [
  { id: 1, icon: '💖', left: '8%', size: 'text-lg', duration: 9, delay: 0 },
  { id: 2, icon: '✨', left: '22%', size: 'text-base', duration: 11, delay: 1.5 },
  { id: 3, icon: '🌸', left: '42%', size: 'text-lg', duration: 10, delay: 0.7 },
  { id: 4, icon: '💕', left: '64%', size: 'text-base', duration: 12, delay: 2.3 },
  { id: 5, icon: '🎀', left: '82%', size: 'text-lg', duration: 9.5, delay: 1.1 },
  { id: 6, icon: '✨', left: '92%', size: 'text-sm', duration: 10.5, delay: 3 },
];

export function FloatingDecor() {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none"
    >
      <div className="absolute -top-20 -left-16 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-rose-200/35 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-amber-100/45 blur-3xl" />

      {FLOATING_ITEMS.map((item) => (
        <motion.span
          key={item.id}
          initial={{ y: '108vh', opacity: 0 }}
          animate={{
            y: ['108vh', '-12vh'],
            opacity: [0, 0.75, 0.75, 0],
            x: [0, 14, -12, 6],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ left: item.left }}
          className={`absolute ${item.size}`}
        >
          {item.icon}
        </motion.span>
      ))}
    </div>
  );
}

