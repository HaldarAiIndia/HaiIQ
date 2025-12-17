import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import { Loader2 } from 'lucide-react';
import { GlobalProvider } from './context/GlobalContext';

// Lazy load pages to reduce initial bundle size
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Trending = lazy(() => import('./pages/Trending'));
const SeoAnalyzer = lazy(() => import('./pages/SeoAnalyzer'));
const TagGenerator = lazy(() => import('./pages/TagGenerator'));
const ContentCreator = lazy(() => import('./pages/ContentCreator'));
const SavedProjects = lazy(() => import('./pages/SavedProjects'));

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh] h-full">
    <Loader2 className="animate-spin text-red-600" size={40} />
  </div>
);

const App: React.FC = () => {
  return (
    <GlobalProvider>
      <Router>
        <div className="min-h-screen bg-black text-white flex">
          <Sidebar />
          <MobileNav />
          {/* Adjusted padding: pt-16 for mobile header */}
          <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-6 md:pb-0 flex flex-col">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/trends" element={<Trending />} />
                <Route path="/analyzer" element={<SeoAnalyzer />} />
                <Route path="/generator" element={<TagGenerator />} />
                <Route path="/create" element={<ContentCreator />} />
                <Route path="/saved" element={<SavedProjects />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </GlobalProvider>
  );
};

export default App;