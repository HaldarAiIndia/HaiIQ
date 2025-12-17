import React, { useState } from 'react';
import { generateContentStrategy } from '../services/geminiService';
import { SavedProject } from '../types';
import { PenTool, Zap, Video, Radio, FileText, Loader2, Sparkles, Copy, Clock, Hash, AlignLeft, Save, Check, Edit2 } from 'lucide-react';
import { useGlobalState } from '../context/GlobalContext';

type ContentType = 'Shorts' | 'Long Video' | 'Post' | 'Live';

const ContentCreator: React.FC = () => {
  const { 
    contentCreatorResult, 
    setContentCreatorResult, 
    contentCreatorInputs, 
    setContentCreatorInputs,
    addSavedProject 
  } = useGlobalState();
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleInputChange = (field: keyof typeof contentCreatorInputs, value: string) => {
    setContentCreatorInputs({ ...contentCreatorInputs, [field]: value });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentCreatorInputs.idea) return;

    setLoading(true);
    setContentCreatorResult(null); 
    setSaved(false);
    try {
      const data = await generateContentStrategy(
          contentCreatorInputs.contentType, 
          contentCreatorInputs.idea, 
          contentCreatorInputs.description, 
          contentCreatorInputs.tags, 
          contentCreatorInputs.duration
      );
      if (data && data.titles && data.titles.length > 0) {
          setContentCreatorResult(data);
      } else {
          console.error("Generated data was empty");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!contentCreatorResult) return;
    
    // Safer ID generation
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);

    const newProject: SavedProject = {
      ...contentCreatorResult,
      id,
      timestamp: Date.now(),
      idea: contentCreatorInputs.idea,
      contentType: contentCreatorInputs.contentType
    };

    addSavedProject(newProject);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Helper to handle array updates
  const updateTitle = (index: number, val: string) => {
     if (!contentCreatorResult) return;
     const newTitles = [...contentCreatorResult.titles];
     newTitles[index] = val;
     setContentCreatorResult({ ...contentCreatorResult, titles: newTitles });
  };

  const updateTags = (val: string) => {
     if (!contentCreatorResult) return;
     setContentCreatorResult({ ...contentCreatorResult, tags: val.split(',').map(t => t.trim()) });
  };

  const updateKeywords = (val: string) => {
     if (!contentCreatorResult) return;
     setContentCreatorResult({ ...contentCreatorResult, keywords: val.split(',').map(t => t.trim()) });
  };
  
  // Helper to update result description
  const updateResultDescription = (val: string) => {
      if (!contentCreatorResult) return;
      setContentCreatorResult({ ...contentCreatorResult, seoDescription: val });
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
           <PenTool className="text-red-500" />
           Content Creator Studio
        </h1>
        <p className="text-gray-400">Turn a simple idea into a fully optimized publishing package.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Inputs */}
        <div className="lg:col-span-4 space-y-6">
           <form onSubmit={handleGenerate} className="bg-[#161616] p-6 rounded-2xl border border-[#272727] space-y-5 sticky top-6">
              
              {/* Content Type Selector */}
              <div>
                 <label className="block text-sm font-medium text-gray-300 mb-3">Content Type</label>
                 <div className="grid grid-cols-2 gap-2">
                    {(['Shorts', 'Long Video', 'Post', 'Live'] as ContentType[]).map((type) => (
                       <button
                          key={type}
                          type="button"
                          onClick={() => handleInputChange('contentType', type)}
                          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                             contentCreatorInputs.contentType === type 
                             ? 'bg-red-600 border-red-500 text-white' 
                             : 'bg-[#0f0f0f] border-[#333] text-gray-400 hover:border-gray-500'
                          }`}
                       >
                          {type === 'Shorts' && <Zap size={14} />}
                          {type === 'Long Video' && <Video size={14} />}
                          {type === 'Post' && <FileText size={14} />}
                          {type === 'Live' && <Radio size={14} />}
                          {type}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Idea / Title */}
              <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">Video Idea / Working Title <span className="text-red-500">*</span></label>
                 <input
                    type="text"
                    required
                    value={contentCreatorInputs.idea}
                    onChange={(e) => handleInputChange('idea', e.target.value)}
                    placeholder="e.g. I survived 100 days in Hardcore Minecraft"
                    className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                 />
              </div>

              {/* Description Draft */}
              <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <AlignLeft size={14} /> Description Draft <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                 </label>
                 <textarea
                    rows={3}
                    value={contentCreatorInputs.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Paste your rough notes or draft here..."
                    className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none text-sm"
                 />
              </div>

              {/* Tags Draft */}
              <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Hash size={14} /> Your Tags <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                 </label>
                 <input
                    type="text"
                    value={contentCreatorInputs.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="minecraft, gaming, hardcore..."
                    className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
                 />
              </div>

              {/* Video Time (Only for Long Video) */}
              {contentCreatorInputs.contentType === 'Long Video' && (
                 <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                       <Clock size={14} /> Estimated Duration
                    </label>
                    <input
                       type="text"
                       value={contentCreatorInputs.duration}
                       onChange={(e) => handleInputChange('duration', e.target.value)}
                       placeholder="e.g. 12:30"
                       className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    />
                 </div>
              )}

              <button
                 type="submit"
                 disabled={loading || !contentCreatorInputs.idea}
                 className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-red-900/20"
              >
                 {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                 Generate Metadata
              </button>

           </form>
        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="lg:col-span-8 space-y-6">
           {loading ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-[#161616] rounded-2xl border border-[#272727]">
                 <Loader2 className="animate-spin text-red-500 mb-6" size={48} />
                 <h3 className="text-xl font-bold text-white mb-2">Crafting your content...</h3>
                 <p className="text-gray-400">Analyzing keywords, optimizing hooks, and generating viral titles.</p>
              </div>
           ) : contentCreatorResult ? (
              <div className="animate-fade-in space-y-6">
                 
                 {/* Action Bar */}
                 <div className="flex justify-between items-center mb-2">
                    <div className="text-xs text-gray-500 italic">
                        All fields below are editable. Click to type.
                    </div>
                    <button 
                       onClick={handleSave}
                       disabled={saved}
                       className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          saved 
                          ? 'bg-green-600/20 text-green-500 border border-green-600/30' 
                          : 'bg-[#1f1f1f] text-gray-300 border border-[#333] hover:text-white hover:border-gray-500'
                       }`}
                    >
                       {saved ? <Check size={16} /> : <Save size={16} />}
                       {saved ? 'Saved!' : 'Save Project'}
                    </button>
                 </div>

                 {/* 1. Titles Section */}
                 <div className="bg-[#161616] rounded-2xl border border-[#272727] overflow-hidden">
                    <div className="bg-[#1f1f1f] px-6 py-4 border-b border-[#272727] flex justify-between items-center">
                       <h3 className="font-bold text-white flex items-center gap-2">
                          <span className="bg-red-500 w-6 h-6 rounded flex items-center justify-center text-xs">1</span>
                          Viral Titles
                       </h3>
                    </div>
                    <div className="p-6 space-y-3">
                       {contentCreatorResult?.titles?.map((title, i) => (
                          <div key={i} className="group flex justify-between items-center p-2 rounded-lg bg-[#0f0f0f] border border-[#333] hover:border-gray-500 transition-colors focus-within:border-red-500">
                             <input 
                                className="w-full bg-transparent border-none outline-none text-gray-200 font-medium placeholder-gray-600"
                                value={title}
                                onChange={(e) => updateTitle(i, e.target.value)}
                             />
                             <button onClick={() => copyToClipboard(title)} className="text-gray-500 hover:text-white px-2">
                                <Copy size={16} />
                             </button>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* 2. Description Section */}
                 <div className="bg-[#161616] rounded-2xl border border-[#272727] overflow-hidden">
                    <div className="bg-[#1f1f1f] px-6 py-4 border-b border-[#272727] flex justify-between items-center">
                       <h3 className="font-bold text-white flex items-center gap-2">
                          <span className="bg-blue-500 w-6 h-6 rounded flex items-center justify-center text-xs">2</span>
                          SEO Description
                       </h3>
                       <button onClick={() => copyToClipboard(contentCreatorResult.seoDescription)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                          <Copy size={12} /> Copy
                       </button>
                    </div>
                    <div className="p-6">
                       <textarea 
                          value={contentCreatorResult.seoDescription} 
                          onChange={(e) => updateResultDescription(e.target.value)}
                          className="w-full h-80 bg-[#0f0f0f] text-gray-300 text-sm p-4 rounded-lg border border-[#333] outline-none resize-none font-mono leading-relaxed focus:border-blue-500 transition-colors"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 3. Keywords */}
                    <div className="bg-[#161616] rounded-2xl border border-[#272727] overflow-hidden flex flex-col">
                       <div className="bg-[#1f1f1f] px-6 py-4 border-b border-[#272727] flex justify-between items-center">
                          <h3 className="font-bold text-white flex items-center gap-2">
                             <span className="bg-purple-500 w-6 h-6 rounded flex items-center justify-center text-xs">3</span>
                             Target Keywords
                          </h3>
                          <button onClick={() => copyToClipboard(contentCreatorResult.keywords?.join(', ') || '')} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                             <Copy size={12} /> Copy
                          </button>
                       </div>
                       <div className="p-6 flex-1 flex flex-col">
                           <textarea
                                className="flex-1 w-full bg-[#0f0f0f] border border-[#333] rounded-lg p-3 text-xs text-purple-200 focus:border-purple-500 outline-none resize-none font-mono"
                                value={contentCreatorResult.keywords?.join(', ')}
                                onChange={(e) => updateKeywords(e.target.value)}
                                placeholder="Edit keywords here, separated by commas..."
                           />
                           <p className="text-[10px] text-gray-500 mt-2">Comma separated. Edit to add more.</p>
                       </div>
                    </div>

                    {/* 4. Tags */}
                    <div className="bg-[#161616] rounded-2xl border border-[#272727] overflow-hidden flex flex-col">
                       <div className="bg-[#1f1f1f] px-6 py-4 border-b border-[#272727] flex justify-between items-center">
                          <h3 className="font-bold text-white flex items-center gap-2">
                             <span className="bg-emerald-500 w-6 h-6 rounded flex items-center justify-center text-xs">4</span>
                             Tags
                          </h3>
                          <button onClick={() => copyToClipboard(contentCreatorResult.tags?.join(', ') || '')} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                             <Copy size={12} /> Copy All
                          </button>
                       </div>
                       <div className="p-6 flex-1 flex flex-col">
                          <textarea
                                className="flex-1 w-full bg-[#0f0f0f] border border-[#333] rounded-lg p-3 text-xs text-emerald-200 focus:border-emerald-500 outline-none resize-none font-mono leading-loose"
                                value={contentCreatorResult.tags?.join(', ')}
                                onChange={(e) => updateTags(e.target.value)}
                                placeholder="Edit tags here, separated by commas..."
                           />
                           <p className="text-[10px] text-gray-500 mt-2">Comma separated. Paste into YouTube Studio.</p>
                       </div>
                    </div>
                 </div>

              </div>
           ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#161616]/50 rounded-2xl border border-[#272727] border-dashed text-gray-500">
                 <div className="w-16 h-16 bg-[#1f1f1f] rounded-full flex items-center justify-center mb-4">
                    <PenTool className="text-gray-600" size={32} />
                 </div>
                 <h3 className="text-lg font-medium text-white">Start Creating</h3>
                 <p className="mt-2 max-w-sm">Fill in your content details on the left to generate titles, descriptions, and tags instantly.</p>
              </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default ContentCreator;