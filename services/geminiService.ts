import { GoogleGenAI, Type } from "@google/genai";
import { TimeFrame, SeoAnalysisResult, GeneratedTag, CompetitorAnalysisResult, TrendItem, ContentGenerationResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Robust JSON parser for AI responses.
 * Handles Markdown code blocks, raw JSON, and cleanup.
 */
const parseAIResponse = <T>(text: string, defaultVal: T): T => {
    if (!text) return defaultVal;
    
    try {
        let cleanText = text.trim();
        
        // 1. Try extracting from markdown block
        const markdownMatch = cleanText.match(/```json\n([\s\S]*?)\n```/) || cleanText.match(/```([\s\S]*?)```/);
        if (markdownMatch) {
            cleanText = markdownMatch[1];
        }
        
        // 2. If no markdown, but text contains braces, try to find the JSON object/array
        // This helps if the model adds conversational text before/after the JSON
        if (!markdownMatch) {
            const firstBrace = cleanText.indexOf('{');
            const firstBracket = cleanText.indexOf('[');
            const lastBrace = cleanText.lastIndexOf('}');
            const lastBracket = cleanText.lastIndexOf(']');
            
            const start = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;
            const end = (lastBrace !== -1 && (lastBracket === -1 || lastBrace > lastBracket)) ? lastBrace : lastBracket;

            if (start !== -1 && end !== -1) {
                cleanText = cleanText.substring(start, end + 1);
            }
        }

        return JSON.parse(cleanText) as T;
    } catch (e) {
        console.error("Failed to parse AI response JSON:", e, "Raw text:", text);
        return defaultVal;
    }
};

export const fetchTrendingVideos = async (timeFrame: TimeFrame): Promise<{ trends: TrendItem[], groundingChunks: any[] }> => {
  let timeString = "past 24 hours";
  
  switch (timeFrame) {
    case TimeFrame.HOURS_4:
      timeString = "past 4 hours";
      break;
    case TimeFrame.HOURS_24:
      timeString = "past 24 hours";
      break;
    case TimeFrame.DAYS_7:
      timeString = "past 7 days";
      break;
    case TimeFrame.MONTH_1:
      timeString = "past month";
      break;
    case TimeFrame.YEAR_1:
      timeString = "past year";
      break;
  }
  
  const prompt = `
    Find top trending YouTube videos and Shorts uploaded in the ${timeString}.
    I need exactly 6 Videos and 6 Shorts.
    
    CRITICAL: 
    1. Use Google Search to find videos specifically uploaded or trending within the ${timeString}.
    2. Focus on viral content, high view velocity, and breaking news.
    
    Return a valid JSON object in a markdown code block.
    The JSON structure must be:
    {
      "trends": [
        {
          "rank": 1,
          "title": "Video Title",
          "channel": "Channel Name",
          "views": "View count (e.g. 1.2M)",
          "whyTrending": "A detailed paragraph explaining why this video is viral. Mention specific elements like the thumbnail, hook, or current event connection.",
          "type": "Video" or "Short",
          "url": "YouTube URL if found"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const parsed = parseAIResponse<{ trends: TrendItem[] }>(response.text || "", { trends: [] });

    return {
      trends: parsed.trends || [],
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Error fetching trends:", error);
    throw error;
  }
};

export const analyzeSeo = async (title: string, description: string, tags: string): Promise<SeoAnalysisResult> => {
  const prompt = `
    Act as a world-class YouTube SEO expert. Analyze the following video metadata:
    
    Title: ${title}
    Description: ${description}
    Tags: ${tags}
    
    Provide a JSON response with the following structure:
    {
      "score": number (0-100 overall score),
      "titleScore": number (0-100),
      "descriptionScore": number (0-100),
      "tagsScore": number (0-100),
      "titleFeedback": "Specific feedback for the title (max 20 words)",
      "descriptionFeedback": "Specific feedback for the description (max 20 words)",
      "tagsFeedback": "Specific feedback for the tags (max 20 words)",
      "strengths": string[],
      "weaknesses": string[],
      "suggestions": string[],
      "keywordsFound": string[]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            titleScore: { type: Type.NUMBER },
            descriptionScore: { type: Type.NUMBER },
            tagsScore: { type: Type.NUMBER },
            titleFeedback: { type: Type.STRING },
            descriptionFeedback: { type: Type.STRING },
            tagsFeedback: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywordsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["score", "titleScore", "descriptionScore", "tagsScore", "titleFeedback", "descriptionFeedback", "tagsFeedback", "strengths", "weaknesses", "suggestions", "keywordsFound"]
        }
      }
    });

    const parsed = parseAIResponse<SeoAnalysisResult>(response.text || "", {
      score: 0, titleScore: 0, descriptionScore: 0, tagsScore: 0,
      titleFeedback: "", descriptionFeedback: "", tagsFeedback: "",
      strengths: [], weaknesses: [], suggestions: [], keywordsFound: []
    });

    return parsed;
  } catch (error) {
    console.error("Error analyzing SEO:", error);
    throw error;
  }
};

