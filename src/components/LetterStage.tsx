import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, RotateCcw } from 'lucide-react';
import type { BirthdayPayload } from '../types/birthday';
import type { ThemePalette } from '../utils/themes';
import { StickerBadge } from './StickerBadge';
import { sound } from '../utils/sound';

interface LetterStageProps {
  letter: BirthdayPayload['letter'];
  herName: string;
  senderName: string;
  palette: ThemePalette;
  onReplay: () => void;
}

export function LetterStage({
  letter,
  herName,
  senderName,
  palette,
  onReplay,
}: LetterStageProps) {
  const triggerLoveShower = () => {
    sound.playCelebrate();
    confetti({
      particleCount: 110,
      spread: 90,
      origin: { y: 0.6 },
      colors: palette.confettiColors,
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col items-center px-5 pb-12 pt-2 min-h-[calc(100dvh-5rem)]"
    >
      <div className="w-full max-w-sm">
        {/* Top Cute Sticker Trio */}
        <div className="flex items-end justify-center gap-2 -mb-4 relative z-10">
          <StickerBadge name={letter.stickers[0] ?? 'emoji-bouquet.webp'} className="w-16 h-16 -rotate-6" />
          <StickerBadge name={letter.stickers[1] ?? 'peach-goma-kiss.webp'} className="w-24 h-24" />
          <StickerBadge name={letter.stickers[2] ?? 'bubu-dudu-back-hug.webp'} className="w-20 h-20 rotate-6" />
        </div>

        {/* Stationery Letter Card */}
        <div
          className={`rounded-3xl bg-stationery border-2 ${palette.cardBorder} shadow-2xl shadow-pink-200/45 px-6 pt-8 pb-7`}
        >
          <p className="font-hand text-xl text-rose-500">
            Dear {herName},
          </p>
          <h2 className={`mt-1 font-script text-2xl leading-snug ${palette.accentText}`}>
            {letter.heading}
          </h2>

          <div className={`mt-4 space-y-4 text-[15px] leading-7 ${palette.subText}`}>
            {letter.paragraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          <div className="mt-6 border-t border-dashed border-pink-200 pt-4">
            <p className="font-hand text-xl text-rose-600 leading-snug">
              {letter.closing}
            </p>
            <p className={`mt-3 font-script text-xl ${palette.accentText} text-right`}>
              {letter.signature || senderName}
            </p>
          </div>
        </div>

        {/* Interactive Love Shower & Replay */}
        <div className="mt-5 space-y-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={triggerLoveShower}
            className={`w-full rounded-2xl bg-gradient-to-r ${palette.buttonGradient} py-3.5 px-6 text-base font-extrabold text-white shadow-lg shadow-pink-400/35 flex items-center justify-center gap-2 cursor-pointer`}
          >
            <Heart className="h-5 w-5 fill-white" />
            <span>Shower With Love 💖</span>
          </motion.button>

          <button
            type="button"
            onClick={() => {
              sound.playPop();
              onReplay();
            }}
            className="w-full rounded-2xl bg-white/85 border border-pink-200 py-3 px-5 text-sm font-bold text-rose-600 shadow-xs flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Replay From Start</span>
          </button>
        </div>
      </div>
    </motion.section>
  );
}

