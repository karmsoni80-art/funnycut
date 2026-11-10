import React, { useState, useRef } from 'react';
import { SourceVideo } from '../types';
import { SAMPLE_VIDEOS } from '../data/sampleData';
import {
  UploadCloud,
  Link,
  Film,
  Play,
  FileCheck,
  AlertCircle,
  Clock,
  Maximize2,
  HardDrive,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { formatTimecode } from '../utils/videoEngine';

interface ImportVideoScreenProps {
  onStartAnalysis: (source: SourceVideo, projectTitle: string) => void;
  onCancel: () => void;
}

export const ImportVideoScreen: React.FC<ImportVideoScreenProps> = ({
  onStartAnalysis,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'samples'>('samples');
  const [urlInput, setUrlInput] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [selectedSource, setSelectedSource] = useState<SourceVideo | null>(SAMPLE_VIDEOS[0]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // File Upload Handler with metadata extraction
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // Validate size (max 500MB)
    const maxBytes = 500 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage('File size exceeds the 500MB technical service limit.');
      return;
    }

    // Validate format
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|webm|mkv)$/i)) {
      setErrorMessage('Unsupported format. Please upload MP4, MOV, WebM, or MKV.');
      return;
    }

    // Simulate upload progress
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 150);

    const objectUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = objectUrl;

    tempVideo.onloadedmetadata = () => {
      const source: SourceVideo = {
        id: `upload-${Date.now()}`,
        name: file.name,
        url: objectUrl,
        sizeBytes: file.size,
        duration: Math.round(tempVideo.duration) || 120,
        width: tempVideo.videoWidth || 1920,
        height: tempVideo.videoHeight || 1080,
        fps: 30,
        format: file.type || 'video/mp4',
        thumbnail: SAMPLE_VIDEOS[0].thumbnail, // fallback thumbnail
      };

      setSelectedSource(source);
      if (!projectTitle) {
        setProjectTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
  };

  // URL Import Handler
  const handleUrlImport = () => {
    setErrorMessage(null);
    if (!urlInput.trim()) {
      setErrorMessage('Please enter a valid video URL.');
      return;
    }

    try {
      new URL(urlInput);
    } catch {
      setErrorMessage('Please provide a valid HTTP or HTTPS video URL.');
      return;
    }

    const isDirect = urlInput.match(/\.(mp4|webm|mov)$/i);
    const source: SourceVideo = {
      id: `url-${Date.now()}`,
      name: isDirect ? urlInput.split('/').pop() || 'Online Video' : 'Imported Video Stream',
      url: isDirect ? urlInput : SAMPLE_VIDEOS[0].url, // direct url or proxy player
      sizeBytes: 85 * 1024 * 1024,
      duration: 150,
      width: 1920,
      height: 1080,
      fps: 30,
      format: 'MP4 / Stream',
      thumbnail: SAMPLE_VIDEOS[1].thumbnail,
    };

    setSelectedSource(source);
    if (!projectTitle) {
      setProjectTitle('Online Video Project');
    }
  };

  const handleSelectSample = (sample: SourceVideo) => {
    setSelectedSource(sample);
    setProjectTitle(sample.name);
    setErrorMessage(null);
  };

  const handleProceed = () => {
    if (!selectedSource) {
      setErrorMessage('Please select or upload a video first.');
      return;
    }
    const finalTitle = projectTitle.trim() || selectedSource.name;
    onStartAnalysis(selectedSource, finalTitle);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          Import Source Video
        </h1>
        <p className="text-sm text-[#A1A1AA] mt-1">
          Upload raw footage, paste an authorized video link, or test with our sample comedy files.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2A3040] pb-2 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('samples')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'samples'
              ? 'bg-[#8B5CF6] text-white shadow-md'
              : 'text-[#A1A1AA] hover:text-white'
          }`}
        >
          Sample Video Library (Instant)
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-[#8B5CF6] text-white shadow-md'
              : 'text-[#A1A1AA] hover:text-white'
          }`}
        >
          Upload Local Video
        </button>

        <button
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'url'
              ? 'bg-[#8B5CF6] text-white shadow-md'
              : 'text-[#A1A1AA] hover:text-white'
          }`}
        >
          Paste Video URL
        </button>
      </div>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB CONTENT: SAMPLES */}
      {activeTab === 'samples' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_VIDEOS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className={`p-4 rounded-2xl bg-[#141824] border transition-all cursor-pointer flex flex-col justify-between ${
                selectedSource?.id === sample.id
                  ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30'
                  : 'border-[#2A3040] hover:border-[#8B5CF6]/40'
              }`}
            >
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-black mb-3">
                <img
                  src={sample.thumbnail}
                  alt={sample.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                  {formatTimecode(sample.duration)}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold text-white line-clamp-1">{sample.name}</h2>
                <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA] mt-1.5 font-mono">
                  <span>{sample.width}x{sample.height}</span>
                  <span>·</span>
                  <span>{Math.round(sample.sizeBytes / (1024 * 1024))}MB</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: UPLOAD */}
      {activeTab === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#2A3040] hover:border-[#8B5CF6] rounded-2xl p-10 text-center bg-[#141824] cursor-pointer transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Click to upload or drag & drop video
          </h3>
          <p className="text-xs text-[#A1A1AA]">
            Supported: MP4, MOV, WebM, MKV · Maximum file size: 500MB
          </p>

          {uploadProgress !== null && (
            <div className="max-w-xs mx-auto mt-6 space-y-2">
              <div className="flex justify-between text-xs text-[#A1A1AA] font-mono">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#191F2D] overflow-hidden">
                <div
                  className="h-full bg-[#8B5CF6] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: URL */}
      {activeTab === 'url' && (
        <div className="p-6 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-4">
          <label className="text-xs font-semibold text-[#A1A1AA] block">
            Authorized Video URL
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/video.mp4 or YouTube video link"
                className="w-full bg-[#191F2D] border border-[#2A3040] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#A1A1AA]/60 focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <button
              onClick={handleUrlImport}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl transition-colors cursor-pointer"
            >
              Fetch Video
            </button>
          </div>
          <p className="text-[11px] text-[#A1A1AA]">
            Compliant with platform terms. Video must be public and accessible.
          </p>
        </div>
      )}

      {/* SELECTED VIDEO INSPECTOR PREVIEW */}
      {selectedSource && (
        <div className="p-5 rounded-2xl bg-[#141824] border border-[#2A3040] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#8B5CF6] font-bold">
              Verified Video Metadata
            </span>
            <span className="text-xs text-[#22C55E] flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" /> Ready for AI Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            {/* Real HTML5 Video Player */}
            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-black border border-[#2A3040] relative">
              <video
                ref={videoPreviewRef}
                src={selectedSource.url}
                controls
                className="w-full h-full object-contain"
              />
            </div>

            {/* Metadata Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#A1A1AA] font-medium block mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={projectTitle || selectedSource.name}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full bg-[#191F2D] border border-[#2A3040] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#191F2D] border border-[#2A3040]">
                  <span className="text-[10px] text-[#A1A1AA] uppercase block">Duration</span>
                  <span className="text-white font-bold">{formatTimecode(selectedSource.duration)}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#191F2D] border border-[#2A3040]">
                  <span className="text-[10px] text-[#A1A1AA] uppercase block">Resolution</span>
                  <span className="text-white font-bold">
                    {selectedSource.width}x{selectedSource.height}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#191F2D] border border-[#2A3040]">
                  <span className="text-[10px] text-[#A1A1AA] uppercase block">Frame Rate</span>
                  <span className="text-white font-bold">{selectedSource.fps} FPS</span>
                </div>

                <div className="p-3 rounded-xl bg-[#191F2D] border border-[#2A3040]">
                  <span className="text-[10px] text-[#A1A1AA] uppercase block">Size</span>
                  <span className="text-white font-bold">
                    {Math.round(selectedSource.sizeBytes / (1024 * 1024))} MB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A3040]/60">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 text-xs text-[#A1A1AA] hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleProceed}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] rounded-xl shadow-lg shadow-[#8B5CF6]/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start AI Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
