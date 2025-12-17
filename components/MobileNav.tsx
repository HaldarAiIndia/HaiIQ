import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Search, Hash, Youtube, PenTool, Archive, Menu, X } from 'lucide-react';

const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/create', label: 'Create', icon: PenTool },
    { path: '/saved', label: 'Saved Projects', icon: Archive },
    { path: '/trends', label: 'Real-time Trends', icon: TrendingUp },
    { path: '/analyzer', label: 'SEO Analyzer', icon: Search },
    { path: '/generator', label: 'Tag & Title Gen', icon: Hash },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-[#272727] z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white">
             <Youtube size={20} fill="white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">HaiIQ</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Full Screen Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#0f0f0f] pt-20 px-6 flex flex-col h-screen animate-fade-in">
           <nav className="flex-1 space-y-2 overflow-y-auto pb-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                    isActive
                      ? 'bg-red-600/10 text-red-500 font-medium'
                      : 'text-gray-400 hover:bg-[#1f1f1f] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={22} className={isActive ? 'text-red-500' : 'text-gray-400'} />
                    <span className="text-lg">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
           </nav>

           <div className="py-8 border-t border-[#272727] mt-auto">
              <div className="bg-[#1f1f1f] rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2">Powered by</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-white">Gemini 2.5 Flash</span>
                </div>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;