import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Camera } from 'lucide-react';
import type { LoveNote } from '../types/birthday';
import type { ThemePalette } from '../utils/themes';
import { StickerBadge } from './StickerBadge';
import { sound } from '../utils/sound';

interface LoveNotesStageProps {
  notes: LoveNote[];
  palette: ThemePalette;
  onNext: () => void;
}

interface BurstItem {
  id: number;
  sticker: string;
  offsetX: number;
}

export function LoveNotesStage({ notes, palette, onNext }: LoveNotesStageProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loveCount, setLoveCount] = useState(0);
  const [bursts, setBursts] = useState<BurstItem[]>([]);

  const current = notes[index];
  const isLast = index === notes.length - 1;

  const paginate = (delta: number) => {
    const nextIdx = index + delta;
    if (nextIdx < 0 || nextIdx >= notes.length) return;
    sound.playPop();
    setDirection(delta);
    setIndex(nextIdx);
  };

  const spawnLoveBurst = (sticker: string) => {
    sound.playPop();
    setLoveCount((c) => c + 1);
    const id = Date.now() + Math.random();
    const offsetX = Math.round((Math.random() - 0.5) * 120);
    setBursts((prev) => [...prev.slice(-7), { id, sticker, offsetX }]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 1100);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center px-5 pb-10 pt-2 min-h-[calc(100dvh-5rem)]"
    >
      <div className="relative w-full max-w-sm">
        {/* Floating kiss/hug sticker bursts */}
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-40 flex justify-center">
          <AnimatePresence>
            {bursts.map((burst) => (
              <motion.div
                key={burst.id}
                initial={{ opacity: 1, y: 0, x: burst.offsetX, scale: 0.5 }}
                animate={{ opacity: 0, y: -180, scale: 1.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute"
              >
                <StickerBadge name={burst.sticker} interactive={false} className="w-16 h-16" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 55 : -55, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction > 0 ? -55 : 55, scale: 0.96 }}
            transition={{ duration: 0.28 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -55) paginate(1);
              else if (info.offset.x > 55) paginate(-1);
            }}
            className={`rounded-3xl ${palette.cardBg} backdrop-blur-md border-2 ${palette.cardBorder} shadow-xl shadow-pink-200/45 p-6 text-center cursor-grab active:cursor-grabbing`}
          >
            <span
              className={`inline-block rounded-full ${palette.pillBg} ${palette.pillText} px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider`}
            >
              {current.tag}
            </span>

            <div className="my-4 flex justify-center">
              <StickerBadge name={current.sticker} className="w-32 h-32" />
            </div>

            <h2 className={`font-script text-2xl leading-snug ${palette.accentText}`}>
              {current.title}
            </h2>

            <p className={`mt-3 text-sm sm:text-base leading-relaxed ${palette.subText}`}>
              {current.body}
            </p>

            {/* Pagination Dots + Arrows */}
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => paginate(-1)}
                disabled={index === 0}
                aria-label="Previous love note"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-rose-500 disabled:opacity-30 active:scale-90 transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-1.5">
                {notes.map((n, i) => (
                  <button
                    key={n.id}
                    type="button"
                    aria-label={`Go to note ${i + 1}`}
                    onClick={() => {
                      setDirection(i > index ? 1 : -1);
                      setIndex(i);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      i === index ? 'w-6 bg-rose-500' : 'w-2 bg-pink-200'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => paginate(1)}
                disabled={isLast}
                aria-label="Next love note"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-rose-500 disabled:opacity-30 active:scale-90 transition"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Interactive Kiss & Hug Reactions */}
        <div className="mt-4 flex items-center gap-2.5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.93 }}
            onClick={() => spawnLoveBurst('emoji-kiss.webp')}
            className="flex-1 rounded-2xl bg-white/90 border border-pink-200 py-2.5 px-3 text-xs font-extrabold text-rose-600 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Send Kiss 😘</span>
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.93 }}
            onClick={() => spawnLoveBurst('floating-love-heart.webp')}
            className="flex-1 rounded-2xl bg-white/90 border border-pink-200 py-2.5 px-3 text-xs font-extrabold text-rose-600 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Send Hug 🫂</span>
          </motion.button>
          {loveCount > 0 && (
            <motion.span
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              className="rounded-2xl bg-rose-500 px-3 py-2.5 text-xs font-extrabold text-white shadow-sm flex items-center gap-1"
            >
              <Heart className="h-3.5 w-3.5 fill-white" />
              {loveCount}
            </motion.span>
          )}
        </div>

        {/* Proceed to Photos Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            sound.playPop();
            onNext();
          }}
          className={`mt-4 w-full rounded-2xl bg-gradient-to-r ${palette.buttonGradient} py-3.5 px-6 text-base font-extrabold text-white shadow-lg shadow-pink-400/35 flex items-center justify-center gap-2 cursor-pointer`}
        >
          <Camera className="h-5 w-5" />
          <span>{isLast ? 'Open Your Photo Memories ✨' : 'Skip to Your Photos 📸'}</span>
        </motion.button>
      </div>
    </motion.section>
  );
}

