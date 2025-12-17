import React, { useState } from 'react';
import { generateTagsAndTitles } from '../services/geminiService';
import { SavedProject } from '../types';
import { Hash, Copy, Loader2, Sparkles, Save, Check } from 'lucide-react';
import { useGlobalState } from '../context/GlobalContext';

const TagGenerator: React.FC = () => {
  const { tagGenResult, setTagGenResult, tagGenTopic, setTagGenTopic, addSavedProject } = useGlobalState();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagGenTopic) return;
    setLoading(true);
    setSaved(false);
    try {
      const result = await generateTagsAndTitles(tagGenTopic);
      setTagGenResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!tagGenResult) return;
    
    // Safer ID generation
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);

    const newProject: SavedProject = {
      titles: tagGenResult.titles,
      tags: tagGenResult.tags.map(t => t.tag),
      // Fill missing fields with empty values to match SavedProject type
      seoDescription: "Generated via Tag Generator",
      keywords: tagGenResult.tags.map(t => t.tag), // Use tags as keywords
      id,
      timestamp: Date.now(),
      idea: tagGenTopic,
      contentType: 'Tags Only'
    };

    addSavedProject(newProject);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllTags = () => {
    if (tagGenResult?.tags) {
      const allTags = tagGenResult.tags.map(t => t.tag).join(', ');
      copyToClipboard(allTags);
    }
  };

  const VolumeBadge = ({ volume }: { volume: string }) => {
    if (volume === 'High') {
      return (
        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <div className="flex items-end gap-0.5 h-3">
            <div className="w-0.5 h-1.5 bg-emerald-500/40 rounded-full"></div>
            <div className="w-0.5 h-2.5 bg-emerald-500/70 rounded-full"></div>
            <div className="w-0.5 h-3.5 bg-emerald-500 rounded-full"></div>
          </div>
          High
        </span>
      );
    }
    if (volume === 'Medium') {
      return (
        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          <div className="flex items-end gap-0.5 h-3">
            <div className="w-0.5 h-1.5 bg-yellow-500/40 rounded-full"></div>
            <div className="w-0.5 h-2.5 bg-yellow-500 rounded-full"></div>
            <div className="w-0.5 h-3.5 bg-yellow-500/30 rounded-full"></div>
          </div>
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
         <div className="flex items-end gap-0.5 h-3">
            <div className="w-0.5 h-1.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-2.5 bg-gray-500/30 rounded-full"></div>
            <div className="w-0.5 h-3.5 bg-gray-500/30 rounded-full"></div>
          </div>
        Low
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tag & Title Generator</h1>
        <p className="text-gray-400">Enter a topic to generate high-ranking tags and viral-worthy titles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Card */}
        <div className="lg:col-span-1">
          <div className="bg-[#161616] p-6 rounded-2xl border border-[#272727] sticky top-6">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Video Topic / Niche</label>
                <div className="relative">
                   <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                   <input
                    type="text"
                    value={tagGenTopic}
                    onChange={(e) => setTagGenTopic(e.target.value)}
                    placeholder="e.g. Minecraft Survival Guide"
                    className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !tagGenTopic}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                Generate Ideas
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-[#272727]">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Pro Tips</h4>
              <ul className="text-xs text-gray-500 space-y-2">
                <li>• Be specific with your topic (e.g. "Vegan Meal Prep" vs "Food")</li>
                <li>• Mix high volume and low volume tags for best results.</li>
                <li>• Use titles that evoke curiosity or emotion.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2 space-y-6">
          {tagGenResult ? (
            <div className="animate-fade-in space-y-6">

              <div className="flex justify-end">
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
                    {saved ? 'Saved!' : 'Save as Project'}
                </button>
              </div>
              
              {/* Titles Section */}
              <div className="bg-[#161616] rounded-2xl p-6 border border-[#272727]">
                <h3 className="text-lg font-bold text-white mb-4">Suggested Titles</h3>
                <div className="space-y-3">
                  {tagGenResult?.titles?.map((title, idx) => (
                    <div key={idx} className="group flex justify-between items-center bg-[#1f1f1f] hover:bg-[#252525] p-3 rounded-lg transition-colors border border-transparent hover:border-[#333]">
                      <span className="text-gray-200 text-sm font-medium">{title}</span>
                      <button 
                        onClick={() => copyToClipboard(title)}
                        className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-2"
                        title="Copy title"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags Section */}
              <div className="bg-[#161616] rounded-2xl p-6 border border-[#272727]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">Optimized Tags</h3>
                  <button 
                    onClick={copyAllTags}
                    className="text-xs flex items-center gap-1 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-emerald-400 px-3 py-1.5 rounded-lg border border-[#333] transition-colors"
                  >
                    <Copy size={12} /> Copy All
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#272727]">
                        <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
                        <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vol</th>
                        <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#272727]">
                      {tagGenResult?.tags?.map((item, idx) => (
                        <tr key={idx} className="group">
                          <td className="py-3 pr-4">
                            <span className="text-sm text-gray-300 font-mono bg-[#1f1f1f] px-2 py-1 rounded">{item.tag}</span>
                          </td>
                          <td className="py-3">
                            <VolumeBadge volume={item.volume} />
                          </td>
                          <td className="py-3">
                            <div className="w-16 h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full" 
                                style={{ width: `${item.relevance}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-[#161616]/50 rounded-2xl border border-[#272727] border-dashed">
              <div className="w-16 h-16 bg-[#1f1f1f] rounded-full flex items-center justify-center mb-4">
                 <Sparkles className="text-gray-500" size={32} />
              </div>
              <h3 className="text-lg font-medium text-white">Ready to Generate</h3>
              <p className="text-gray-500 mt-2 max-w-sm">
                Enter a topic to get instant tag suggestions and title ideas tailored to the current algorithm.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TagGenerator;