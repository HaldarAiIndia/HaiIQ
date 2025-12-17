import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Search, Hash, ArrowRight, Activity, Zap, BarChart3 } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back, Creator</h1>
        <p className="text-gray-400">Optimize your content and stay ahead of the curve with AI-driven insights.</p>
      </header>

      {/* Hero Stats / Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-600/20 to-red-900/10 border border-red-500/20 p-6 rounded-2xl hover:border-red-500/40 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <TrendingUp className="text-red-500" size={24} />
            </div>
            <span className="bg-red-500/10 text-red-400 text-xs font-medium px-2 py-1 rounded-full">Hot</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Trend Scout</h3>
          <p className="text-sm text-gray-400 mb-4">Discover what's viral in the last 4h or 24h across YouTube.</p>
          <Link to="/trends" className="inline-flex items-center text-sm font-medium text-red-400 hover:text-red-300">
            View Trends <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-2xl hover:border-[#444] transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Search className="text-blue-500" size={24} />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">SEO Analysis</h3>
          <p className="text-sm text-gray-400 mb-4">Get a detailed score and actionable fixes for your video metadata.</p>
          <Link to="/analyzer" className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300">
            Analyze Video <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-2xl hover:border-[#444] transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <Hash className="text-emerald-500" size={24} />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Keyword Gen</h3>
          <p className="text-sm text-gray-400 mb-4">Generate high-volume tags and click-worthy titles instantly.</p>
          <Link to="/generator" className="inline-flex items-center text-sm font-medium text-emerald-400 hover:text-emerald-300">
            Generate Tags <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-[#161616] rounded-2xl p-6 border border-[#272727]">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity size={20} className="text-purple-400" />
            Why use real-time trends?
          </h3>
          <ul className="space-y-3">
             <li className="flex items-start gap-3 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
                <span>Hop on viral waves before they crash. Identify rising topics in the last 4 hours.</span>
             </li>
             <li className="flex items-start gap-3 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
                <span>Understand what thumbnail styles are working right now.</span>
             </li>
             <li className="flex items-start gap-3 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
                <span>Find content gaps in your niche by observing competitor wins.</span>
             </li>
          </ul>
        </div>

        <div className="bg-[#161616] rounded-2xl p-6 border border-[#272727]">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap size={20} className="text-yellow-400" />
            AI-Powered Optimization
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Our models analyze thousands of data points to predict what titles get clicked.
            Stop guessing and start using data-backed metadata.
          </p>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#333]">
             <div className="text-center">
                <span className="block text-2xl font-bold text-white">93%</span>
                <span className="text-xs text-gray-500">Accuracy</span>
             </div>
             <div className="w-px h-8 bg-[#333]"></div>
             <div className="text-center">
                <span className="block text-2xl font-bold text-white">2.5s</span>
                <span className="text-xs text-gray-500">Speed</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;