import React, { useState, useEffect, useRef } from 'react';
import { fetchTrendingVideos } from '../services/geminiService';
import { TimeFrame } from '../types';
import { Clock, RefreshCw, Play, Zap, AlertCircle, Eye, Youtube, TrendingUp } from 'lucide-react';
import { useGlobalState } from '../context/GlobalContext';

const TrendSkeleton = () => (
  <div className="bg-[#161616] rounded-2xl border border-[#272727] overflow-hidden flex flex-col h-full animate-pulse">
    <div className="h-32 bg-[#1f1f1f] border-b border-[#272727]" />
    <div className="p-5 flex-1 flex flex-col space-y-4">
      <div className="h-6 bg-[#1f1f1f] rounded w-3/4" />
      <div className="flex items-center gap-3">
        <div className="h-4 bg-[#1f1f1f] rounded w-1/3" />
        <div className="h-4 bg-[#1f1f1f] rounded w-1/4" />
      </div>
      <div className="bg-[#1f1f1f] rounded-xl p-3 flex-1 space-y-2">
         <div className="h-3 bg-[#2a2a2a] rounded w-full" />
         <div className="h-3 bg-[#2a2a2a] rounded w-full" />
         <div className="h-3 bg-[#2a2a2a] rounded w-2/3" />
      </div>
      <div className="h-10 bg-[#1f1f1f] rounded-lg w-full mt-auto" />
    </div>
  </div>
);

const Trending: React.FC = () => {
  const { trendingData, setTrendingData, trendingTimeFrame, setTrendingTimeFrame } = useGlobalState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentFilter, setContentFilter] = useState<'All' | 'Video' | 'Short'>('All');
  
  // Track previous timeframe to detect changes without re-fetching on initial mount if data exists
  const prevTimeFrameRef = useRef(trendingTimeFrame);

  const loadTrends = async (force = false) => {
    // If we have data and not forcing (and timeframe hasn't changed), don't fetch
    if (!force && trendingData) return;

    setLoading(true);
    setError(null);
    try {
      const result = await fetchTrendingVideos(trendingTimeFrame);
      setTrendingData(result);
    } catch (err) {
      setError("Failed to fetch trends. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If timeframe changed, or if we have no data, fetch.
    if (!trendingData || prevTimeFrameRef.current !== trendingTimeFrame) {
        loadTrends(true);
    }
    prevTimeFrameRef.current = trendingTimeFrame;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendingTimeFrame]);

  const handleTimeFrameChange = (newFrame: TimeFrame) => {
    if (newFrame !== trendingTimeFrame) {
        setTrendingTimeFrame(newFrame);
        localStorage.setItem('haiiq_trendingTimeFrame', newFrame);
    }
  };

  const handleRefresh = () => {
      loadTrends(true);
  };

  const timeOptions = [
    { label: 'Past 4h', value: TimeFrame.HOURS_4 },
    { label: 'Past 24h', value: TimeFrame.HOURS_24 },
    { label: 'Past 7d', value: TimeFrame.DAYS_7 },
    { label: 'Past 1m', value: TimeFrame.MONTH_1 },
    { label: 'Past 1y', value: TimeFrame.YEAR_1 },
  ];

  const filteredTrends = trendingData?.trends.filter(item => {
    if (contentFilter === 'All') return true;
    return item.type === contentFilter;
  }) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="bg-red-600 w-2 h-8 rounded-full"></span>
            Trending Now
          </h1>
          <p className="text-gray-400 mt-1">Detailed analysis of viral content from the {timeOptions.find(t => t.value === trendingTimeFrame)?.label}.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
           {/* Content Type Filter */}
           <div className="flex items-center bg-[#1f1f1f] p-1 rounded-xl border border-[#333]">
              {(['All', 'Video', 'Short'] as const).map((type) => (
                 <button
                    key={type}
                    onClick={() => setContentFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                       contentFilter === type
                          ? 'bg-[#333] text-white shadow-sm'
                          : 'text-gray-400 hover:text-white'
                    }`}
                 >
                    {type === 'Video' && <Play size={12} />}
                    {type === 'Short' && <Zap size={12} />}
                    {type === 'All' ? 'All' : type + 's'}
                 </button>
              ))}
           </div>

           {/* Timeframe Filter */}
           <div className="flex items-center bg-[#1f1f1f] p-1 rounded-xl border border-[#333] overflow-x-auto max-w-full">
             {timeOptions.map((option) => (
               <button
                 key={option.value}
                 onClick={() => handleTimeFrameChange(option.value)}
                 className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                   trendingTimeFrame === option.value
                     ? 'bg-[#333] text-white shadow-sm'
                     : 'text-gray-400 hover:text-white'
                 }`}
               >
                 {option.label}
               </button>
             ))}
           </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <TrendSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-900/50 p-6 rounded-2xl flex items-center gap-4 text-red-200">
          <AlertCircle size={24} />
          <span>{error}</span>
          <button onClick={handleRefresh} className="ml-auto flex items-center gap-2 px-4 py-2 bg-red-800/30 hover:bg-red-800/50 rounded-lg text-sm transition-colors">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start">
            {filteredTrends.map((item, index) => (
              <div key={index} className="bg-[#161616] rounded-2xl border border-[#272727] overflow-hidden hover:border-[#333] transition-all group flex flex-col h-full animate-fade-in">
                {/* Header / "Thumbnail" area */}
                <div className="h-32 bg-[#1f1f1f] relative flex items-center justify-center border-b border-[#272727]">
                  {item.type === 'Short' ? (
                     <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Zap size={10} /> SHORT
                     </div>
                  ) : (
                     <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Play size={10} /> VIDEO
                     </div>
                  )}
                  
                  {/* Rank Badge */}
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white font-bold">
                     #{item.rank}
                  </div>

                  <Youtube size={48} className="text-[#333] group-hover:text-red-500/20 transition-colors" />
                </div>

                <div className="p-5 flex-1 flex flex-col">
                   <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
                      {item.title}
                   </h3>
                   <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      <span className="text-gray-300 font-medium">{item.channel}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Eye size={12}/> {item.views}</span>
                   </div>

                   <div className="bg-[#1f1f1f] rounded-xl p-3 mb-4 flex-1">
                      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-purple-400">
                         <TrendingUp size={12} />
                         WHY IT'S VIRAL
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">
                         {item.whyTrending}
                      </p>
                   </div>

                   {item.url && (
                      <a 
                         href={item.url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white text-sm font-medium rounded-lg transition-colors mt-auto"
                      >
                         <Play size={14} fill="currentColor" />
                         Watch on YouTube
                      </a>
                   )}
                </div>
              </div>
            ))}

            {(!trendingData?.trends || trendingData.trends.length === 0) && (
               <div className="col-span-full py-12 text-center text-gray-500 bg-[#161616] rounded-2xl border border-[#272727] border-dashed">
                  No trends found. Try refreshing or selecting a different timeframe.
               </div>
            )}
            
            {(trendingData?.trends.length !== 0 && filteredTrends.length === 0) && (
               <div className="col-span-full py-12 text-center text-gray-500 bg-[#161616] rounded-2xl border border-[#272727] border-dashed">
                  No {contentFilter}s found in the current selection.
               </div>
            )}
          </div>
      )}
      
      <div className="mt-8 flex justify-center">
         <button onClick={handleRefresh} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm">
            <Clock size={14} />
            Data updated just now
         </button>
      </div>
    </div>
  );
};

export default Trending;