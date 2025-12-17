import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Search, Hash, Youtube, PenTool, Archive } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/create', label: 'Create', icon: PenTool },
    { path: '/saved', label: 'Saved Projects', icon: Archive },
    { path: '/trends', label: 'Real-time Trends', icon: TrendingUp },
    { path: '/analyzer', label: 'SEO Analyzer', icon: Search },
    { path: '/generator', label: 'Tag & Title Gen', icon: Hash },
  ];

  return (
    <aside className="w-64 bg-[#0f0f0f] border-r border-[#272727] flex flex-col h-full fixed left-0 top-0 z-10 hidden md:flex">
      <div className="p-6 flex items-center gap-3 border-b border-[#272727]">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white">
          <Youtube size={20} fill="white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">HaiIQ</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-red-600/10 text-red-500 font-medium'
                  : 'text-gray-400 hover:bg-[#1f1f1f] hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  className={isActive ? 'text-red-500' : 'text-gray-400 group-hover:text-white'}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-[#272727]">
        <div className="bg-[#1f1f1f] rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-2">Powered by</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-white">Gemini 2.5 Flash</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;