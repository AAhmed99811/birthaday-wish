import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Grid2x2,
  Layers,
  MailOpen,
  Maximize2,
  X,
  Heart,
} from 'lucide-react';
import type { PhotoManifestItem } from '../types/birthday';
import type { ThemePalette } from '../utils/themes';
import { StickerBadge } from './StickerBadge';
import { sound } from '../utils/sound';

interface MemoriesStageProps {
  title: string;
  subtitle: string;
  items: PhotoManifestItem[];
  photoUrls: Record<string, string>;
  palette: ThemePalette;
  onNext: () => void;
}

const TAPE_COLOR_MAP: Record<string, string> = {
  rose: 'bg-pink-200/85',
  peach: 'bg-orange-200/85',
  lavender: 'bg-purple-200/85',
  mint: 'bg-emerald-200/85',
  cream: 'bg-amber-100/90',
};

export function MemoriesStage({
  title,
  subtitle,
  items,
  photoUrls,
  palette,
  onNext,
}: MemoriesStageProps) {
  const [viewMode, setViewMode] = useState<'stack' | 'grid'>('stack');
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const total = items.length;
  const loadedCount = Object.keys(photoUrls).length;
  const activeItem = items[activeIndex];
  const nextItem = total > 1 ? items[(activeIndex + 1) % total] : undefined;

  const step = (delta: number) => {
    if (total === 0) return;
    sound.playPop();
    setActiveIndex((prev) => (prev + delta + total) % total);
  };

  const stepLightbox = (delta: number) => {
    if (lightboxIndex === null || total === 0) return;
    sound.playPop();
    setLightboxIndex((lightboxIndex + delta + total) % total);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center px-4 pb-10 pt-1 min-h-[calc(100dvh-5rem)]"
    >
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-1.5">
          <StickerBadge name="emoji-sparkling-heart.webp" className="w-9 h-9" />
          <h2 className={`font-script text-3xl ${palette.accentText}`}>{title}</h2>
          <StickerBadge name="bubu-cute.webp" className="w-9 h-9" />
        </div>
        <p className={`mt-1 text-xs ${palette.subText}`}>{subtitle}</p>

        {/* View Toggle + Unlocked Counter */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className={`rounded-full ${palette.pillBg} ${palette.pillText} px-3 py-1 text-xs font-bold`}>
            {loadedCount < total
              ? `Unwrapping ${loadedCount}/${total}...`
              : `${activeIndex + 1} of ${total} memories`}
          </span>

          <div className="inline-flex rounded-full bg-white/90 border border-pink-200 p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setViewMode('stack');
              }}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition ${
                viewMode === 'stack' ? 'bg-rose-500 text-white shadow-xs' : 'text-rose-700'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Stack
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setViewMode('grid');
              }}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition ${
                viewMode === 'grid' ? 'bg-rose-500 text-white shadow-xs' : 'text-rose-700'
              }`}
            >
              <Grid2x2 className="h-3.5 w-3.5" />
              Grid
            </button>
          </div>
        </div>

        {/* Stack View */}
        {viewMode === 'stack' && activeItem && (
          <div className="mt-5">
            <div className="relative mx-auto w-full max-w-[310px] h-[440px] flex items-center justify-center">
              {/* Next card preview underneath */}
              {nextItem && (
                <div
                  aria-hidden="true"
                  style={{ transform: `rotate(${nextItem.tilt * -1}deg) scale(0.95)` }}
                  className="absolute inset-0 rounded-2xl bg-white p-3 pb-14 shadow-md border border-pink-100 opacity-75 pointer-events-none"
                >
                  <div className="h-full w-full rounded-xl bg-pink-50 overflow-hidden">
                    {photoUrls[nextItem.id] && (
                      <img
                        src={photoUrls[nextItem.id]}
                        alt=""
                        className="h-full w-full object-cover object-[center_20%] opacity-60"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Active draggable Polaroid */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeItem.id}
                  initial={{ scale: 0.94, opacity: 0, rotate: activeItem.tilt }}
                  animate={{ scale: 1, opacity: 1, rotate: activeItem.tilt, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -160 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.45}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -75) step(1);
                    else if (info.offset.x > 75) step(-1);
                  }}
                  className="relative z-10 h-full w-full rounded-2xl bg-white p-3 pb-14 shadow-2xl shadow-pink-300/40 border border-pink-100 cursor-grab active:cursor-grabbing select-none"
                >
                  {/* Washi Tape */}
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-24 -rotate-2 rounded-sm shadow-xs ${
                      TAPE_COLOR_MAP[activeItem.tapeColor] ?? 'bg-pink-200/80'
                    }`}
                  />

                  {/* Top-Left Accent Sticker */}
                  <div className="pointer-events-none absolute -top-4 -left-4 z-20">
                    <StickerBadge
                      name={activeItem.accentSticker}
                      interactive={false}
                      className="w-12 h-12 -rotate-12"
                    />
                  </div>

                  {/* Photo Frame */}
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(activeIndex)}
                    className="group relative block h-full w-full overflow-hidden rounded-xl bg-pink-50 focus:outline-none"
                    aria-label={`View full photo: ${activeItem.caption}`}
                  >
                    {photoUrls[activeItem.id] ? (
                      <img
                        src={photoUrls[activeItem.id]}
                        alt={activeItem.caption}
                        draggable={false}
                        className="h-full w-full object-cover object-[center_20%]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-pink-50 animate-pulse">
                        <Heart className="h-10 w-10 text-pink-300 fill-pink-200" />
                      </div>
                    )}
                    <span className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-xs opacity-85">
                      <Maximize2 className="h-4 w-4" />
                    </span>
                  </button>

                  {/* Bottom-Right Peeking Sticker */}
                  <div className="pointer-events-none absolute -bottom-3 -right-3 z-20">
                    <StickerBadge
                      name={activeItem.sticker}
                      interactive={false}
                      className="w-20 h-20 rotate-6"
                    />
                  </div>

                  {/* Handwritten Caption */}
                  <p className="mt-2.5 pr-12 text-left font-hand text-xl text-rose-700 truncate">
                    {activeItem.caption}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Stack Controls */}
            <div className="mt-5 flex items-center justify-center gap-4">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-pink-200 text-rose-600 shadow-md cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6" />
              </motion.button>
              <span className="text-xs font-bold text-rose-800/65">
                Swipe card or tap arrows
              </span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => step(1)}
                aria-label="Next photo"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-pink-200 text-rose-600 shadow-md cursor-pointer"
              >
                <ChevronRight className="h-6 w-6" />
              </motion.button>
            </div>
          </div>
        )}

        {/* Scrapbook Grid View */}
        {viewMode === 'grid' && (
          <div className="mt-5 grid grid-cols-2 gap-3.5 pb-4">
            {items.map((item, idx) => (
              <motion.button
                key={item.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.35) }}
                onClick={() => {
                  sound.playPop();
                  setActiveIndex(idx);
                  setLightboxIndex(idx);
                }}
                style={{ transform: `rotate(${idx % 2 === 0 ? -1.5 : 1.5}deg)` }}
                className="relative rounded-2xl bg-white p-2 pb-8 shadow-md border border-pink-100 text-left active:scale-95 transition cursor-pointer"
              >
                <div
                  className={`absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-12 rounded-xs ${
                    TAPE_COLOR_MAP[item.tapeColor] ?? 'bg-pink-200/80'
                  }`}
                />
                <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-pink-50">
                  {photoUrls[item.id] ? (
                    <img
                      src={photoUrls[item.id]}
                      alt={item.caption}
                      loading="lazy"
                      className="h-full w-full object-cover object-[center_20%]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center animate-pulse">
                      <Heart className="h-6 w-6 text-pink-300" />
                    </div>
                  )}
                </div>
                <div className="pointer-events-none absolute -bottom-2 -right-2">
                  <StickerBadge
                    name={item.sticker}
                    interactive={false}
                    className="w-11 h-11"
                  />
                </div>
                <p className="mt-1.5 pr-7 font-hand text-sm text-rose-700 truncate">
                  {item.caption}
                </p>
              </motion.button>
            ))}
          </div>
        )}

        {/* Continue to Birthday Letter */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            sound.playPop();
            onNext();
          }}
          className={`mt-6 w-full rounded-2xl bg-gradient-to-r ${palette.buttonGradient} py-3.5 px-6 text-base font-extrabold text-white shadow-lg shadow-pink-400/35 flex items-center justify-center gap-2 cursor-pointer`}
        >
          <MailOpen className="h-5 w-5" />
          <span>Read Your Birthday Letter 💌</span>
        </motion.button>
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && items[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close photo"
              className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full flex flex-col items-center"
            >
              <div className="relative rounded-2xl bg-white p-2.5 pb-11 shadow-2xl max-h-[82dvh] flex flex-col items-center">
                {photoUrls[items[lightboxIndex].id] && (
                  <img
                    src={photoUrls[items[lightboxIndex].id]}
                    alt={items[lightboxIndex].caption}
                    className="max-h-[68dvh] w-auto rounded-xl object-contain"
                  />
                )}
                <div className="pointer-events-none absolute -bottom-3 -right-2">
                  <StickerBadge
                    name={items[lightboxIndex].sticker}
                    interactive={false}
                    className="w-16 h-16"
                  />
                </div>
                <p className="mt-2 font-hand text-xl text-rose-700 text-center px-8">
                  {items[lightboxIndex].caption}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => stepLightbox(-1)}
                  aria-label="Previous fullscreen photo"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white active:scale-90"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <span className="text-sm font-bold text-white/85">
                  {lightboxIndex + 1} / {total}
                </span>
                <button
                  type="button"
                  onClick={() => stepLightbox(1)}
                  aria-label="Next fullscreen photo"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white active:scale-90"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

