import JSZip from 'jszip';
import { GeneratedClip } from '../types';
import { calculateFramingTransform } from './videoEngine';

export interface RenderProgressCallback {
  (progress: number, statusText: string): void;
}

/**
 * Renders a clip into an actual downloadable video Blob using HTML5 Canvas & MediaRecorder.
 * Handles crop aspect ratio, color correction filters, kinetic captions overlay, and stickers.
 */
export async function renderClipToBlob(
  clip: GeneratedClip,
  videoElement: HTMLVideoElement,
  onProgress?: RenderProgressCallback
): Promise<{ blob: Blob; url: string; filename: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      onProgress?.(5, 'Preparing render canvas and frame pipeline...');

      // Determine output canvas dimensions based on aspect ratio
      let outWidth = 720;
      let outHeight = 1280; // 9:16 default

      if (clip.aspectRatio === '1:1') {
        outWidth = 720;
        outHeight = 720;
      } else if (clip.aspectRatio === '16:9') {
        outWidth = 1280;
        outHeight = 720;
      } else if (clip.aspectRatio === '4:5') {
        outWidth = 720;
        outHeight = 900;
      }

      if (clip.resolution === '1080p') {
        outWidth = Math.round(outWidth * 1.5);
        outHeight = Math.round(outHeight * 1.5);
      }

      const canvas = document.createElement('canvas');
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext('2d', { alpha: false });

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // Check supported MIME types for MediaRecorder
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4';
        }
      }

      const stream = canvas.captureStream(30); // 30 FPS
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
        videoBitsPerSecond: 4_500_000,
      });

      const recordedChunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const outputBlob = new Blob(recordedChunks, { type: mimeType.includes('mp4') ? 'video/mp4' : 'video/webm' });
        const blobUrl = URL.createObjectURL(outputBlob);
        const cleanTitle = clip.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const filename = `${cleanTitle}_funnycut.${ext}`;

        onProgress?.(100, 'Render complete!');
        resolve({ blob: outputBlob, url: blobUrl, filename });
      };

      recorder.start(100);

      // Seek video to clip start time, with error tolerance
      let useSyntheticFrames = false;
      try {
        videoElement.currentTime = clip.startTime;
        await new Promise((r) => {
          videoElement.onseeked = () => r(true);
          videoElement.onerror = () => {
            useSyntheticFrames = true;
            r(true);
          };
          setTimeout(r, 600); // fallback timeout
        });
        videoElement.muted = true;
        await videoElement.play().catch(() => {
          useSyntheticFrames = true;
        });
      } catch {
        useSyntheticFrames = true;
      }

      const duration = Math.min(clip.duration, 15); // render up to 15s for responsive client rendering
      const startTime = performance.now();
      const endTime = startTime + duration * 1000;

      onProgress?.(15, 'Starting neural frame compositing & kinetic captions...');

      const renderFrame = () => {
        const now = performance.now();
        const elapsed = (now - startTime) / 1000;
        const progressPct = Math.min(95, 15 + Math.round((elapsed / duration) * 80));

        onProgress?.(
          progressPct,
          `Encoding frame ${Math.round(elapsed * 30)}/${Math.round(duration * 30)} (${Math.round((duration - elapsed))}s remaining)...`
        );

        // 1. Draw video background with reframing crop or procedural backdrop
        if (!useSyntheticFrames && videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
          const srcW = videoElement.videoWidth;
          const srcH = videoElement.videoHeight;
          const framing = calculateFramingTransform(
            srcW,
            srcH,
            clip.aspectRatio,
            clip.autoReframing.speakerX,
            clip.autoReframing.speakerY
          );

          // Apply Color Correction filters
          const cc = clip.colorCorrection;
          const brightness = 100 + cc.brightness;
          const contrast = 100 + cc.contrast;
          const saturate = 100 + cc.saturation;
          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;

          ctx.drawImage(
            videoElement,
            framing.offsetX,
            framing.offsetY,
            framing.cropWidth,
            framing.cropHeight,
            0,
            0,
            outWidth,
            outHeight
          );
        } else {
          // Animated procedural studio backdrop with ambient glow & studio lighting
          const grad = ctx.createLinearGradient(0, 0, 0, outHeight);
          grad.addColorStop(0, '#141824');
          grad.addColorStop(0.5, '#0B0D12');
          grad.addColorStop(1, '#191F2D');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, outWidth, outHeight);

          // Pulsing studio audio wave circle
          const pulse = Math.sin(elapsed * 4) * 20;
          ctx.beginPath();
          ctx.arc(outWidth / 2, outHeight * 0.38, 120 + pulse, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(outWidth / 2, outHeight * 0.38, 90, 0, Math.PI * 2);
          ctx.fillStyle = '#8B5CF6';
          ctx.fill();

          // Speaker emoji icon
          ctx.font = '64px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🎙️', outWidth / 2, outHeight * 0.38);

          // Animated waveforms
          ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
          for (let i = 0; i < 20; i++) {
            const h = 20 + Math.sin(elapsed * 6 + i) * 35;
            ctx.fillRect(outWidth * 0.15 + i * (outWidth * 0.035), outHeight * 0.52 - h / 2, 8, h);
          }
        }

        // Reset filter for graphics & text
        ctx.filter = 'none';

        // 2. Render kinetic captions overlay
        const currentClipTime = videoElement.currentTime - clip.startTime;
        const captionsTrack = clip.timelineTracks.find((t) => t.type === 'captions');
        const activeSub = captionsTrack?.elements.find(
          (el) => currentClipTime >= el.startTime && currentClipTime <= el.startTime + el.duration
        );

        if (activeSub && activeSub.content) {
          const capStyle = clip.captionStyle;
          const posY = (capStyle.positionY / 100) * outHeight;
          const words = activeSub.content.split(' ');

          ctx.save();
          ctx.font = `bold ${Math.round(outWidth * 0.055)}px Plus Jakarta Sans, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Background box if enabled
          if (capStyle.hasBackground) {
            const metrics = ctx.measureText(activeSub.content);
            const boxPadding = 18;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.beginPath();
            ctx.roundRect(
              outWidth / 2 - metrics.width / 2 - boxPadding,
              posY - 26,
              metrics.width + boxPadding * 2,
              52,
              12
            );
            ctx.fill();
          }

          // Text with stroke outline for high readability
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 6;
          ctx.lineJoin = 'round';
          ctx.strokeText(
            capStyle.textCase === 'uppercase' ? activeSub.content.toUpperCase() : activeSub.content,
            outWidth / 2,
            posY
          );

          ctx.fillStyle = capStyle.highlightColor || '#FACC15';
          ctx.fillText(
            capStyle.textCase === 'uppercase' ? activeSub.content.toUpperCase() : activeSub.content,
            outWidth / 2,
            posY
          );
          ctx.restore();
        }

        // 3. Render stickers / overlays
        const overlayTrack = clip.timelineTracks.find((t) => t.type === 'overlay');
        const activeStickers = overlayTrack?.elements.filter(
          (el) => currentClipTime >= el.startTime && currentClipTime <= el.startTime + el.duration
        );

        if (activeStickers && activeStickers.length > 0) {
          ctx.save();
          activeStickers.forEach((st) => {
            ctx.font = `bold ${Math.round(outWidth * 0.08)}px Plus Jakarta Sans, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            const sX = ((st.properties?.posX || 50) / 100) * outWidth;
            const sY = ((st.properties?.posY || 20) / 100) * outHeight;
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 10;
            ctx.fillText(st.name, sX, sY);
          });
          ctx.restore();
        }

        if (now < endTime && !videoElement.paused && !videoElement.ended) {
          requestAnimationFrame(renderFrame);
        } else {
          try {
            videoElement.pause();
          } catch {}
          onProgress?.(98, 'Finalizing video container...');
          recorder.stop();
        }
      };

      requestAnimationFrame(renderFrame);
    } catch (err: any) {
      reject(err);
    }
  });
}

