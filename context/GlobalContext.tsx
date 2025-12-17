import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TrendItem, GroundingChunk, CompetitorItem, SeoAnalysisResult, GeneratedTag, ContentGenerationResult, TimeFrame, SavedProject } from '../types';

interface GlobalState {
  // Trending
  trendingData: { trends: TrendItem[], chunks: GroundingChunk[] } | null;
  setTrendingData: (data: { trends: TrendItem[], chunks: GroundingChunk[] } | null) => void;
  trendingTimeFrame: TimeFrame;
  setTrendingTimeFrame: (tf: TimeFrame) => void;
  
  // Competitor
  competitors: CompetitorItem[];
  setCompetitors: React.Dispatch<React.SetStateAction<CompetitorItem[]>>;
  
  // SEO Analyzer
  seoResult: SeoAnalysisResult | null;
  setSeoResult: (data: SeoAnalysisResult | null) => void;
  seoInputs: { title: string; description: string; tags: string };
  setSeoInputs: (data: { title: string; description: string; tags: string }) => void;

  // Tag Generator
  tagGenResult: { tags: GeneratedTag[]; titles: string[] } | null;
  setTagGenResult: (data: { tags: GeneratedTag[]; titles: string[] } | null) => void;
  tagGenTopic: string;
  setTagGenTopic: (topic: string) => void;

  // Content Creator
  contentCreatorResult: ContentGenerationResult | null;
  setContentCreatorResult: (data: ContentGenerationResult | null) => void;
  contentCreatorInputs: { contentType: string; idea: string; description: string; tags: string; duration: string };
  setContentCreatorInputs: (data: { contentType: string; idea: string; description: string; tags: string; duration: string }) => void;

  // Saved Projects
  savedProjects: SavedProject[];
  addSavedProject: (project: SavedProject) => void;
  deleteSavedProject: (id: string) => void;
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Trending
  const [trendingData, setTrendingData] = useState<{ trends: TrendItem[], chunks: GroundingChunk[] } | null>(null);
  const [trendingTimeFrame, setTrendingTimeFrame] = useState<TimeFrame>(() => {
     return (localStorage.getItem('haiiq_trendingTimeFrame') as TimeFrame) || TimeFrame.HOURS_24;
  });

  // Competitor
  const [competitors, setCompetitors] = useState<CompetitorItem[]>([]);

  // SEO
  const [seoResult, setSeoResult] = useState<SeoAnalysisResult | null>(null);
  const [seoInputs, setSeoInputs] = useState({ title: '', description: '', tags: '' });

  // Tag Gen
  const [tagGenResult, setTagGenResult] = useState<{ tags: GeneratedTag[]; titles: string[] } | null>(null);
  const [tagGenTopic, setTagGenTopic] = useState('');

  // Content Creator
  const [contentCreatorResult, setContentCreatorResult] = useState<ContentGenerationResult | null>(null);
  const [contentCreatorInputs, setContentCreatorInputs] = useState({ 
    contentType: 'Long Video', idea: '', description: '', tags: '', duration: '' 
  });

  // Saved Projects State
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => {
    try {
      const saved = localStorage.getItem('haiiq_savedProjects');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load saved projects", e);
      return [];
    }
  });

  const addSavedProject = (project: SavedProject) => {
    setSavedProjects(prev => {
      const updated = [project, ...prev];
      localStorage.setItem('haiiq_savedProjects', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteSavedProject = (id: string) => {
    setSavedProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('haiiq_savedProjects', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <GlobalContext.Provider value={{
      trendingData, setTrendingData, trendingTimeFrame, setTrendingTimeFrame,
      competitors, setCompetitors,
      seoResult, setSeoResult, seoInputs, setSeoInputs,
      tagGenResult, setTagGenResult, tagGenTopic, setTagGenTopic,
      contentCreatorResult, setContentCreatorResult, contentCreatorInputs, setContentCreatorInputs,
      savedProjects, addSavedProject, deleteSavedProject
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalProvider');
  }
  return context;
};