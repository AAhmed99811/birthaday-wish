import { motion } from 'framer-motion';
import { getStickerUrl } from '../utils/vault';
import { sound } from '../utils/sound';

interface StickerBadgeProps {
  name: string;
  alt?: string;
  className?: string;
  interactive?: boolean;
}

export function StickerBadge({
  name,
  alt = 'Cute sticker',
  className = 'w-24 h-24',
  interactive = true,
}: StickerBadgeProps) {
  return (
    <motion.img
      src={getStickerUrl(name)}
      alt={alt}
      draggable={false}
      loading="lazy"
      whileTap={interactive ? { scale: 1.18, rotate: [0, -8, 8, 0] } : undefined}
      onClick={interactive ? () => sound.playPop() : undefined}
      className={`object-contain select-none drop-shadow-md ${interactive ? 'cursor-pointer' : 'pointer-events-none'} ${className}`}
    />
  );
}

