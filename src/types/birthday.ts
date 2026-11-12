export type ThemeVariant = 'blush' | 'lavender' | 'warm';

export type StageId = 'envelope' | 'cake' | 'notes' | 'memories' | 'letter';

export interface LoveNote {
  id: string;
  tag: string;
  title: string;
  body: string;
  sticker: string;
}

export interface PhotoManifestItem {
  id: string;
  vaultFile: string;
  caption: string;
  sticker: string;
  accentSticker: string;
  tilt: number;
  tapeColor: string;
  width: number;
  height: number;
}

export interface BirthdayPayload {
  herName: string;
  senderName: string;
  theme: ThemeVariant;
  optionalPin?: string;
  envelope: {
    badge: string;
    title: string;
    subtitle: string;
    buttonText: string;
    sticker: string;
  };
  cake: {
    title: string;
    subtitle: string;
    wishPrompt: string;
    blownTitle: string;
    blownSubtitle: string;
    sticker: string;
    blownSticker: string;
  };
  notes: LoveNote[];
  memories: {
    title: string;
    subtitle: string;
    items: PhotoManifestItem[];
  };
  letter: {
    heading: string;
    paragraphs: string[];
    closing: string;
    signature: string;
    stickers: string[];
  };
}

