
import React, { useState } from 'react';
import { Task, TaskType } from '../types';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick }) => {
  const [activeTab, setActiveTab] = useState<TaskType | 'ALL'>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const categories = [
    { type: TaskType.VIDEO_AD, label: 'ভিডিও অ্যাড', icon: '🎬', color: 'bg-pink-500' },
    { type: TaskType.GAME_INSTALL, label: 'গেম ইনস্টল', icon: '🕹️', color: 'bg-emerald-500' },
    { type: TaskType.OFFERWALL, label: 'অফারওয়াল', icon: '💎', color: 'bg-amber-500' },
    { type: TaskType.QUIZ, label: 'কুইজ', icon: '🧠', color: 'bg-indigo-500' },
  ];

  const groupedTasks = categories.map(cat => ({
    ...cat,
    items: tasks.filter(t => t.type === cat.type)
  })).filter(group => group.items.length > 0);

  const displayGroups = activeTab === 'ALL' ? groupedTasks : groupedTasks.filter(g => g.type === activeTab);

  const handleItemClick = (task: Task) => {
    if (processingId) return;
    setProcessingId(task.id);
    onTaskClick(task);
    setTimeout(() => setProcessingId(null), 3000);
  };

  return (
    <div className="space-y-10">
      <div className="flex space-x-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
        <button 
          onClick={() => setActiveTab('ALL')}
          className={`whitespace-nowrap px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'ALL' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-400 border border-slate-100'}`}
        >
          সব অফার
        </button>
        {categories.map(cat => (
          <button 
            key={cat.type}
            onClick={() => setActiveTab(cat.type)}
            className={`whitespace-nowrap px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${activeTab === cat.type ? `${cat.color} text-white shadow-xl shadow-indigo-100` : 'bg-white text-slate-400 border border-slate-100'}`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-12">
        {displayGroups.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100">
             <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">এই ক্যাটাগরিতে কোনো কাজ নেই</p>
          </div>
        ) : displayGroups.map(group => (
          <section key={group.type} className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
               <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${group.color} rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-50`}>{group.icon}</div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{group.label}</h3>
               </div>
               <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Active API</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {group.items.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => handleItemClick(task)}
                  className={`group relative bg-white p-5 rounded-[1.8rem] border border-slate-100 shadow-sm transition-all duration-500 cursor-pointer overflow-hidden ${processingId === task.id ? 'opacity-50 pointer-events-none scale-[0.98]' : 'hover:shadow-2xl hover:border-indigo-100'}`}
                >
                  {processingId === task.id && (
                    <div className="absolute inset-0 bg-indigo-600/5 flex items-center justify-center z-20">
                      <div className="w-full h-1 bg-indigo-100 absolute bottom-0">
                         <div className="h-full bg-indigo-600 animate-[progress_3s_ease-in-out]"></div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-4 relative z-10">
                    <div className="text-3xl bg-slate-50 group-hover:bg-slate-900 group-hover:scale-110 transition-all duration-500 w-14 h-14 flex items-center justify-center rounded-[1.2rem]">
                      <span>{task.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-900 text-base truncate group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-tighter">+{task.reward_points} pts</span>
                        <div className="flex items-center text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                          Verified
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default TaskList;
