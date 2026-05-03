/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Search, 
  Bell, 
  Zap, 
  BarChart2, 
  Clock, 
  Award,
  ArrowRight,
  MessageSquare,
  Mic,
  FileText,
  HelpCircle,
  Lightbulb,
  GraduationCap,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Target,
  Library as LibraryIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppView, UserProfile } from '../types';

interface DashboardProps {
  setActiveView: (view: AppView) => void;
  profile: UserProfile;
}

const quickTools = [
  { view: 'notes' as AppView, icon: FileText, label: 'Notes Simplifier', color: 'bg-emerald-50 text-emerald-600', ring: 'ring-emerald-500/10', desc: 'Neural summarization' },
  { view: 'assignment' as AppView, icon: HelpCircle, label: 'Assignment GPT', color: 'bg-blue-50 text-blue-600', ring: 'ring-blue-500/10', desc: 'Step-by-step logic' },
  { view: 'explainer' as AppView, icon: Lightbulb, label: 'Concept DeepDive', color: 'bg-amber-50 text-amber-600', ring: 'ring-amber-500/10', desc: 'Infinite analogies' },
  { view: 'exam' as AppView, icon: GraduationCap, label: 'Exam Simulator', color: 'bg-purple-50 text-purple-600', ring: 'ring-purple-500/10', desc: 'AI Quiz generator' },
];

const stats = [
  { icon: Target, label: 'Level Progress', value: '78%', color: 'text-indigo-600', trend: '+5%' },
  { icon: BrainCircuit, label: 'Concepts Mastered', value: '142', color: 'text-emerald-600', trend: '+12' },
  { icon: Clock, label: 'Focused Study', value: '24h', color: 'text-blue-600', trend: '+2h' },
];

export function Dashboard({ setActiveView, profile }: DashboardProps) {
  return (
    <div className="flex-1 h-full flex flex-col bg-slate-50/10">
      {/* Search & Breadcrumbs (Sub-header) */}
      <div className="px-6 lg:px-12 py-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
            Learning Workspace
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Optimization for {profile.name.split(' ')[0]} active
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-12 pt-0 space-y-12">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Main Hero Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-[3rem] bg-indigo-600 p-8 lg:p-16 overflow-hidden group shadow-2xl shadow-indigo-200"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
            
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <Sparkles size={16} className="text-indigo-200" />
                <span className="text-white text-[10px] font-black uppercase tracking-widest">
                  Ready for Session #{Math.floor(Math.random() * 50) + 1}
                </span>
              </div>
              <h3 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-[1.05] mb-6">
                Welcome back, 👋<br/>
                <span className="opacity-80 font-medium">Ready to excel?</span>
              </h3>
              <p className="text-indigo-100 text-lg leading-relaxed mb-10 font-medium opacity-90">
                Your AI tutor is synchronized with <span className="text-white font-black">{profile.currentClass || profile.level}</span> curriculum.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button 
                  onClick={() => setActiveView('chat')}
                  className="px-10 py-5 bg-white text-indigo-700 rounded-3xl font-black shadow-2xl shadow-indigo-900/20 hover:bg-slate-50 transition-all active:scale-95 text-sm flex items-center gap-3"
                >
                  <MessageSquare size={18} fill="currentColor" />
                  Start Chat Assistant
                </button>
              </div>
            </div>
            
            {/* Visual Insight Piece */}
            <div className="absolute top-1/2 right-16 -translate-y-1/2 hidden xl:block pointer-events-none">
               <div className="p-8 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest">Study Progress</p>
                      <p className="text-white font-black text-xl">14.5 Hours</p>
                    </div>
                  </div>
                  <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                     <div className="h-full w-2/3 bg-white rounded-full"></div>
                  </div>
               </div>
            </div>
          </motion.section>

          {/* Feature Cards Grid (4 STRICT CARDS) */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-3">
                Core Intelligence Modules
              </h4>
              <div className="h-px bg-slate-100 flex-1 ml-6"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { view: 'chat', label: 'AI Assistant', icon: MessageSquare, desc: 'Context-aware learning bot', color: 'bg-indigo-600', shadow: 'shadow-indigo-100' },
                { view: 'notes', label: 'Notes Simplifier', icon: FileText, desc: 'Summarize complex materials', color: 'bg-emerald-500', shadow: 'shadow-emerald-100' },
                { view: 'assignment', label: 'Assignment Helper', icon: HelpCircle, desc: 'Step-by-step logic solver', color: 'bg-blue-500', shadow: 'shadow-blue-100' },
                { view: 'exam', label: 'Exam Mode', icon: GraduationCap, desc: 'AI-driven assessment engine', color: 'bg-purple-500', shadow: 'shadow-purple-100' },
                { view: 'library', label: 'My Library', icon: LibraryIcon, desc: 'Your offline study shelf', color: 'bg-amber-500', shadow: 'shadow-amber-100' },
              ].map((tool, idx) => (
                <motion.button
                  key={tool.view}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setActiveView(tool.view as AppView)}
                  className="group relative bg-white p-8 rounded-[3rem] text-left border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all overflow-hidden flex flex-col h-full"
                >
                  <div className={`w-16 h-16 ${tool.color} rounded-3xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-xl ${tool.shadow}`}>
                    <tool.icon size={28} />
                  </div>
                  <h5 className="font-black text-slate-900 text-xl tracking-tight mb-2 leading-none">{tool.label}</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">{tool.desc}</p>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Launch Module</span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Activity & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Recent Activity List */}
            <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
               <h4 className="text-sm font-black text-slate-800 tracking-tight mb-8">Recent Learning Traces</h4>
               <div className="space-y-6">
                  {[
                    { title: 'Organic Chemistry Explanation', time: '14m ago', status: 'Completed', color: 'text-emerald-500' },
                    { title: 'Physics Numerical Solve', time: '2h ago', status: 'In Library', color: 'text-indigo-500' },
                    { title: 'Syllabus Scan: Math v4', time: 'Yesterday', status: 'Archived', color: 'text-slate-400' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-2xl transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="w-1.5 h-8 bg-slate-100 rounded-full group-hover:bg-indigo-600 transition-colors"></div>
                          <div>
                            <p className="text-sm font-black text-slate-800 tracking-tight">{item.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.time}</p>
                          </div>
                       </div>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                    </div>
                  ))}
               </div>
            </section>

            {/* Simple Insights / Stats */}
            <section className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
               <div className="absolute bottom-0 right-0 p-8 opacity-5">
                  <BarChart2 size={180} />
               </div>
               <h4 className="text-sm font-black tracking-tight mb-8 relative z-10">Neural Performance</h4>
               <div className="grid grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-2">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Mastery Level</p>
                    <p className="text-3xl font-black text-white">82.4%</p>
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                       <TrendingUp size={14} /> +4.2% this week
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Retention Rate</p>
                    <p className="text-3xl font-black text-white">96%</p>
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                       <Award size={14} /> Elite Student Rank
                    </div>
                  </div>
               </div>
               
               <div className="mt-10 pt-10 border-t border-white/5 relative z-10">
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    <span>Curriculum Coverage</span>
                    <span>72 / 100 Modules</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '72%' }}
                        className="h-full bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                     />
                  </div>
               </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}


// Sub-component for simple image profile display
function User({ profile, size = 16 }: { profile: UserProfile, size?: number }) {
  const avatarUrl = profile.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`;
  return (
    <img src={avatarUrl} alt="User" className="rounded-[1rem] bg-indigo-50 object-cover" style={{ width: size, height: size }} />
  );
}
