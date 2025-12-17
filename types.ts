export interface TrendItem {
  rank: number;
  title: string;
  channel: string;
  views: string;
  whyTrending: string;
  type: 'Video' | 'Short';
  url?: string;
}

export interface SeoAnalysisResult {
  score: number;
  titleScore: number;
  descriptionScore: number;
  tagsScore: number;
  titleFeedback: string;
  descriptionFeedback: string;
  tagsFeedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywordsFound: string[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export enum TimeFrame {
  HOURS_4 = '4h',
  HOURS_24 = '24h',
  DAYS_7 = '7d',
  MONTH_1 = '1m',
  YEAR_1 = '1y'
}

export interface GeneratedTag {
  tag: string;
  volume: 'High' | 'Medium' | 'Low';
  relevance: number;
}

export interface ContentGenerationResult {
  titles: string[];
  seoDescription: string;
  keywords: string[];
  tags: string[];
}

export interface CompetitorAnalysisResult {
  competitorName: string;
  channelUrl?: string;
  subscriberCount?: string;
  trendingScore: number;
  trendingVideoCount: number;
  topVideos: {
    title: string;
    views: string;
    uploadDate: string;
    url?: string;
  }[];
  commonKeywords: string[];
  thumbnailStrategy: string;
  contentStructure: string;
  uploadSchedule: string;
  strengths: string[];
  weaknesses: string[];
}

export type CompetitorItem = CompetitorAnalysisResult & {
  id: number;
  timestamp: number;
};

export interface SavedProject extends ContentGenerationResult {
  id: string;
  timestamp: number;
  idea: string;
  contentType: string;
}