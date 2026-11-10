import React, { useState } from 'react';
import {
  ScreenType,
  Project,
  SourceVideo,
  DetectedMoment,
  GeneratedClip,
  UserProfile,
} from './types';
import { SAMPLE_VIDEOS, INITIAL_PROJECTS, INITIAL_MOMENTS, createClipsFromMoments } from './data/sampleData';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ImportVideoScreen } from './components/ImportVideoScreen';
import { VideoAnalysisScreen } from './components/VideoAnalysisScreen';
import { DetectedMomentsScreen } from './components/DetectedMomentsScreen';
import { ConfigureClipsScreen } from './components/ConfigureClipsScreen';
import { ClipsGalleryScreen } from './components/ClipsGalleryScreen';
import { VideoEditorScreen } from './components/VideoEditorScreen';
import { ExportCenterScreen } from './components/ExportCenterScreen';
import { RenderingProgressModal } from './components/RenderingProgressModal';
import { MyProjectsScreen } from './components/MyProjectsScreen';
import { AccountSettingsScreen } from './components/AccountSettingsScreen';
import { generateWordTimestamps } from './utils/videoEngine';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('landing');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProject, setActiveProject] = useState<Project>(INITIAL_PROJECTS[0]);

  // Current workflow state
  const [activeMoments, setActiveMoments] = useState<DetectedMoment[]>(INITIAL_MOMENTS);
  const [activeClipForEditor, setActiveClipForEditor] = useState<GeneratedClip | null>(
    INITIAL_PROJECTS[0].generatedClips[0] || null
  );
  const [activeClipForExport, setActiveClipForExport] = useState<GeneratedClip | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // User Profile
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Alex Creator',
    email: 'creator@funnycut.ai',
    defaultAspectRatio: '9:16',
    defaultCaptionPreset: 'bold-yellow',
    defaultLanguage: 'Automatic',
    defaultResolution: '1080p',
    autoVoiceEnhance: true,
    smartTrimmingEnabled: true,
  });

  // Navigate to screen
  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start project from Landing Page URL
  const handleStartWithUrl = (url: string) => {
    const isDirect = url.match(/\.(mp4|webm|mov)$/i);
    const newSource: SourceVideo = {
      id: `url-source-${Date.now()}`,
      name: isDirect ? url.split('/').pop() || 'Online Video' : 'Online Stream',
      url: isDirect ? url : SAMPLE_VIDEOS[0].url,
      sizeBytes: 52 * 1024 * 1024,
      duration: 120,
      width: 1920,
      height: 1080,
      fps: 30,
      format: 'MP4',
      thumbnail: SAMPLE_VIDEOS[0].thumbnail,
    };
    handleStartAnalysis(newSource, 'Web Video Project');
  };

  // Start project from Sample Video
  const handleStartWithSample = (sample: SourceVideo) => {
    handleStartAnalysis(sample, sample.name);
  };

  // Trigger AI Analysis
  const handleStartAnalysis = (source: SourceVideo, projectTitle: string) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: projectTitle,
      sourceVideo: source,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      detectedMoments: INITIAL_MOMENTS,
      generatedClips: [],
      status: 'analyzing',
      totalExports: 0,
    };

    setActiveProject(newProj);
    setProjects((prev) => [newProj, ...prev]);
    setActiveMoments(INITIAL_MOMENTS);
    setCurrentScreen('analysis');
  };

  // When AI Analysis completes
  const handleAnalysisComplete = (moments: DetectedMoment[]) => {
    setActiveMoments(moments);
    setActiveProject((prev) => ({
      ...prev,
      detectedMoments: moments,
      status: 'ready',
    }));
    setCurrentScreen('moments');
  };

  // From Moments to Configure
  const handleProceedToConfigure = () => {
    setCurrentScreen('configure');
  };

  // From Configure to Generate Clips
  const handleGenerateClips = (config: any) => {
    const selected = activeMoments.filter((m) => m.selected);
    const targetMoments = selected.length > 0 ? selected : activeMoments.slice(0, config.clipCount);

    const generated = targetMoments.slice(0, config.clipCount).map((moment, idx) => {
      const subtitles = generateWordTimestamps(
        moment.transcript,
        0,
        moment.duration,
        moment.keywords
      );

      const clip: GeneratedClip = {
        id: `clip-${activeProject.id}-${moment.id}-${idx}`,
        projectId: activeProject.id,
        momentId: moment.id,
        title: moment.title,
        startTime: moment.startTime,
        endTime: moment.endTime,
        duration: moment.duration,
        aspectRatio: config.aspectRatio,
        resolution: config.resolution,
        editingPreset: config.editingPreset,
        captionStyle: {
          preset: config.captionPreset,
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 28,
          primaryColor: '#FFFFFF',
          highlightColor: '#FACC15',
          backgroundColor: '#000000',
          hasBackground: true,
          textCase: 'uppercase',
          positionY: 72,
          animation: 'bounce',
        },
        autoReframing: {
          mode: 'smart-speaker',
          speakerX: 50,
          speakerY: 45,
          zoom: 1.25,
          faceTrackingActive: config.activeSpeakerTracking,
        },
        colorCorrection: {
          brightness: 5,
          contrast: 10,
          saturation: 15,
          temperature: 0,
          exposure: 0,
        },
        audioMastering: {
          voiceEnhance: true,
          noiseReduction: true,
          musicDucking: config.autoDucking,
          sfxVolume: 80,
          originalVolume: 100,
          backgroundMusicTrack: 'Lo-Fi Comedy Beat',
        },
        timelineTracks: [
          {
            id: 'track-video',
            type: 'video',
            name: 'Video',
            visible: true,
            locked: false,
            muted: false,
            elements: [
              {
                id: `el-v-${moment.id}`,
                trackId: 'track-video',
                type: 'video-chunk',
                name: moment.title,
                startTime: 0,
                duration: moment.duration,
                properties: { scale: 1.25 },
              },
            ],
          },
          {
            id: 'track-captions',
            type: 'captions',
            name: 'Subtitles',
            visible: true,
            locked: false,
            muted: false,
            elements: subtitles.map((s, sIdx) => ({
              id: `el-s-${sIdx}`,
              trackId: 'track-captions',
              type: 'subtitle-chunk',
              name: s.text.substring(0, 20),
              startTime: s.startTime,
              duration: s.endTime - s.startTime,
              content: s.text,
            })),
          },
          {
            id: 'track-overlay',
            type: 'overlay',
            name: 'Stickers & SFX',
            visible: true,
            locked: false,
            muted: false,
            elements: [
              {
                id: `el-stk-${moment.id}`,
                trackId: 'track-overlay',
                type: 'sticker',
                name: '🔥 VIRAL',
                startTime: 1,
                duration: 3,
                properties: { posX: 50, posY: 20 },
              },
            ],
          },
        ],
        thumbnail: moment.thumbnail,
        funnyScore: moment.aiScore,
        category: moment.category,
        status: 'ready',
        createdAt: new Date().toISOString(),
      };

      return clip;
    });

    const updatedProj = {
      ...activeProject,
      generatedClips: generated,
      status: 'ready' as const,
    };

    setActiveProject(updatedProj);
    setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
    setCurrentScreen('gallery');
  };

  // Open Editor for a specific clip
  const handleOpenEditor = (clip: GeneratedClip) => {
    setActiveClipForEditor(clip);
    setCurrentScreen('editor');
  };

  // Save clip updates from Editor
  const handleSaveClip = (updatedClip: GeneratedClip) => {
    setActiveClipForEditor(updatedClip);
    setActiveProject((prev) => ({
      ...prev,
      generatedClips: prev.generatedClips.map((c) => (c.id === updatedClip.id ? updatedClip : c)),
    }));
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id
          ? {
              ...p,
              generatedClips: p.generatedClips.map((c) =>
                c.id === updatedClip.id ? updatedClip : c
              ),
            }
          : p
      )
    );
  };

  // Open Export Center
  const handleOpenExportCenter = (clip: GeneratedClip) => {
    setActiveClipForExport(clip);
    setCurrentScreen('export-center');
  };

  // Start actual rendering modal
  const handleStartRender = (config: any) => {
    setActiveClipForExport(config.clip);
    setIsRendering(true);
  };

  // Duplicate clip
  const handleDuplicateClip = (clip: GeneratedClip) => {
    const duplicated: GeneratedClip = {
      ...clip,
      id: `clip-dup-${Date.now()}`,
      title: `${clip.title} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    setActiveProject((prev) => ({
      ...prev,
      generatedClips: [duplicated, ...prev.generatedClips],
    }));
  };

  // Delete clip
  const handleDeleteClip = (clipId: string) => {
    setActiveProject((prev) => ({
      ...prev,
      generatedClips: prev.generatedClips.filter((c) => c.id !== clipId),
    }));
  };

  // Open Project from Library / Dashboard
  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setActiveMoments(project.detectedMoments || INITIAL_MOMENTS);
    if (project.generatedClips && project.generatedClips.length > 0) {
      setCurrentScreen('gallery');
    } else {
      setCurrentScreen('moments');
    }
  };

  // Duplicate Project
  const handleDuplicateProject = (project: Project) => {
    const dup: Project = {
      ...project,
      id: `proj-copy-${Date.now()}`,
      title: `${project.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects([dup, ...projects]);
  };

  // Delete Project
  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => p.id !== projectId));
  };

  // Clear Cache
  const handleClearCache = () => {
    localStorage.clear();
  };

  // Reset demo data
  const handleResetAllData = () => {
    setProjects(INITIAL_PROJECTS);
    setActiveProject(INITIAL_PROJECTS[0]);
    setActiveMoments(INITIAL_MOMENTS);
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white flex flex-col font-['Plus_Jakarta_Sans']">
      {/* GLOBAL NAVBAR */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        activeProjectTitle={activeProject?.title}
      />

      {/* SCREEN ROUTER */}
      <main className="flex-1">
        {/* Screen 1: Landing Page */}
        {currentScreen === 'landing' && (
          <LandingPage
            onStartWithUrl={handleStartWithUrl}
            onStartWithSample={handleStartWithSample}
            onNavigate={handleNavigate}
          />
        )}

        {/* Screen 2: Dashboard */}
        {currentScreen === 'dashboard' && (
          <Dashboard
            projects={projects}
            onOpenProject={handleOpenProject}
            onNavigate={handleNavigate}
          />
        )}

        {/* Screen 3: Import Video */}
        {currentScreen === 'import' && (
          <ImportVideoScreen
            onStartAnalysis={handleStartAnalysis}
            onCancel={() => handleNavigate('dashboard')}
          />
        )}

        {/* Screen 4: Video Analysis */}
        {currentScreen === 'analysis' && (
          <VideoAnalysisScreen
            sourceVideo={activeProject.sourceVideo}
            projectTitle={activeProject.title}
            onAnalysisComplete={handleAnalysisComplete}
            mockMoments={activeMoments}
          />
        )}

        {/* Screen 5: Detected Moments */}
        {currentScreen === 'moments' && (
          <DetectedMomentsScreen
            moments={activeMoments}
            sourceVideo={activeProject.sourceVideo}
            onUpdateMoments={setActiveMoments}
            onProceedToConfigure={handleProceedToConfigure}
            onBack={() => handleNavigate('import')}
          />
        )}

        {/* Screen 6: Configure & Generate Clips */}
        {currentScreen === 'configure' && (
          <ConfigureClipsScreen
            selectedMoments={activeMoments.filter((m) => m.selected)}
            onGenerate={handleGenerateClips}
            onBack={() => handleNavigate('moments')}
          />
        )}

        {/* Screen 7: Generated Clips Gallery */}
        {currentScreen === 'gallery' && (
          <ClipsGalleryScreen
            clips={activeProject.generatedClips || []}
            onOpenEditor={handleOpenEditor}
            onDownloadClip={handleOpenExportCenter}
            onDuplicateClip={handleDuplicateClip}
            onDeleteClip={handleDeleteClip}
            onNavigate={handleNavigate}
          />
        )}

        {/* Screen 8: Professional Multitrack Video Editor */}
        {currentScreen === 'editor' && activeClipForEditor && (
          <VideoEditorScreen
            clip={activeClipForEditor}
            sourceVideoUrl={activeProject.sourceVideo.url}
            onSaveClip={handleSaveClip}
            onExportClip={handleOpenExportCenter}
            onBack={() => handleNavigate('gallery')}
          />
        )}

        {/* Screen 9: Export Center */}
        {currentScreen === 'export-center' && activeClipForExport && (
          <ExportCenterScreen
            clip={activeClipForExport}
            allClips={activeProject.generatedClips || []}
            onStartRender={handleStartRender}
            onBack={() => (activeClipForEditor ? handleNavigate('editor') : handleNavigate('gallery'))}
          />
        )}

        {/* Screen 11: My Projects */}
        {currentScreen === 'projects' && (
          <MyProjectsScreen
            projects={projects}
            onOpenProject={handleOpenProject}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteProject}
            onNavigate={handleNavigate}
          />
        )}

        {/* Screen 12: Account Settings */}
        {currentScreen === 'settings' && (
          <AccountSettingsScreen
            profile={profile}
            onUpdateProfile={setProfile}
            onClearCache={handleClearCache}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Screen 10: Real Rendering Progress Modal */}
      {isRendering && activeClipForExport && (
        <RenderingProgressModal
          clip={activeClipForExport}
          sourceVideoUrl={activeProject.sourceVideo.url}
          onFinished={(url, filename) => {
            // Update total exports count
            setActiveProject((prev) => ({
              ...prev,
              totalExports: (prev.totalExports || 0) + 1,
            }));
            setProjects((prev) =>
              prev.map((p) =>
                p.id === activeProject.id
                  ? { ...p, totalExports: (p.totalExports || 0) + 1 }
                  : p
              )
            );
          }}
          onClose={() => setIsRendering(false)}
        />
      )}
    </div>
  );
}

export default App;
