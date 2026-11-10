import { AspectRatio, DetectedMoment, SubtitleChunk, SubtitleWord } from '../types';

/**
 * Calculates a weighted comedy/viral score from 0 to 100 based on multimodal factors:
 * - comedyPotential: 30%
 * - punchlineCompleteness: 25%
 * - reactionQuality: 15%
 * - audioEngagement: 15%
 * - visualEngagement: 15%
 */
export function calculateViralScore(
  comedyPotential: number,
  punchlineCompleteness: number,
  reactionQuality: number,
  audioEngagement: number,
  visualEngagement: number
): number {
  const clamp = (val: number) => Math.max(0, Math.min(100, val));
  const rawScore =
    clamp(comedyPotential) * 0.30 +
    clamp(punchlineCompleteness) * 0.25 +
    clamp(reactionQuality) * 0.15 +
    clamp(audioEngagement) * 0.15 +
    clamp(visualEngagement) * 0.15;

  return Math.round(Math.max(0, Math.min(100, rawScore)));
}

/**
 * Bounds checking and smart padding for clip trimming.
 * Ensures the clip starts at or after 0, does not exceed video duration,
 * and maintains minLen / maxLen limits with natural pauses.
 */
export function clampClipTime(
  start: number,
  end: number,
  videoDuration: number,
  minLen: number = 5,
  maxLen: number = 60
): { start: number; end: number; duration: number } {
  const safeStart = Math.max(0, Math.min(start, videoDuration - minLen));
  let safeEnd = Math.max(safeStart + minLen, Math.min(end, videoDuration));

  if (safeEnd - safeStart > maxLen) {
    safeEnd = safeStart + maxLen;
  }
  if (safeEnd - safeStart < minLen) {
    safeEnd = Math.min(videoDuration, safeStart + minLen);
  }

  const duration = Number((safeEnd - safeStart).toFixed(2));
  return {
    start: Number(safeStart.toFixed(2)),
    end: Number(safeEnd.toFixed(2)),
    duration,
  };
}

/**
 * Detects overlapping moments and prevents excessive redundancy in generated reels.
 * Returns non-overlapping or resolved list with overlap scores.
 */
export function detectAndResolveOverlaps(
  moments: DetectedMoment[],
  maxOverlapSeconds: number = 2
): DetectedMoment[] {
  // Sort primarily by score descending, then earlier start time
  const sorted = [...moments].sort((a, b) => b.aiScore - a.aiScore || a.startTime - b.startTime);
  const accepted: DetectedMoment[] = [];

  for (const candidate of sorted) {
    const hasHeavyOverlap = accepted.some((acc) => {
      const overlapStart = Math.max(acc.startTime, candidate.startTime);
      const overlapEnd = Math.min(acc.endTime, candidate.endTime);
      const overlapDuration = Math.max(0, overlapEnd - overlapStart);
      return overlapDuration > maxOverlapSeconds;
    });

    if (!hasHeavyOverlap) {
      accepted.push(candidate);
    }
  }

  // Return sorted chronologically by startTime for seamless gallery layout
  return accepted.sort((a, b) => a.startTime - b.startTime);
}

/**
 * Splits a transcript sentence into synchronized word-level timestamps.
 * Distributes word timings evenly across the segment duration with natural speech pacing.
 */
export function generateWordTimestamps(
  transcript: string,
  startTime: number,
  endTime: number,
  punchlineKeywords: string[] = []
): SubtitleChunk[] {
  if (!transcript || !transcript.trim()) return [];

  const sentences = transcript.split(/(?<=[.?!])\s+/).filter(Boolean);
  const totalDuration = Math.max(0.5, endTime - startTime);
  const totalChars = transcript.length || 1;

  let currentStart = startTime;
  const chunks: SubtitleChunk[] = [];

  for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
    const sentence = sentences[sIdx];
    const sentenceDuration = (sentence.length / totalChars) * totalDuration;
    const sentenceEnd = Math.min(endTime, currentStart + sentenceDuration);

    const wordsRaw = sentence.split(/\s+/).filter(Boolean);
    const wordDuration = wordsRaw.length > 0 ? (sentenceEnd - currentStart) / wordsRaw.length : 0;

    const words: SubtitleWord[] = wordsRaw.map((word, wIdx) => {
      const wStart = currentStart + wIdx * wordDuration;
      const wEnd = wStart + wordDuration;
      const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isPunchline = punchlineKeywords.some(
        (kw) => cleanWord.includes(kw.toLowerCase()) || kw.toLowerCase().includes(cleanWord)
      );

      return {
        word,
        start: Number(wStart.toFixed(2)),
        end: Number(wEnd.toFixed(2)),
        highlighted: isPunchline,
      };
    });

    chunks.push({
      id: `chunk-${sIdx}-${Math.random().toString(36).substring(2, 6)}`,
      startTime: Number(currentStart.toFixed(2)),
      endTime: Number(sentenceEnd.toFixed(2)),
      text: sentence,
      words,
    });

    currentStart = sentenceEnd;
  }

  return chunks;
}

/**
 * Calculates framing coordinates and crop scaling for smart speaker tracking
 * and aspect ratio reframing (e.g. 16:9 landscape to 9:16 vertical shorts).
 */
export function calculateFramingTransform(
  srcWidth: number,
  srcHeight: number,
  targetAspect: AspectRatio,
  focalPointX: number = 50, // 0 - 100 percentage
  focalPointY: number = 50  // 0 - 100 percentage
): {
  cropWidth: number;
  cropHeight: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  aspectRatioValue: number;
} {
  const aspectRatios: Record<AspectRatio, number> = {
    '9:16': 9 / 16,
    '1:1': 1 / 1,
    '4:5': 4 / 5,
    '16:9': 16 / 9,
  };

  const targetRatio = aspectRatios[targetAspect] || 9 / 16;
  const srcRatio = srcWidth / (srcHeight || 1);

  let cropWidth = srcWidth;
  let cropHeight = srcHeight;

  if (srcRatio > targetRatio) {
    // Source is wider than target (e.g. 16:9 to 9:16): crop horizontal sides
    cropWidth = Math.round(srcHeight * targetRatio);
    cropHeight = srcHeight;
  } else {
    // Source is taller than target: crop vertical
    cropWidth = srcWidth;
    cropHeight = Math.round(srcWidth / targetRatio);
  }

  // Calculate focal point offsets bounded within source frame
  const focalPixelX = (focalPointX / 100) * srcWidth;
  const focalPixelY = (focalPointY / 100) * srcHeight;

  let offsetX = focalPixelX - cropWidth / 2;
  let offsetY = focalPixelY - cropHeight / 2;

  // Clamp within source bounds
  offsetX = Math.max(0, Math.min(srcWidth - cropWidth, offsetX));
  offsetY = Math.max(0, Math.min(srcHeight - cropHeight, offsetY));

  return {
    cropWidth: Math.round(cropWidth),
    cropHeight: Math.round(cropHeight),
    offsetX: Math.round(offsetX),
    offsetY: Math.round(offsetY),
    scale: Number((srcWidth / cropWidth).toFixed(2)),
    aspectRatioValue: targetRatio,
  };
}

/**
 * Converts decimal seconds to formatted string (e.g. "01:24" or "01:15:30")
 */
export function formatTimecode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parses timecode string ("01:24" or "01:15:30") back into seconds
 */
export function parseTimecode(str: string): number {
  if (!str) return 0;
  const parts = str.split(':').map((p) => parseFloat(p) || 0);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parseFloat(str) || 0;
}
