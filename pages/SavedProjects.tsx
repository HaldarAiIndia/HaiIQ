import React, { useState } from 'react';
import { Archive, Trash2, Calendar, ChevronDown, Copy, ExternalLink, Zap, Video, FileText, Radio, Clock, Download } from 'lucide-react';
import { useGlobalState } from '../context/GlobalContext';

const SavedProjects: React.FC = () => {
  const { savedProjects, deleteSavedProject } = useGlobalState();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      deleteSavedProject(id);
      if (expandedId === id) setExpandedId(null);
    }
  };

  const handleDownload = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedProjects, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "haiiq_projects.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Shorts': return <Zap size={14} className="text-yellow-400" />;
      case 'Post': return <FileText size={14} className="text-green-400" />;
      case 'Live': return <Radio size={14} className="text-red-400" />;
      default: return <Video size={14} className="text-blue-400" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Archive className="text-purple-500" />
            Saved Projects
            </h1>
            <p className="text-gray-400">Manage your previously generated content strategies.</p>
        </div>
        {savedProjects.length > 0 && (
            <button onClick={handleDownload} className="text-xs flex items-center gap-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300 border border-[#333] px-3 py-2 rounded-lg transition-colors">
                <Download size={14} /> Backup JSON
            </button>
        )}
      </div>

      {savedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#161616] rounded-2xl border border-[#272727] border-dashed text-gray-500">
           <Archive size={48} className="mb-4 opacity-50" />
           <p className="text-lg font-medium">No saved projects yet</p>
           <p className="text-sm">Go to Content Creator to generate and save your ideas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedProjects.map((project) => (
            <div key={project.id} className="bg-[#161616] rounded-2xl border border-[#272727] overflow-hidden transition-all">
              
              {/* Card Header */}
              <div 
                onClick={() => toggleExpand(project.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#1f1f1f] transition-colors"
              >
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#252525] flex items-center justify-center border border-[#333]">
                       {getTypeIcon(project.contentType)}
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-white leading-tight mb-1">{project.idea}</h3>
                       <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1 text-gray-400">
                             <Clock size={12} /> {formatDate(project.timestamp)}
                          </span>
                          <span className="px-2 py-0.5 bg-[#252525] rounded border border-[#333] text-gray-400">
                             {project.contentType}
                          </span>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button 
                       onClick={(e) => handleDelete(project.id, e)}
                       className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                       title="Delete"
                    >
                       <Trash2 size={18} />
                    </button>
                    <div className={`p-2 transition-transform duration-200 text-gray-500 ${expandedId === project.id ? 'rotate-180' : ''}`}>
                       <ChevronDown size={20} />
                    </div>
                 </div>
              </div>

              {/* Expanded Content */}
              {expandedId === project.id && (
                <div className="border-t border-[#272727] bg-[#1a1a1a]/50 p-6 space-y-6 animate-fade-in">
                   
                   {/* Titles */}
                   <div>
                      <h4 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Generated Titles</h4>
                      <div className="space-y-2">
                         {project.titles?.map((title, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded bg-[#1f1f1f] border border-[#333]">
                               <span className="text-gray-200 text-sm">{title}</span>
                               <button onClick={() => copyToClipboard(title)} className="text-gray-500 hover:text-white">
                                  <Copy size={14} />
                               </button>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Description */}
                   <div>
                      <div className="flex justify-between items-center mb-3">
                         <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Description</h4>
                         <button onClick={() => copyToClipboard(project.seoDescription)} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white">
                            <Copy size={12} /> Copy
                         </button>
                      </div>
                      <div className="bg-[#1f1f1f] p-4 rounded-lg border border-[#333] max-h-60 overflow-y-auto">
                         <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{project.seoDescription}</pre>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Keywords */}
                      <div>
                         <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Keywords</h4>
                            <button onClick={() => copyToClipboard(project.keywords?.join(', ') || '')} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white">
                               <Copy size={12} /> Copy
                            </button>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {project.keywords?.map((kw, i) => (
                               <span key={i} className="px-2 py-1 bg-[#252525] text-purple-200 text-xs rounded border border-[#333]">
                                  {kw}
                               </span>
                            ))}
                         </div>
                      </div>

                      {/* Tags */}
                      <div>
                         <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Tags</h4>
                            <button onClick={() => copyToClipboard(project.tags?.join(', ') || '')} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white">
                               <Copy size={12} /> Copy All
                            </button>
                         </div>
                         <p className="text-sm text-gray-400 bg-[#1f1f1f] p-3 rounded border border-[#333]">
                            {project.tags?.join(', ')}
                         </p>
                      </div>
                   </div>

                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedProjects;