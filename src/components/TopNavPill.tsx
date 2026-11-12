import { Volume2, VolumeX } from 'lucide-react';
import type { StageId } from '../types/birthday';
import type { ThemePalette } from '../utils/themes';

const STAGES: Array<{ id: StageId; label: string; emoji: string }> = [
  { id: 'envelope', label: 'Envelope', emoji: '💌' },
  { id: 'cake', label: 'Wish', emoji: '🎂' },
  { id: 'notes', label: 'Notes', emoji: '💖' },
  { id: 'memories', label: 'Photos', emoji: '📸' },
  { id: 'letter', label: 'Letter', emoji: '🎀' },
];

interface TopNavPillProps {
  currentStage: StageId;
  unlockedMaxStage: number;
  musicOn: boolean;
  onToggleMusic: () => void;
  onSelectStage: (stage: StageId) => void;
  palette: ThemePalette;
}

export function TopNavPill({
  currentStage,
  unlockedMaxStage,
  musicOn,
  onToggleMusic,
  onSelectStage,
  palette,
}: TopNavPillProps) {
  return (
    <header className="sticky top-0 z-30 w-full px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
      <div className="mx-auto flex max-w-md items-center justify-between rounded-full bg-white/80 backdrop-blur-md border border-pink-200/80 px-3 py-1.5 shadow-sm shadow-pink-200/30">
        <nav aria-label="Birthday progress" className="flex items-center gap-1">
          {STAGES.map((stage, idx) => {
            const isActive = stage.id === currentStage;
            const isReachable = idx <= unlockedMaxStage;
            return (
              <button
                key={stage.id}
                type="button"
                disabled={!isReachable}
                onClick={() => onSelectStage(stage.id)}
                title={stage.label}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                  isActive
                    ? `${palette.pillBg} ${palette.pillText} scale-105 shadow-xs`
                    : isReachable
                      ? 'text-rose-700/70 hover:bg-pink-50 active:scale-95'
                      : 'opacity-35 cursor-not-allowed'
                }`}
              >
                <span aria-hidden="true">{stage.emoji}</span>
                {isActive && <span>{stage.label}</span>}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onToggleMusic}
          aria-label={musicOn ? 'Mute birthday music' : 'Play birthday music'}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition active:scale-90 ${
            musicOn ? `${palette.pillBg} ${palette.pillText}` : 'bg-pink-50 text-rose-400'
          }`}
        >
          {musicOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}

