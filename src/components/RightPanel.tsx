/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, Target, Zap, Award, ChevronRight, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export function RightPanel() {
  const [time, setTime] = useState(1500); // 25 minutes
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTime(1500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <aside className="w-80 h-full bg-white border-l border-slate-100 hidden xl:flex flex-col overflow-y-auto p-8 space-y-10">
      {/* Study Timer - Premium Style */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Deep Focus</h4>
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-widest">Pomodoro</span>
        </div>
        
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-center shadow-2xl shadow-indigo-200 border border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_70%)]"></div>
          
          <div className="relative z-10 text-4xl font-black text-white tracking-widest mb-8 tabular-nums">
            {formatTime(time)}
          </div>
          
          <div className="flex items-center justify-center gap-3 relative z-10">
            <button 
              onClick={toggleTimer}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl ${
                isActive 
                  ? 'bg-amber-500 text-white shadow-amber-500/20' 
                  : 'bg-indigo-600 text-white shadow-indigo-600/20'
              }`}
            >
              {isActive ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
            </button>
            <button 
              onClick={resetTimer}
              className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center transition-all border border-white/5"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 opacity-40">
             {[...Array(4)].map((_, i) => (
               <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === 0 ? 'w-6 bg-indigo-400' : 'w-1.5 bg-white'}`}></div>
             ))}
          </div>
        </div>
      </section>

      {/* Daily Goal Progress */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Daily Goal</h4>
          <span className="text-xs font-black text-slate-900 tracking-tight">75%</span>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-6">
          <div className="space-y-3">
             <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-tight">
               <span className="flex items-center gap-2"><Target size={14} className="text-indigo-500" /> Study Hours</span>
               <span>3.5 / 5h</span>
             </div>
             <div className="h-2 bg-slate-200 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '70%' }}
                  className="h-full bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                />
             </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-tight">
               <span className="flex items-center gap-2"><Award size={14} className="text-emerald-500" /> Quizzes</span>
               <span>8 / 10</span>
             </div>
             <div className="h-2 bg-slate-200 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '80%' }}
                  className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                />
             </div>
          </div>
        </div>
      </section>

      {/* Study Streak */}
      <section>
        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Learning Path</h4>
        <div className="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-200">
          <div className="absolute -right-8 -top-8 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
             <TrendingUp size={140} />
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center mb-4 backdrop-blur-md border border-white/10 shadow-xl group-hover:rotate-12 transition-transform">
               <Zap size={32} />
            </div>
            <h5 className="text-2xl font-black tracking-tighter mb-1">12 Day Streak</h5>
            <p className="text-xs font-bold text-indigo-100 opacity-80 mb-6">High efficiency mode active</p>
            
            <button className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group-hover:shadow-xl">
               Claim Reward <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </aside>
  );
}
