import { motion } from 'framer-motion';
import { LockKeyhole, QrCode, Heart } from 'lucide-react';

interface LockedScreenProps {
  reason: 'missing-key' | 'invalid-key';
}

export function LockedScreen({ reason }: LockedScreenProps) {
  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center px-5 py-8 bg-gradient-to-b from-[#fff0f5] via-[#fff7fa] to-[#ffe4ee]">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm rounded-3xl bg-white/90 backdrop-blur-md border-2 border-pink-200/80 shadow-xl shadow-pink-200/40 p-7 text-center"
      >
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-rose-200 shadow-inner">
          <LockKeyhole className="h-9 w-9 text-rose-500" />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-rose-600">
          <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
          Private Surprise
        </span>

        <h1 className="mt-4 font-script text-3xl text-rose-600">
          Sealed With Love
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-rose-900/75">
          {reason === 'invalid-key'
            ? 'This secret key link looks incomplete or invalid. Please re-scan the birthday QR code to unlock your surprise.'
            : 'This special birthday gift is locked and only opens with your personal QR code URL.'}
        </p>

        <div className="mt-6 rounded-2xl border border-dashed border-pink-300 bg-pink-50/70 p-4 flex items-center gap-3 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <QrCode className="h-6 w-6 text-rose-500" />
          </div>
          <p className="text-xs leading-snug text-rose-900/80">
            Open your phone camera and scan the QR code on your birthday card to unwrap everything inside.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

