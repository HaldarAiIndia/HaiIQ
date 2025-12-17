import React, { useState } from 'react';
import { analyzeSeo, generateVideoDescription } from '../services/geminiService';
import { Search, AlertTriangle, CheckCircle, BarChart2, ChevronRight, Loader2, Sparkles, Copy } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useGlobalState } from '../context/GlobalContext';

const SeoAnalyzer: React.FC = () => {
  const { seoResult, setSeoResult, seoInputs, setSeoInputs } = useGlobalState();
  const [loading, setLoading] = useState(false);
  
  // Description generation state
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [descLength, setDescLength] = useState<'Short' | 'Medium' | 'Long'>('Medium');

  const handleInputChange = (field: keyof typeof seoInputs, value: string) => {
      setSeoInputs({ ...seoInputs, [field]: value });
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seoInputs.title) return;
    
    setLoading(true);
    try {
      const data = await analyzeSeo(seoInputs.title, seoInputs.description, seoInputs.tags);
      setSeoResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!seoInputs.title) return;
    setIsGeneratingDesc(true);
    try {
      const generated = await generateVideoDescription(seoInputs.title, seoInputs.tags, descLength);
      handleInputChange('description', generated);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // emerald-500
    if (score >= 50) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-screen content-start">
      
      {/* Input Section */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">SEO Analyzer</h1>
          <p className="text-gray-400">Paste your video metadata below to get an AI-powered audit.</p>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4 bg-[#161616] p-6 rounded-2xl border border-[#272727]">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Video Title</label>
            <input
              type="text"
              value={seoInputs.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., How to Make Viral Shorts in 2024"
              className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
            />
            <p className="text-right text-xs text-gray-500 mt-1">{seoInputs.title.length}/100</p>
          </div>

          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-medium text-gray-300">Description</label>
              <div className="flex items-center gap-2">
                <select
                  value={descLength}
                  onChange={(e) => setDescLength(e.target.value as 'Short' | 'Medium' | 'Long')}
                  className="bg-[#1f1f1f] text-xs text-gray-300 border border-[#333] rounded px-2 py-1 outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="Short">Short</option>
                  <option value="Medium">Medium</option>
                  <option value="Long">Long</option>
                </select>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={!seoInputs.title || isGeneratingDesc}
                  className="text-xs flex items-center gap-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-1.5 rounded border border-blue-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingDesc ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Auto-Generate
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(seoInputs.description)}
                  disabled={!seoInputs.description}
                  className="text-xs flex items-center gap-1 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-400 hover:text-white px-3 py-1.5 rounded border border-[#333] transition-colors"
                  title="Copy to Clipboard"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
            <textarea
              value={seoInputs.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Paste your description here or auto-generate one..."
              rows={6}
              className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tags (Comma separated)</label>
            <input
              type="text"
              value={seoInputs.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="seo, youtube growth, viral..."
              className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !seoInputs.title}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
            Analyze Metadata
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {seoResult ? (
          <div className="animate-fade-in space-y-6">
            
            {/* Score Card */}
            <div className="bg-[#161616] rounded-2xl p-6 border border-[#272727]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-gray-400 font-medium mb-1">Overall SEO Score</h3>
                  <div className="text-4xl font-bold text-white">{seoResult.score}/100</div>
                </div>
                <div className="h-24 w-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ value: seoResult.score }, { value: 100 - seoResult.score }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={40}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill={scoreColor(seoResult.score)} />
                        <Cell fill="#272727" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Breakdown with Radar Chart */}
              <div className="pt-6 border-t border-[#272727]">
                <div className="h-64 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                      { subject: 'Title', A: seoResult.titleScore, fullMark: 100 },
                      { subject: 'Description', A: seoResult.descriptionScore, fullMark: 100 },
                      { subject: 'Tags', A: seoResult.tagsScore, fullMark: 100 },
                    ]}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="SEO Score"
                        dataKey="A"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 gap-3">
                   <div className="bg-[#1f1f1f] p-3 rounded-lg border border-[#333] flex items-start gap-3">
                      <div className="w-1 h-full min-h-[40px] bg-emerald-500 rounded-full"></div>
                      <div>
                         <div className="flex justify-between items-center w-full mb-1">
                            <span className="text-sm font-bold text-white">Title Analysis</span>
                            <span className="text-xs font-mono" style={{ color: scoreColor(seoResult.titleScore) }}>{seoResult.titleScore}/100</span>
                         </div>
                         <p className="text-xs text-gray-400 leading-relaxed">{seoResult.titleFeedback}</p>
                      </div>
                   </div>
                   
                   <div className="bg-[#1f1f1f] p-3 rounded-lg border border-[#333] flex items-start gap-3">
                      <div className="w-1 h-full min-h-[40px] bg-blue-500 rounded-full"></div>
                      <div>
                         <div className="flex justify-between items-center w-full mb-1">
                            <span className="text-sm font-bold text-white">Description Analysis</span>
                            <span className="text-xs font-mono" style={{ color: scoreColor(seoResult.descriptionScore) }}>{seoResult.descriptionScore}/100</span>
                         </div>
                         <p className="text-xs text-gray-400 leading-relaxed">{seoResult.descriptionFeedback}</p>
                      </div>
                   </div>

                   <div className="bg-[#1f1f1f] p-3 rounded-lg border border-[#333] flex items-start gap-3">
                      <div className="w-1 h-full min-h-[40px] bg-purple-500 rounded-full"></div>
                      <div>
                         <div className="flex justify-between items-center w-full mb-1">
                            <span className="text-sm font-bold text-white">Tag Analysis</span>
                            <span className="text-xs font-mono" style={{ color: scoreColor(seoResult.tagsScore) }}>{seoResult.tagsScore}/100</span>
                         </div>
                         <p className="text-xs text-gray-400 leading-relaxed">{seoResult.tagsFeedback}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-[#161616] rounded-2xl p-6 border border-[#272727]">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart2 size={20} className="text-blue-500" />
                Actionable Insights
              </h3>
              <div className="space-y-4">
                {seoResult.suggestions?.map((sug, i) => (
                   <div key={i} className="flex gap-3 items-start bg-[#1f1f1f] p-3 rounded-lg">
                      <ChevronRight size={16} className="text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{sug}</span>
                   </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-[#161616] rounded-2xl p-6 border border-[#272727]">
                  <h4 className="text-green-500 font-medium mb-3 flex items-center gap-2">
                     <CheckCircle size={16} /> Strengths
                  </h4>
                  <ul className="space-y-2">
                     {seoResult.strengths?.map((str, i) => (
                        <li key={i} className="text-sm text-gray-400 list-disc list-inside">{str}</li>
                     ))}
                  </ul>
               </div>
               <div className="bg-[#161616] rounded-2xl p-6 border border-[#272727]">
                  <h4 className="text-amber-500 font-medium mb-3 flex items-center gap-2">
                     <AlertTriangle size={16} /> Weaknesses
                  </h4>
                  <ul className="space-y-2">
                     {seoResult.weaknesses?.map((wk, i) => (
                        <li key={i} className="text-sm text-gray-400 list-disc list-inside">{wk}</li>
                     ))}
                  </ul>
               </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#161616]/50 rounded-2xl border border-[#272727] border-dashed">
            <div className="w-16 h-16 bg-[#1f1f1f] rounded-full flex items-center justify-center mb-4">
               <BarChart2 className="text-gray-500" size={32} />
            </div>
            <h3 className="text-lg font-medium text-white">No Analysis Yet</h3>
            <p className="text-gray-500 mt-2 max-w-xs">Enter your video details on the left to generate a comprehensive report.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeoAnalyzer;