import React, { useState } from 'react';
import { analyzeCompetitor } from '../services/geminiService';
import { CompetitorItem } from '../types';
import { Swords, Search, Users, Play, Calendar, Zap, AlertTriangle, CheckCircle, Loader2, ExternalLink, Link as LinkIcon, Filter, Trash2, ChevronDown, ChevronUp, Flame, Copy } from 'lucide-react';
import { useGlobalState } from '../context/GlobalContext';

type SortOption = 'date' | 'subs_desc' | 'subs_asc' | 'trending_score';

const CompetitorAnalysis: React.FC = () => {
  const { competitors, setCompetitors } = useGlobalState();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Initialize sort order from localStorage
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const saved = localStorage.getItem('haiiq_competitorSort');
    return (saved as SortOption) || 'date';
  });

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    setLoading(true);
    try {
      const data = await analyzeCompetitor(input);
      const newItem: CompetitorItem = {
        ...data,
        id: Date.now(),
        timestamp: Date.now()
      };
      
      setCompetitors(prev => [newItem, ...prev]);
      // Automatically expand the new item
      setExpandedIds(prev => new Set(prev).add(newItem.id));
      setInput('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeCompetitor = (id: number) => {
    setCompetitors(prev => prev.filter(c => c.id !== id));
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    localStorage.setItem('haiiq_competitorSort', newSort);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const parseSubCount = (str?: string): number => {
    if (!str) return 0;
    const clean = str.toUpperCase().replace(/[^0-9.KMB]/g, '');
    let multiplier = 1;
    if (clean.includes('K')) multiplier = 1000;
    if (clean.includes('M')) multiplier = 1000000;
    if (clean.includes('B')) multiplier = 1000000000;
    
    const num = parseFloat(clean.replace(/[KMB]/g, ''));
    return isNaN(num) ? 0 : num * multiplier;
  };

  const getSortedCompetitors = () => {
    const items = [...competitors];
    if (sortBy === 'subs_desc') {
      return items.sort((a, b) => parseSubCount(b.subscriberCount) - parseSubCount(a.subscriberCount));
    }
    if (sortBy === 'subs_asc') {
      return items.sort((a, b) => parseSubCount(a.subscriberCount) - parseSubCount(b.subscriberCount));
    }
    if (sortBy === 'trending_score') {
      return items.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
    }
    // Default: 'date' (Newest first)
    return items.sort((a, b) => b.timestamp - a.timestamp);
  };

  const sortedCompetitors = getSortedCompetitors();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-orange-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-gray-400';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
           <Swords className="text-red-500" />
           Competitor Intelligence
        </h1>
        <p className="text-gray-400">Spy on competitor strategies. Compare multiple channels side-by-side.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Section */}
        <div className="lg:col-span-1">
           <div className="bg-[#161616] p-6 rounded-2xl border border-[#272727] sticky top-6">
              <form onSubmit={handleAnalyze} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Add Competitor</label>
                    <div className="relative">
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 flex items-center gap-1 border-r border-[#333] pr-2">
                          <Search size={16} />
                          <span className="text-xs text-gray-600">or</span>
                          <LinkIcon size={14} />
                       </div>
                       <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Name (e.g. MrBeast) or URL"
                          className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg pl-24 pr-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                       />
                    </div>
                 </div>
                 <button
                    type="submit"
                    disabled={loading || !input}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all flex justify-center items-center gap-2"
                 >
                    {loading ? <Loader2 className="animate-spin" /> : "Analyze & Add"}
                 </button>
              </form>
              <div className="mt-6 pt-6 border-t border-[#272727]">
                 <p className="text-xs text-gray-500">
                    Enter multiple channels to compare their strategies, subscriber counts, and top videos in the list view.
                 </p>
              </div>
           </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Toolbar */}
           {competitors.length > 0 && (
             <div className="flex flex-col sm:flex-row justify-between items-center bg-[#161616] p-4 rounded-xl border border-[#272727] gap-4">
                <h2 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                   <Users size={16} />
                   Analyzing {competitors.length} Channel{competitors.length !== 1 && 's'}
                </h2>
                
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1f1f1f] rounded-lg border border-[#333]">
                      <Filter size={14} className="text-gray-400"/>
                      <span className="text-xs text-gray-500 mr-1">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value as SortOption)}
                        className="bg-transparent text-sm text-white outline-none cursor-pointer"
                      >
                        <option value="date">Most Recent</option>
                        <option value="subs_desc">Subscribers (High to Low)</option>
                        <option value="subs_asc">Subscribers (Low to High)</option>
                        <option value="trending_score">Trending Score (High to Low)</option>
                      </select>
                   </div>
                   
                   {competitors.length > 0 && (
                      <button 
                         onClick={() => { setCompetitors([]); setExpandedIds(new Set()); }}
                         className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                         Clear All
                      </button>
                   )}
                </div>
             </div>
           )}

           {loading && (
              <div className="flex flex-col items-center justify-center py-12 bg-[#161616] rounded-2xl border border-[#272727]">
                 <Loader2 className="animate-spin text-red-500 mb-4" size={32} />
                 <p className="text-gray-400 animate-pulse">Gathering intelligence from YouTube...</p>
              </div>
           )}

           {!loading && competitors.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-center bg-[#161616]/50 rounded-2xl border border-[#272727] border-dashed">
                 <div className="w-16 h-16 bg-[#1f1f1f] rounded-full flex items-center justify-center mb-4">
                    <Swords className="text-gray-500" size={32} />
                 </div>
                 <h3 className="text-lg font-medium text-white">No Competitors Added</h3>
                 <p className="text-gray-500 mt-2">Add a channel to the list to start comparing.</p>
              </div>
           )}

           <div className="space-y-4">
              {sortedCompetitors.map((item) => (
                 <div key={item.id} className="bg-[#161616] rounded-2xl border border-[#272727] overflow-hidden animate-fade-in transition-all">
                    
                    {/* Card Header (Always Visible) */}
                    <div 
                       className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#1f1f1f] transition-colors"
                       onClick={() => toggleExpand(item.id)}
                    >
                       <div className="flex items-start md:items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                             {item.competitorName.charAt(0)}
                          </div>
                          <div>
                             <h3 className="text-lg font-bold text-white leading-tight">{item.competitorName}</h3>
                             <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                <span className="flex items-center gap-1 font-medium text-gray-300">
                                   <Users size={12}/> {item.subscriberCount || 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                   <Calendar size={12}/> {item.uploadSchedule}
                                </span>
                                {item.trendingScore !== undefined && (
                                   <div className={`flex items-center gap-1 px-2 py-0.5 rounded border border-white/10 ${getScoreColor(item.trendingScore)} ml-2 bg-black/20`}>
                                      <Flame size={12} className={getScoreColor(item.trendingScore)} fill="currentColor" fillOpacity={0.2} />
                                      <span className="font-bold">{item.trendingScore}/100</span>
                                   </div>
                                )}
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-3 self-end md:self-auto">
                          {item.channelUrl && (
                             <a 
                                href={item.channelUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                title="Open Channel"
                             >
                                <ExternalLink size={18} /> 
                             </a>
                          )}
                          <button 
                             onClick={(e) => { e.stopPropagation(); removeCompetitor(item.id); }}
                             className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                             title="Remove"
                          >
                             <Trash2 size={18} />
                          </button>
                          <div className={`transform transition-transform duration-200 ${expandedIds.has(item.id) ? 'rotate-180' : ''}`}>
                             <ChevronDown size={20} className="text-gray-500" />
                          </div>
                       </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedIds.has(item.id) && (
                       <div className="border-t border-[#272727] bg-[#1a1a1a]/50 p-6 space-y-6">
                          
                          {/* Strategy Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="bg-[#1f1f1f] p-5 rounded-xl border border-[#333]">
                                <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-amber-400">
                                   <Zap size={16} /> Thumbnail Strategy
                                </h4>
                                <p className="text-gray-300 text-xs leading-relaxed">{item.thumbnailStrategy}</p>
                             </div>
                             
                             <div className="bg-[#1f1f1f] p-5 rounded-xl border border-[#333]">
                                <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-blue-400">
                                   <Play size={16} /> Content Structure
                                </h4>
                                <p className="text-gray-300 text-xs leading-relaxed">{item.contentStructure}</p>
                             </div>
                          </div>

                          {/* Top Videos */}
                          <div>
                             <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center justify-between">
                                Top Performing Videos
                                {item.trendingVideoCount !== undefined && (
                                   <span className="text-xs font-normal text-orange-400 flex items-center gap-1">
                                      <Flame size={12} /> {item.trendingVideoCount} Viral Videos
                                   </span>
                                )}
                             </h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {item.topVideos.map((video, idx) => (
                                   <div key={idx} className="bg-[#1f1f1f] p-3 rounded-lg flex items-start gap-3 border border-[#333] hover:border-[#444] transition-colors">
                                      <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                                         {idx + 1}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                         <h5 className="text-gray-200 text-sm font-medium truncate">{video.title}</h5>
                                         <div className="flex gap-2 mt-1 text-[10px] text-gray-500">
                                            <span>{video.views} views</span>
                                            <span>•</span>
                                            <span>{video.uploadDate}</span>
                                         </div>
                                      </div>
                                      {video.url && (
                                         <a href={video.url} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-white">
                                            <Play size={14} />
                                         </a>
                                      )}
                                   </div>
                                ))}
                             </div>
                          </div>

                          {/* Keywords */}
                          <div>
                             <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-bold text-gray-300">Common Keywords</h4>
                                <button 
                                    onClick={() => copyToClipboard(item.commonKeywords.join(', '))}
                                    className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"
                                >
                                    <Copy size={12} /> Copy
                                </button>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {item.commonKeywords.map((kw, i) => (
                                   <span key={i} className="px-2.5 py-1 bg-[#252525] text-gray-400 rounded-md text-xs border border-[#333]">
                                      #{kw}
                                   </span>
                                ))}
                             </div>
                          </div>

                          {/* SWOT */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                 <h4 className="text-green-500 text-xs font-bold mb-2 flex items-center gap-2 uppercase tracking-wider">
                                    <CheckCircle size={14} /> Strengths
                                 </h4>
                                 <ul className="space-y-1.5">
                                    {item.strengths.map((s, i) => (
                                       <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                                          <span className="w-1 h-1 rounded-full bg-green-500/50 mt-1.5 flex-shrink-0"></span>
                                          {s}
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                              <div>
                                 <h4 className="text-red-400 text-xs font-bold mb-2 flex items-center gap-2 uppercase tracking-wider">
                                    <AlertTriangle size={14} /> Weaknesses
                                 </h4>
                                 <ul className="space-y-1.5">
                                    {item.weaknesses.map((w, i) => (
                                       <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                                          <span className="w-1 h-1 rounded-full bg-red-400/50 mt-1.5 flex-shrink-0"></span>
                                          {w}
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                          </div>

                       </div>
                    )}
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysis;