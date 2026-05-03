/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Home, 
  MessageSquare, 
  FileText, 
  HelpCircle, 
  Lightbulb, 
  GraduationCap, 
  Calendar, 
  Settings, 
  History,
  Menu,
  X,
  Library as LibraryIcon,
  Zap,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../types';

interface SidebarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

const navItems: { view: AppView; label: string; icon: any; category: string }[] = [
  { view: 'home', label: 'Home', icon: Home, category: 'Main' },
  { view: 'academic-profile', label: 'Academic Profile', icon: GraduationCap, category: 'Main' },
  { view: 'chat', label: 'Chat Assistant', icon: MessageSquare, category: 'Assist' },
  { view: 'notes', label: 'Notes Simplifier', icon: FileText, category: 'Tools' },
  { view: 'assignment', label: 'Assignment Helper', icon: HelpCircle, category: 'Tools' },
  { view: 'explainer', label: 'Concept Explainer', icon: Lightbulb, category: 'Tools' },
  { view: 'exam', label: 'Exam Mode', icon: GraduationCap, category: 'Tools' },
  { view: 'planner', label: 'Study Planner', icon: Calendar, category: 'Organize' },
  { view: 'library', label: 'My Library', icon: LibraryIcon, category: 'Organize' },
  { view: 'settings', label: 'Settings', icon: Settings, category: 'System' },
];

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  
  const categories = Array.from(new Set(navItems.map(i => i.category)));

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-5 left-6 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 text-white"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={window.innerWidth < 1024 ? { x: -300 } : false}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 w-[270px] bg-white border-r border-slate-100 text-slate-800 z-40 transition-all duration-300 shadow-2xl lg:shadow-none lg:relative lg:translate-x-0"
          >
            <div className="flex flex-col h-full py-8 px-6">
              {/* Branding (Mini) */}
              <div className="flex items-center gap-3 mb-12 px-2 hidden lg:flex">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                  <Zap size={20} strokeWidth={2.5} />
                </div>
                <div>
                   <h1 className="font-black text-lg tracking-tighter text-slate-900 leading-none">STUDYPRO</h1>
                   <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">v3.0 Intelligence</p>
                </div>
              </div>

              {/* Navigation Grid */}
              <nav className="flex-1 space-y-10">
                {categories.map(cat => (
                  <div key={cat} className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-4">{cat}</h4>
                    <div className="space-y-1">
                      {navItems.filter(i => i.category === cat).map((item) => (
                        <button
                          key={item.view}
                          onClick={() => {
                            setActiveView(item.view);
                            if (window.innerWidth < 1024) setIsOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group ${
                            activeView === item.view 
                              ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 ring-4 ring-indigo-500/5' 
                              : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                          }`}
                        >
                          <item.icon size={20} strokeWidth={activeView === item.view ? 2.5 : 2} className={activeView === item.view ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                          <span className={`text-sm font-bold tracking-tight ${activeView === item.view ? 'text-white' : 'text-slate-600'}`}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Support Hint */}
              <div className="mt-8 p-6 bg-slate-900 rounded-3xl relative overflow-hidden group border border-slate-800">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                 <h5 className="text-white text-xs font-black tracking-tight mb-2 relative z-10">Upgrade to Pro</h5>
                 <p className="text-slate-400 text-[10px] font-medium leading-relaxed relative z-10 mb-4">Get unlimited AI tokens and advanced analytics.</p>
                 <button className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all relative z-10">
                    Go Premium
                 </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
