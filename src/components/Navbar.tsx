/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Bell, ChevronDown, ChevronLeft, Sparkles, GraduationCap, School, Building2 } from 'lucide-react';
import { UserProfile, StudentLevel } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  setActiveView: (view: any) => void;
  activeView: string;
}

export function Navbar({ profile, setProfile, setActiveView, activeView }: NavbarProps) {
  const [isLevelOpen, setIsLevelOpen] = React.useState(false);

  const levels = [
    { id: 'school', label: 'School Level', detail: 'Grade 1–10', icon: School },
    { id: 'college', label: 'College Level', detail: '11–12 + DAE', icon: Building2 },
    { id: 'university', label: 'University Level', detail: 'Semester-wise', icon: GraduationCap },
  ];

  const currentLevel = levels.find(l => l.id === profile.level) || levels[0];

  return (
    <nav className="h-20 bg-white border-b border-slate-100 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Logo + Name */}
      <div className="flex items-center gap-3 lg:w-72 pl-14 lg:pl-0">
        {activeView !== 'home' ? (
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <ChevronLeft size={20} />
            <span className="font-bold text-sm hidden sm:block">Back</span>
          </button>
        ) : (
          <>
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Sparkles size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-xl tracking-tighter text-slate-900 leading-none">
                SMART<span className="text-indigo-600">STUDY</span>
              </h1>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Student Assistant</p>
            </div>
          </>
        )}
      </div>

      {/* Center: Search Bar + Level Selector */}
      <div className="flex-1 max-w-2xl mx-8 hidden md:flex items-center gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search topics, notes, or assistant..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-medium"
          />
        </div>

        {/* Level Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsLevelOpen(!isLevelOpen)}
            className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <currentLevel.icon size={16} />
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Track</p>
              <p className="text-xs font-black text-slate-800 leading-none">{currentLevel.label}</p>
            </div>
            <ChevronDown size={16} className={`text-slate-300 transition-transform ${isLevelOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isLevelOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 5, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 w-64 bg-white border border-slate-100 rounded-3xl mt-2 shadow-2xl p-2 z-50 overflow-hidden"
              >
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => {
                      setProfile({ ...profile, level: level.id as StudentLevel });
                      setIsLevelOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      profile.level === level.id 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile.level === level.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <level.icon size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black">{level.label}</p>
                      <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{level.detail}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-2 lg:gap-4 lg:w-72 justify-end">
        <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all relative group">
          <Bell size={22} />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white ring-2 ring-indigo-500/10 group-hover:scale-125 transition-transform"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-100 mx-2 hidden sm:block"></div>

        <button 
          onClick={() => setActiveView('settings')}
          className="flex items-center gap-3 p-1.5 hover:bg-slate-50 rounded-2xl transition-all group"
        >
          <div className="relative">
            {profile.photoUrl ? (
              <img 
                src={profile.photoUrl} 
                alt="User" 
                className="w-10 h-10 rounded-2xl bg-indigo-100 shadow-sm transition-transform group-hover:scale-105 object-cover"
              />
            ) : (
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} 
                alt="User" 
                className="w-10 h-10 rounded-2xl bg-indigo-100 shadow-sm transition-transform group-hover:scale-105"
              />
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="text-left hidden lg:block mr-2">
            <p className="text-xs font-black text-slate-800 leading-none mb-1">{profile.name.split(' ')[0]}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Online</p>
          </div>
        </button>
      </div>
    </nav>
  );
}
