import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { BirthdayPayload, StageId } from './types/birthday';
import {
  decryptPhotosInBatches,
  unlockBirthdayVault,
} from './utils/vault';
import { THEME_PALETTES } from './utils/themes';
import { sound } from './utils/sound';
import { FloatingDecor } from './components/FloatingDecor';
import { LockedScreen } from './components/LockedScreen';
import { PinGate } from './components/PinGate';
import { TopNavPill } from './components/TopNavPill';
import { EnvelopeStage } from './components/EnvelopeStage';
import { CakeStage } from './components/CakeStage';
import { LoveNotesStage } from './components/LoveNotesStage';
import { MemoriesStage } from './components/MemoriesStage';
import { LetterStage } from './components/LetterStage';
import { StickerBadge } from './components/StickerBadge';

const STAGE_ORDER: StageId[] = ['envelope', 'cake', 'notes', 'memories', 'letter'];

type VaultStatus =
  | { state: 'loading' }
  | { state: 'locked'; reason: 'missing-key' | 'invalid-key' }
  | { state: 'unlocked'; payload: BirthdayPayload };

export function App() {
  const [vault, setVault] = useState<VaultStatus>({ state: 'loading' });
  const [pinVerified, setPinVerified] = useState(false);
  const [currentStage, setCurrentStage] = useState<StageId>('envelope');
  const [unlockedMaxStage, setUnlockedMaxStage] = useState(0);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [musicOn, setMusicOn] = useState(false);
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const abortController = new AbortController();

    const loadFromHash = async () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
      setPhotoUrls({});

      const secret = window.location.hash.replace(/^#/, '').trim();
      if (!secret) {
        setVault({ state: 'locked', reason: 'missing-key' });
        return;
      }

      setVault({ state: 'loading' });
      try {
        const { payload, cryptoKey } = await unlockBirthdayVault(secret);
        if (abortController.signal.aborted) return;

        document.title = `Happy Birthday, ${payload.herName}! 🎂`;
        setVault({ state: 'unlocked', payload });
        setPinVerified(!payload.optionalPin);

        void decryptPhotosInBatches(
          payload.memories.items,
          cryptoKey,
          (id, url) => {
            blobUrlsRef.current.push(url);
            setPhotoUrls((prev) => ({ ...prev, [id]: url }));
          },
          abortController.signal,
        );
      } catch {
        if (!abortController.signal.aborted) {
          setVault({ state: 'locked', reason: 'invalid-key' });
        }
      }
    };

    void loadFromHash();

    const handleHashChange = () => {
      void loadFromHash();
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      abortController.abort();
      window.removeEventListener('hashchange', handleHashChange);
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
      sound.stopMusic();
    };
  }, []);

  if (vault.state === 'loading') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-[#fff0f5] to-[#ffe4ee] px-6 text-center">
        <StickerBadge name="bubu-love.webp" interactive={false} className="w-24 h-24 animate-bounce" />
        <p className="mt-4 font-script text-2xl text-rose-500">Unwrapping your surprise...</p>
      </div>
    );
  }

  if (vault.state === 'locked') {
    return <LockedScreen reason={vault.reason} />;
  }

  const { payload } = vault;
  const palette = THEME_PALETTES[payload.theme] ?? THEME_PALETTES.blush;

  if (!pinVerified && payload.optionalPin) {
    return (
      <PinGate
        expectedPin={payload.optionalPin}
        herName={payload.herName}
        palette={palette}
        onUnlock={() => setPinVerified(true)}
      />
    );
  }

  const goToStage = (stage: StageId) => {
    const idx = STAGE_ORDER.indexOf(stage);
    setUnlockedMaxStage((max) => Math.max(max, idx));
    setCurrentStage(stage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleMusic = () => {
    const playing = sound.toggleMusic();
    setMusicOn(playing);
  };

  const handleEnvelopeOpen = () => {
    if (!sound.playing) {
      sound.startMusic();
      setMusicOn(true);
    }
    goToStage('cake');
  };

  const handleReplay = () => {
    setCurrentStage('envelope');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`relative min-h-[100dvh] w-full bg-gradient-to-b ${palette.bgGradient} bg-polka-soft pb-[env(safe-area-inset-bottom)]`}
    >
      <FloatingDecor />

      <div className="relative z-10 mx-auto max-w-md">
        <TopNavPill
          currentStage={currentStage}
          unlockedMaxStage={unlockedMaxStage}
          musicOn={musicOn}
          onToggleMusic={handleToggleMusic}
          onSelectStage={goToStage}
          palette={palette}
        />

        <main>
          <AnimatePresence mode="wait">
            {currentStage === 'envelope' && (
              <EnvelopeStage
                key="envelope"
                envelope={payload.envelope}
                herName={payload.herName}
                palette={palette}
                onOpen={handleEnvelopeOpen}
              />
            )}

            {currentStage === 'cake' && (
              <CakeStage
                key="cake"
                cake={payload.cake}
                herName={payload.herName}
                palette={palette}
                onNext={() => goToStage('notes')}
              />
            )}

            {currentStage === 'notes' && (
              <LoveNotesStage
                key="notes"
                notes={payload.notes}
                palette={palette}
                onNext={() => goToStage('memories')}
              />
            )}

            {currentStage === 'memories' && (
              <MemoriesStage
                key="memories"
                title={payload.memories.title}
                subtitle={payload.memories.subtitle}
                items={payload.memories.items}
                photoUrls={photoUrls}
                palette={palette}
                onNext={() => goToStage('letter')}
              />
            )}

            {currentStage === 'letter' && (
              <LetterStage
                key="letter"
                letter={payload.letter}
                herName={payload.herName}
                senderName={payload.senderName}
                palette={palette}
                onReplay={handleReplay}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