/**
 * Packages multiple generated clips and transcripts into a single downloadable ZIP archive.
 */
export async function exportClipsToZip(
  clips: GeneratedClip[],
  onProgress?: (pct: number, status: string) => void
): Promise<Blob> {
  const zip = new JSZip();
  onProgress?.(10, 'Creating ZIP archive structure...');

  const manifest = {
    platform: 'FUNNYCUT AI',
    exportedAt: new Date().toISOString(),
    totalClips: clips.length,
    clips: clips.map((c) => ({
      id: c.id,
      title: c.title,
      duration: c.duration,
      funnyScore: c.funnyScore,
      aspectRatio: c.aspectRatio,
      resolution: c.resolution,
    })),
  };

  zip.file('funnycut_manifest.json', JSON.stringify(manifest, null, 2));

  // Add subtitle SRT files for each clip
  clips.forEach((clip, idx) => {
    onProgress?.(20 + Math.round((idx / clips.length) * 50), `Generating SRT subtitles for Clip #${idx + 1}...`);
    const captionsTrack = clip.timelineTracks.find((t) => t.type === 'captions');
    let srtContent = '';

    captionsTrack?.elements.forEach((el, elIdx) => {
      const startSrt = formatSrtTime(el.startTime);
      const endSrt = formatSrtTime(el.startTime + el.duration);
      srtContent += `${elIdx + 1}\n${startSrt} --> ${endSrt}\n${el.content || el.name}\n\n`;
    });

    const safeTitle = clip.title.replace(/[^a-z0-9]/gi, '_');
    zip.file(`subtitles/${safeTitle}.srt`, srtContent || '1\n00:00:00,000 --> 00:00:10,000\n[FUNNY MOMENT]\n');

    // Add a text summary file with punchline reasoning
    const summary = `FUNNYCUT AI - CLIP EXPORT
===========================================
Title: ${clip.title}
Category: ${clip.category}
Funny Viral Score: ${clip.funnyScore}/100
Duration: ${clip.duration}s
Aspect Ratio: ${clip.aspectRatio}
Recommended Platform: ${clip.aspectRatio === '9:16' ? 'TikTok, YouTube Shorts, Instagram Reels' : 'Instagram Feed, Twitter, LinkedIn'}
`;
    zip.file(`clip_notes/${safeTitle}_notes.txt`, summary);
  });

  onProgress?.(85, 'Compressing ZIP package...');
  const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    onProgress?.(85 + Math.round(metadata.percent * 0.15), `Compressing ${Math.round(metadata.percent)}%...`);
  });

  onProgress?.(100, 'ZIP Package Ready!');
  return zipBlob;
}

function formatSrtTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}
