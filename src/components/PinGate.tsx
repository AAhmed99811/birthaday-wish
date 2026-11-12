import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Delete } from 'lucide-react';
import { StickerBadge } from './StickerBadge';
import type { ThemePalette } from '../utils/themes';
import { sound } from '../utils/sound';

interface PinGateProps {
  expectedPin: string;
  herName: string;
  palette: ThemePalette;
  onUnlock: () => void;
}

export function PinGate({ expectedPin, herName, palette, onUnlock }: PinGateProps) {
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);

  const maxLen = expectedPin.length;

  const handleDigit = (digit: string) => {
    if (pin.length >= maxLen) return;
    sound.playPop();
    const next = pin + digit;
    setPin(next);
    if (next.length === maxLen) {
      if (next === expectedPin) {
        sound.playCelebrate();
        onUnlock();
      } else {
        setErrorShake(true);
        setTimeout(() => {
          setPin('');
          setErrorShake(false);
        }, 550);
      }
    }
  };

  return (
    <div className={`min-h-[100dvh] w-full flex items-center justify-center px-5 py-8 bg-gradient-to-b ${palette.bgGradient}`}>
      <motion.div
        animate={errorShake ? { x: [-8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`w-full max-w-sm rounded-3xl ${palette.cardBg} backdrop-blur-md border-2 ${palette.cardBorder} shadow-xl p-6 text-center`}
      >
        <div className="flex justify-center -mt-12 mb-2">
          <StickerBadge name="bubu-cute.webp" className="w-24 h-24" />
        </div>
        <h2 className={`font-script text-2xl ${palette.accentText}`}>
          Just Checking It&apos;s You, {herName}!
        </h2>
        <p className={`mt-1.5 text-xs ${palette.subText}`}>
          Enter your special {maxLen}-digit birthday PIN
        </p>

        <div className="my-5 flex justify-center gap-3">
          {Array.from({ length: maxLen }).map((_, i) => (
            <div
              key={i}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border-2 transition-all ${
                i < pin.length
                  ? 'border-rose-400 bg-rose-100 scale-105'
                  : 'border-pink-200 bg-white'
              }`}
            >
              {i < pin.length && <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key, idx) => {
            if (key === '') return <div key={idx} />;
            if (key === 'del') {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPin((p) => p.slice(0, -1))}
                  className="h-13 rounded-2xl bg-pink-50 text-rose-600 flex items-center justify-center active:scale-95 transition"
                  aria-label="Backspace"
                >
                  <Delete className="h-5 w-5" />
                </button>
              );
            }
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleDigit(key)}
                className="h-13 rounded-2xl bg-white border border-pink-200/80 text-lg font-bold text-rose-700 shadow-sm active:scale-95 active:bg-pink-50 transition"
              >
                {key}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