export const generateTagsAndTitles = async (topic: string): Promise<{ tags: GeneratedTag[], titles: string[] }> => {
  const prompt = `
    Act as a YouTube SEO expert.
    Topic: "${topic}"

    Goal: Generate high-performing metadata using real-time insights.
    
    1. Use Google Search to find trending keywords and high-volume search terms related to this topic RIGHT NOW (past 24 hours).
    2. List 12 optimized tags. 
       - Prioritize "High" volume tags that are currently trending or have high search interest.
       - Ensure tags are strictly relevant to the topic.
       - Volume must be exactly "High", "Medium", or "Low".
       - Relevance is a score 0-100.
    3. Create 5 viral titles using the "High" volume keywords and power words.

    Return valid JSON inside a markdown block:
    \`\`\`json
    {
      "tags": [
        { "tag": "keyword", "volume": "High", "relevance": 95 }
      ],
      "titles": ["Title 1", "Title 2"]
    }
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const parsed = parseAIResponse<{ tags: GeneratedTag[], titles: string[] }>(response.text || "", { tags: [], titles: [] });

    return {
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      titles: Array.isArray(parsed.titles) ? parsed.titles : []
    };
  } catch (error) {
    console.error("Error generating tags:", error);
    throw error;
  }
};

export const generateContentStrategy = async (
  type: string,
  idea: string,
  currentDesc: string,
  currentTags: string,
  duration?: string
): Promise<ContentGenerationResult> => {
  const prompt = `
    Act as a professional YouTube Strategist and Copywriter.
    
    Task: Create a complete optimization package for a ${type}.
    
    Input Details:
    - Main Idea/Topic: "${idea}"
    - User's Draft Description: "${currentDesc}"
    - User's Draft Tags: "${currentTags}"
    - Duration (if relevant): "${duration || 'N/A'}"
    
    Requirements:
    1. Titles: Generate 5 high-CTR, viral-worthy titles. Use power words, curiosity gaps, and clear value propositions.
    2. SEO Description: Write a full, SEO-optimized description. 
       - If the user provided a draft, improve it significantly.
       - Structure it with a Hook (first 2 lines), Content Summary, Key Points, and Call to Action.
       - Include 3 relevant hashtags at the very end.
    3. Keywords: List 10-15 broad and specific keywords relevant to the topic.
    4. Tags: List 20 comma-separated video tags optimized for the YouTube algorithm.
    
    Output Format:
    Return valid JSON:
    {
      "titles": ["Title 1", "Title 2", ...],
      "seoDescription": "Full description text...",
      "keywords": ["keyword 1", "keyword 2", ...],
      "tags": ["tag1", "tag2", ...]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titles: { type: Type.ARRAY, items: { type: Type.STRING } },
            seoDescription: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["titles", "seoDescription", "keywords", "tags"],
        }
      }
    });

    const parsed = parseAIResponse<ContentGenerationResult>(response.text || "", {
      titles: [], seoDescription: "", keywords: [], tags: []
    });

    return parsed;
  } catch (error) {
    console.error("Error generating content strategy:", error);
    throw error;
  }
};

export const analyzeCompetitor = async (competitorInput: string): Promise<CompetitorAnalysisResult> => {
  const prompt = `
    Analyze the YouTube competitor based on this input: "${competitorInput}".
    
    If the input is a URL (e.g. youtube.com/...), extract the channel info from it and analyze that specific channel.
    If the input is a name, use Google Search to find the official channel first.

    Use Google Search to find their channel details, top performing videos (look for high view counts relative to recency), and overall strategy.

    Calculate a 'trendingScore' (0-100) based on how "viral" their recent content is (high views in short time).
    Count how many of their top videos are considered "Trending" or "Viral".

    Return a valid JSON object in a markdown code block.
    The JSON structure must be:
    {
      "competitorName": "Channel Name",
      "channelUrl": "https://youtube.com/...",
      "subscriberCount": "Approximate subs (e.g. 1.2M)",
      "trendingScore": number,
      "trendingVideoCount": number,
      "topVideos": [
        { "title": "Video Title", "views": "View Count", "uploadDate": "Approx date", "url": "URL if available" }
      ],
      "commonKeywords": ["keyword1", "keyword2", ...],
      "thumbnailStrategy": "Description of their thumbnail style (colors, faces, text, etc)",
      "contentStructure": "Description of their video structure (intro, pacing, hook)",
      "uploadSchedule": "Estimated schedule (e.g. Daily, Weekly on Fridays)",
      "strengths": ["point 1", "point 2"],
      "weaknesses": ["point 1", "point 2"]
    }
    
    Focus on the last 3-6 months of data if possible.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const parsed = parseAIResponse<CompetitorAnalysisResult>(response.text || "", {
        competitorName: "Unknown",
        trendingScore: 0,
        trendingVideoCount: 0,
        topVideos: [],
        commonKeywords: [],
        thumbnailStrategy: "",
        contentStructure: "",
        uploadSchedule: "",
        strengths: [],
        weaknesses: []
    });
    
    return parsed;
  } catch (error) {
    console.error("Error analyzing competitor:", error);
    throw error;
  }
};

export const generateVideoDescription = async (title: string, tags: string, length: 'Short' | 'Medium' | 'Long'): Promise<string> => {
  const lengthConfig = {
    'Short': 'concise (approx 50-80 words)',
    'Medium': 'standard length (approx 150-200 words)',
    'Long': 'in-depth and detailed (approx 300+ words)'
  };

  const prompt = `
    You are a YouTube SEO expert. Write a video description for the following:
    
    Video Title: "${title}"
    Tags/Keywords: "${tags}"
    
    Requirements:
    - Length: ${lengthConfig[length]}
    - Tone: Engaging, professional, and optimized for search.
    - Structure:
      1. Strong hook in the first sentence using the main keyword.
      2. Value proposition (what viewers will learn).
      3. Call to Action (CTA).
    - Include the tags naturally where relevant.
    - Do not use hashtags in the main text (append 3 relevant hashtags at the end).
    
    Return ONLY the raw description text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating description:", error);
    throw error;
  }
};