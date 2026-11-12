import { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Sparkles } from 'lucide-react';
import type { BirthdayPayload } from '../types/birthday';
import type { ThemePalette } from '../utils/themes';
import { StickerBadge } from './StickerBadge';
import { sound } from '../utils/sound';

interface EnvelopeStageProps {
  envelope: BirthdayPayload['envelope'];
  herName: string;
  palette: ThemePalette;
  onOpen: () => void;
}

export function EnvelopeStage({ envelope, herName, palette, onOpen }: EnvelopeStageProps) {
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    sound.playCelebrate();
    confetti({
      particleCount: 75,
      spread: 75,
      origin: { y: 0.62 },
      colors: palette.confettiColors,
    });
    window.setTimeout(onOpen, 650);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -16 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col items-center justify-center px-5 pb-10 pt-4 text-center min-h-[calc(100dvh-5rem)]"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 -mb-5 flex items-end justify-center gap-2"
      >
        <StickerBadge
          name="emoji-sparkling-heart.webp"
          className="w-12 h-12 -rotate-12 mb-2"
        />
        <StickerBadge
          name={envelope.sticker}
          alt="Birthday surprise sticker"
          className="w-28 h-28"
        />
        <StickerBadge
          name="emoji-gift.webp"
          className="w-12 h-12 rotate-12 mb-2"
        />
      </motion.div>

      <div
        className={`relative w-full max-w-sm rounded-3xl ${palette.cardBg} backdrop-blur-md border-2 ${palette.cardBorder} shadow-2xl shadow-pink-200/50 overflow-hidden`}
      >
        {/* Decorative Envelope Flap */}
        <div className="relative h-24 w-full bg-gradient-to-b from-pink-100/90 to-rose-50/40 overflow-hidden">
          <svg
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
            className="h-full w-full"
            aria-hidden="true"
          >
            <path
              d="M0,0 L200,82 L400,0 Z"
              fill="#ffe4ee"
              stroke="#fbcfe8"
              strokeWidth="2"
            />
          </svg>
          <motion.button
            type="button"
            onClick={handleOpen}
            animate={opening ? { scale: 1.4, opacity: 0 } : { scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: opening ? 0 : Infinity }}
            aria-label="Tap wax seal to open"
            className="absolute left-1/2 top-11 -translate-x-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-600 text-white shadow-lg shadow-rose-400/40 border-2 border-white/80 active:scale-95"
          >
            <Heart className="h-6 w-6 fill-white" />
          </motion.button>
        </div>

        <div className="px-6 pb-7 pt-5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full ${palette.pillBg} ${palette.pillText} px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {envelope.badge}
          </span>

          <h1 className={`mt-4 font-script text-3xl leading-tight ${palette.accentText}`}>
            {envelope.title}
          </h1>

          <p className="mt-1.5 font-hand text-xl text-rose-500">
            For {herName} 💖
          </p>

          <p className={`mt-3 text-sm leading-relaxed ${palette.subText}`}>
            {envelope.subtitle}
          </p>

          <motion.button
            type="button"
            onClick={handleOpen}
            whileTap={{ scale: 0.96 }}
            className={`mt-6 w-full rounded-2xl bg-gradient-to-r ${palette.buttonGradient} py-3.5 px-6 text-base font-extrabold text-white shadow-lg shadow-pink-400/35 flex items-center justify-center gap-2 cursor-pointer`}
          >
            <Heart className="h-5 w-5 fill-white" />
            <span>{opening ? 'Opening...' : envelope.buttonText}</span>
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}

