export type AspectRatio = '9:16' | '1:1' | '4:5' | '16:9';
export type VideoResolution = '720p' | '1080p' | '1440p';
export type FrameRate = 24 | 25 | 30 | 60;
export type ExportQuality = 'Standard' | 'High' | 'Maximum';

export type ScreenType =
  | 'landing'
  | 'dashboard'
  | 'import'
  | 'analysis'
  | 'moments'
  | 'configure'
  | 'gallery'
  | 'editor'
  | 'export-center'
  | 'rendering'
  | 'projects'
  | 'settings';

export type MomentCategory =
  | 'Funny Dialogue'
  | 'Unexpected Reaction'
  | 'Meme Moment'
  | 'Fast Comedy'
  | 'Punchline'
  | 'Comedy Interaction'
  | 'Awkward Silence';

export interface SubtitleWord {
  word: string;
  start: number;
  end: number;
  highlighted?: boolean;
}

export interface SubtitleChunk {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  words: SubtitleWord[];
}

export interface DetectedMoment {
  id: string;
  title: string;
  startTime: number; // in seconds
  endTime: number;
  duration: number;
  transcript: string;
  subtitles?: SubtitleChunk[];
  category: MomentCategory;
  aiScore: number; // 0 - 100
  reason: string;
  activeSpeaker: string;
  laughterDetected: boolean;
  selected: boolean;
  thumbnail: string;
  punchlineWord?: string;
  keywords: string[];
}

export interface CaptionStyleConfig {
  preset: 'modern-white' | 'bold-yellow' | 'karaoke' | 'podcast' | 'minimal' | 'meme' | 'gradient';
  fontFamily: string;
  fontSize: number;
  primaryColor: string;
  highlightColor: string;
  backgroundColor?: string;
  hasBackground?: boolean;
  textCase: 'uppercase' | 'normal';
  positionY: number; // percentage from top (e.g. 75)
  animation: 'bounce' | 'fade' | 'pop' | 'none';
}

export interface ColorCorrection {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  temperature: number; // -100 to 100
  exposure: number; // -100 to 100
}

export interface AudioMastering {
  voiceEnhance: boolean;
  noiseReduction: boolean;
  musicDucking: boolean;
  sfxVolume: number; // 0 to 100
  originalVolume: number; // 0 to 100
  backgroundMusicTrack?: string;
  backgroundMusicVolume?: number;
}

export interface AutoReframingConfig {
  mode: 'smart-speaker' | 'center' | 'split-screen' | 'pip';
  speakerX: number; // 0 to 100%
  speakerY: number; // 0 to 100%
  zoom: number; // 1 to 2
  faceTrackingActive: boolean;
}

export interface TimelineElement {
  id: string;
  trackId: string;
  type: 'video-chunk' | 'subtitle-chunk' | 'text' | 'sticker' | 'sfx' | 'music';
  name: string;
  startTime: number; // relative to clip timeline (seconds)
  duration: number; // duration on timeline (seconds)
  content?: string;
  properties?: {
    volume?: number;
    color?: string;
    fontSize?: number;
    posX?: number;
    posY?: number;
    scale?: number;
    rotation?: number;
    opacity?: number;
    assetUrl?: string;
  };
}

export interface TimelineTrack {
  id: string;
  type: 'video' | 'captions' | 'overlay' | 'audio' | 'sfx';
  name: string;
  visible: boolean;
  locked: boolean;
  muted: boolean;
  elements: TimelineElement[];
}

export interface GeneratedClip {
  id: string;
  projectId: string;
  momentId: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  aspectRatio: AspectRatio;
  resolution: VideoResolution;
  editingPreset: 'viral-comedy' | 'podcast-highlight' | 'fast-meme' | 'clean-pro' | 'reaction-zoom' | 'karaoke';
  captionStyle: CaptionStyleConfig;
  autoReframing: AutoReframingConfig;
  colorCorrection: ColorCorrection;
  audioMastering: AudioMastering;
  timelineTracks: TimelineTrack[];
  thumbnail: string;
  funnyScore: number;
  category: MomentCategory;
  status: 'ready' | 'rendering' | 'exported';
  exportBlobUrl?: string;
  exportFormat?: 'MP4 (H.264)' | 'WebM';
  exportSizeMb?: number;
  createdAt: string;
}

export interface SourceVideo {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  duration: number;
  width: number;
  height: number;
  fps: number;
  format: string;
  thumbnail: string;
}

export interface Project {
  id: string;
  title: string;
  sourceVideo: SourceVideo;
  createdAt: string;
  updatedAt: string;
  detectedMoments: DetectedMoment[];
  generatedClips: GeneratedClip[];
  status: 'draft' | 'analyzing' | 'ready' | 'completed';
  totalExports: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  defaultAspectRatio: AspectRatio;
  defaultCaptionPreset: string;
  defaultLanguage: string;
  defaultResolution: VideoResolution;
  autoVoiceEnhance: boolean;
  smartTrimmingEnabled: boolean;
}

export interface TechnicalLimits {
  maxUploadSizeBytes: number; // e.g. 500 MB
  maxDurationMinutes: number; // e.g. 60 min
  maxConcurrentJobs: number; // e.g. 4 jobs
  storageQuotaMb: number; // e.g. 2048 MB
  usedStorageMb: number;
}
