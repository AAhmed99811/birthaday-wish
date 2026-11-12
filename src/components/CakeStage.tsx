import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Wind, ArrowRight, Sparkles } from 'lucide-react';
import type { BirthdayPayload } from '../types/birthday';
import type { ThemePalette } from '../utils/themes';
import { StickerBadge } from './StickerBadge';
import { sound } from '../utils/sound';

interface CakeStageProps {
  cake: BirthdayPayload['cake'];
  herName: string;
  palette: ThemePalette;
  onNext: () => void;
}

const CANDLE_X_POSITIONS = [62, 92, 122, 152, 182];

export function CakeStage({ cake, herName, palette, onNext }: CakeStageProps) {
  const [litCandles, setLitCandles] = useState<boolean[]>([true, true, true, true, true]);
  const allBlown = litCandles.every((lit) => !lit);

  const fireCelebration = () => {
    sound.playCelebrate();
    confetti({
      particleCount: 95,
      spread: 85,
      origin: { y: 0.55 },
      colors: palette.confettiColors,
    });
    window.setTimeout(() => {
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: palette.confettiColors,
      });
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: palette.confettiColors,
      });
    }, 240);
  };

  const handleToggleCandle = (idx: number) => {
    if (!litCandles[idx]) return;
    sound.playBlow();
    const updated = litCandles.map((val, i) => (i === idx ? false : val));
    setLitCandles(updated);
    if (updated.every((v) => !v)) {
      fireCelebration();
    }
  };

  const handleBlowAll = () => {
    if (allBlown) return;
    sound.playBlow();
    setLitCandles([false, false, false, false, false]);
    fireCelebration();
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col items-center justify-center px-5 pb-10 pt-2 text-center min-h-[calc(100dvh-5rem)]"
    >
      <div
        className={`w-full max-w-sm rounded-3xl ${palette.cardBg} backdrop-blur-md border-2 ${palette.cardBorder} shadow-xl shadow-pink-200/40 px-5 py-6`}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={allBlown ? 'blown' : 'lit'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-2"
            >
              {allBlown && (
                <StickerBadge name="emoji-party.webp" className="w-12 h-12" />
              )}
              <StickerBadge
                name={allBlown ? cake.blownSticker : cake.sticker}
                className="w-24 h-24"
              />
              {allBlown && (
                <StickerBadge name="emoji-birthday-cake.webp" className="w-12 h-12" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <h2 className={`font-script text-2xl sm:text-3xl ${palette.accentText}`}>
          {allBlown ? cake.blownTitle.replace('My Love', herName) : cake.title}
        </h2>
        <p className={`mt-2 text-sm leading-relaxed ${palette.subText}`}>
          {allBlown ? cake.blownSubtitle : cake.subtitle}
        </p>

        {/* Interactive Kawaii Birthday Cake SVG */}
        <div className="my-4 flex justify-center">
          <svg
            viewBox="0 0 244 190"
            className="w-60 h-48 select-none overflow-visible"
            role="img"
            aria-label="Interactive birthday cake with candles"
          >
            {/* Cake Plate */}
            <ellipse cx="122" cy="174" rx="102" ry="12" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="2" />

            {/* Bottom Cake Tier */}
            <rect x="34" y="114" width="176" height="58" rx="16" fill="#fda4af" />
            <rect x="34" y="114" width="176" height="22" rx="12" fill="#fff1f2" />
            <path
              d="M34,126 Q52,142 70,126 Q88,142 106,126 Q122,142 138,126 Q156,142 174,126 Q192,142 210,126 L210,114 L34,114 Z"
              fill="#fff1f2"
            />
            {/* Sprinkles */}
            <circle cx="62" cy="150" r="3" fill="#fde047" />
            <circle cx="95" cy="156" r="3" fill="#a78bfa" />
            <circle cx="124" cy="148" r="3" fill="#34d399" />
            <circle cx="155" cy="156" r="3" fill="#fde047" />
            <circle cx="185" cy="149" r="3" fill="#f472b6" />

            {/* Top Cake Tier */}
            <rect x="56" y="70" width="132" height="46" rx="14" fill="#fb7185" />
            <path
              d="M56,82 Q72,98 88,82 Q105,98 122,82 Q139,98 156,82 Q172,98 188,82 L188,70 L56,70 Z"
              fill="#ffe4e6"
            />
            {/* Cute Blush Face on Cake */}
            <circle cx="102" cy="100" r="3.2" fill="#4a2535" />
            <circle cx="142" cy="100" r="3.2" fill="#4a2535" />
            <ellipse cx="94" cy="104" rx="4.5" ry="2.5" fill="#fecdd3" />
            <ellipse cx="150" cy="104" rx="4.5" ry="2.5" fill="#fecdd3" />
            <path d="M116,102 Q122,108 128,102" fill="none" stroke="#4a2535" strokeWidth="2.4" strokeLinecap="round" />

            {/* Candles */}
            {CANDLE_X_POSITIONS.map((x, idx) => {
              const isLit = litCandles[idx];
              return (
                <g
                  key={x}
                  onClick={() => handleToggleCandle(idx)}
                  className="cursor-pointer"
                >
                  {/* Invisible generous touch target */}
                  <rect x={x - 14} y="10" width="28" height="62" fill="transparent" />
                  <rect
                    x={x - 4}
                    y="38"
                    width="8"
                    height="32"
                    rx="3"
                    fill={idx % 2 === 0 ? '#fef08a' : '#fbcfe8'}
                    stroke="#f472b6"
                    strokeWidth="1.2"
                  />
                  <line x1={x} y1="32" x2={x} y2="38" stroke="#4a2535" strokeWidth="1.6" />
                  {isLit ? (
                    <g className="animate-flicker" style={{ transformOrigin: `${x}px 32px` }}>
                      <ellipse cx={x} cy="22" rx="7" ry="11" fill="#fde047" opacity="0.35" />
                      <path
                        d={`M${x},12 C${x + 6},20 ${x + 5},30 ${x},31 C${x - 5},30 ${x - 6},20 ${x},12 Z`}
                        fill="#fb923c"
                      />
                      <path
                        d={`M${x},17 C${x + 3},22 ${x + 2.5},28 ${x},29 C${x - 2.5},28 ${x - 3},22 ${x},17 Z`}
                        fill="#fef08a"
                      />
                    </g>
                  ) : (
                    <motion.path
                      initial={{ opacity: 0.9, y: 0 }}
                      animate={{ opacity: 0, y: -14 }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      d={`M${x},28 Q${x - 4},22 ${x + 2},16 Q${x + 5},10 ${x - 1},5`}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {!allBlown ? (
          <motion.button
            type="button"
            onClick={handleBlowAll}
            whileTap={{ scale: 0.96 }}
            className={`w-full rounded-2xl bg-gradient-to-r ${palette.buttonGradient} py-3.5 px-6 text-base font-extrabold text-white shadow-lg shadow-pink-400/35 flex items-center justify-center gap-2 cursor-pointer`}
          >
            <Wind className="h-5 w-5" />
            <span>{cake.wishPrompt}</span>
          </motion.button>
        ) : (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              sound.playPop();
              onNext();
            }}
            className={`w-full rounded-2xl bg-gradient-to-r ${palette.buttonGradient} py-3.5 px-6 text-base font-extrabold text-white shadow-lg shadow-pink-400/35 flex items-center justify-center gap-2 cursor-pointer`}
          >
            <Sparkles className="h-5 w-5" />
            <span>Read Your Love Notes</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        )}
      </div>
    </motion.section>
  );
}

