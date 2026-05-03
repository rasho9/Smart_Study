/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { RightPanel } from './components/RightPanel';
import { Dashboard } from './components/Dashboard';
import { ChatAssistant } from './components/ChatAssistant';
import { 
  NotesSimplifier, 
  AssignmentHelper, 
  ConceptExplainer, 
  ExamMode, 
  StudyPlanner,
  MyLibrary
} from './components/FeatureViews';
import { AcademicProfile } from './components/AcademicProfile';
import { AppView, StudentLevel, UserProfile } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, GraduationCap, School, Building2, User, Sparkles, Check, Award, LogIn, LogOut, Camera, Linkedin, Mail } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('home');
  const [isAuthReady, setIsAuthReady] = useState(true);
  const [user, setUser] = useState<{ displayName: string } | null>(() => {
    const saved = localStorage.getItem('mock-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user-profile');
    return saved ? JSON.parse(saved) : { 
      name: 'Student', 
      level: 'college', 
      interests: [], 
      currentClass: '', 
      semester: '', 
      previousResults: '' 
    };
  });

  React.useEffect(() => {
    localStorage.setItem('user-profile', JSON.stringify(profile));
  }, [profile]);

  const handleLogin = async () => {
    try {
      const mockUser = { displayName: 'Student' };
      localStorage.setItem('mock-user', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('mock-user');
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 256;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setProfile((prev) => ({ ...prev, photoUrl: dataUrl }));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <Sparkles className="text-indigo-600 animate-pulse mb-4" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Initializing Neural Bridge...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] -ml-64 -mb-64"></div>
        
        <div className="relative z-10 text-center max-w-md px-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mx-auto mb-8 transform rotate-3">
            <GraduationCap className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Smart Student Assistant</h1>
          <p className="text-indigo-200/60 font-medium mb-12">Connect your academic journey with AI-powered insights and tracking.</p>
          
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-4 py-4 bg-white text-slate-900 rounded-2xl font-black shadow-xl hover:bg-slate-50 transition-all active:scale-95"
          >
            <LogIn size={20} />
            SIGN IN WITH GOOGLE
          </button>
          
          <p className="mt-8 text-[10px] font-black text-indigo-400/40 uppercase tracking-[0.2em]">Secure Academic Ecosystem</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <Dashboard setActiveView={setActiveView} profile={profile} />;
      case 'chat':
        return <ChatAssistant profile={profile} />;
      case 'notes':
        return <NotesSimplifier profile={profile} />;
      case 'assignment':
        return <AssignmentHelper profile={profile} />;
      case 'explainer':
        return <ConceptExplainer profile={profile} />;
      case 'exam':
        return <ExamMode profile={profile} />;
      case 'planner':
        return <StudyPlanner />;
      case 'library':
        return <MyLibrary />;
      case 'academic-profile':
        return <AcademicProfile profile={profile} />;
      case 'settings':
        return (
          <div className="flex-1 h-full overflow-y-auto p-4 lg:p-12 bg-slate-50/10">
            <header className="mb-12 max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Academic Profile</h2>
                  <p className="text-slate-500 text-sm font-medium">Configure your personal AI study ecosystem</p>
                </div>
              </div>
            </header>

            <div className="max-w-4xl mx-auto space-y-8">
              <section className="bg-white border border-slate-200 rounded-[3rem] p-8 lg:p-12 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                
                <div className="relative space-y-10">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8 mb-8 pb-8 border-b border-slate-100">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-300 overflow-hidden shadow-lg shadow-indigo-100 transition-all group-hover:shadow-indigo-200">
                        {profile.photoUrl ? (
                          <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User size={48} className="opacity-50" />
                        )}
                      </div>
                      <label className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all border border-slate-100">
                        <Camera size={20} />
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                    </div>
                    <div className="text-center sm:text-left pt-2">
                      <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                        Profile Picture
                      </h3>
                      <p className="text-slate-500 text-sm mt-1 max-w-sm">
                        Upload a photo to personalize your AI study environment. Make it yours.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1 flex items-center gap-2">
                        <User size={12} className="text-indigo-400" /> Full Name
                      </label>
                      <input 
                        type="text" 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        placeholder="e.g., Ali Hassan"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1 flex items-center gap-2">
                        <School size={12} className="text-indigo-400" /> Current Class / Grade
                      </label>
                      <input 
                        type="text" 
                        value={profile.currentClass}
                        onChange={(e) => setProfile({...profile, currentClass: e.target.value})}
                        placeholder="e.g., 2nd Year, 10th Grade"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1 flex items-center gap-2">
                        <Building2 size={12} className="text-indigo-400" /> University Semester (Opt)
                      </label>
                      <input 
                        type="text" 
                        value={profile.semester || ''}
                        onChange={(e) => setProfile({...profile, semester: e.target.value})}
                        placeholder="e.g., 4th Semester"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1 flex items-center gap-2">
                        <Award size={12} className="text-indigo-400" /> Previous Results / GPA
                      </label>
                      <input 
                        type="text" 
                        value={profile.previousResults || ''}
                        onChange={(e) => setProfile({...profile, previousResults: e.target.value})}
                        placeholder="e.g., 3.8 GPA, 90% in FBise"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                        <GraduationCap className="text-indigo-600" size={20} />
                        Select Academic Track
                      </h4>
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">Crucial for AI depth</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {[
                        { id: 'school', label: 'School', icon: School, desc: 'Foundation (K-10)' },
                        { id: 'college', label: 'College', icon: Building2, desc: 'Intermediate (11-12)' },
                        { id: 'university', label: 'University', icon: GraduationCap, desc: 'Higher Education' },
                      ].map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setProfile({...profile, level: level.id as StudentLevel})}
                          className={`p-8 rounded-[2.5rem] border-2 text-left transition-all relative group ${
                            profile.level === level.id 
                              ? 'border-indigo-600 bg-white shadow-2xl shadow-indigo-100 ring-8 ring-indigo-500/5' 
                              : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                          }`}
                        >
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 ${
                            profile.level === level.id 
                              ? 'bg-indigo-600 text-white shadow-xl rotate-3 scale-110' 
                              : 'bg-white text-slate-400 group-hover:bg-slate-100 group-hover:scale-105'
                          }`}>
                            <level.icon size={28} />
                          </div>
                          <h4 className={`font-black mb-1.5 text-base tracking-tight ${profile.level === level.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                            {level.label}
                          </h4>
                          <p className={`text-xs font-medium leading-relaxed ${profile.level === level.id ? 'text-indigo-600/70' : 'text-slate-400'}`}>
                            {level.desc}
                          </p>
                          {profile.level === level.id && (
                            <div className="absolute top-6 right-6 w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100">
                              <Check size={18} className="text-indigo-600" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[3rem] flex flex-col md:flex-row gap-6 items-center shadow-2xl shadow-indigo-200 border border-slate-800 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none"></div>
                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-indigo-400 border border-white/10 group-hover:scale-110 transition-transform duration-700">
                  <Sparkles size={40} className="animate-pulse" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-lg font-black text-white tracking-tight mb-1 flex items-center justify-center md:justify-start gap-2">
                    AI Personalization Engine <Award size={20} className="text-indigo-400" />
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                    Our neural models are now fine-tuning their responses for <span className="text-white font-bold">{profile.name}</span>. 
                    Expect highly relevant content for <span className="text-white font-bold">{profile.currentClass || profile.level}</span> level studies.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="bg-indigo-500/20 px-4 py-2 rounded-2xl border border-indigo-500/30">
                    <span className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Synced & Secure</span>
                  </div>
                </div>
              </div>
              <section className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-10 mt-8">
                <h3 className="text-xl font-black text-rose-800 mb-4 tracking-tight">Session Termination</h3>
                <p className="text-rose-600/70 text-sm font-medium mb-8">Exit the secure academic environment. Your data is safely stored in the cloud.</p>
                <button 
                  onClick={handleLogout}
                  className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all flex items-center gap-3 shadow-xl shadow-rose-200"
                >
                  <LogOut size={20} />
                  SIGN OUT OF SYSTEM
                </button>
              </section>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/10">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-6 border border-slate-200">
               <span className="text-xl font-black">?</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2 leading-tight">Module Under Development</h2>
            <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
              We are perfecting this feature for you. It will be ready in the next update.
            </p>
            <button 
              onClick={() => setActiveView('home')}
              className="mt-8 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        );
      default:
        return <Dashboard setActiveView={setActiveView} profile={profile} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-600">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar profile={profile} setProfile={setProfile} setActiveView={setActiveView} activeView={activeView} />
        
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="h-full w-full"
                >
                  {renderView()}
                </motion.div>
              </AnimatePresence>
            </div>
            
            <footer className="w-full bg-white border-t border-slate-200 py-8 px-6 mt-auto shrink-0 shadow-sm relative z-10">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <Sparkles size={16} className="text-indigo-600" />
                    <span className="font-black text-slate-800 tracking-tight">SMART<span className="text-indigo-600">STUDY</span></span>
                  </div>
                  <p className="text-sm font-medium text-slate-500">
                    &copy; {new Date().getFullYear()} Rashid Hussain. All rights reserved.
                  </p>
                </div>
                
                <div className="flex items-center gap-6 bg-slate-50 py-3 px-6 rounded-2xl border border-slate-100 shadow-inner">
                  <a href="https://www.linkedin.com/in/rashid-hussain-973587316" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-600 hover:scale-110 transition-all flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm" title="LinkedIn Profile">
                    <Linkedin size={20} />
                  </a>
                  <a href="mailto:rashidhussainrasho@gmail.com" className="text-slate-500 hover:text-indigo-600 hover:scale-110 transition-all flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm" title="Email Me">
                    <Mail size={20} />
                  </a>
                </div>
              </div>
            </footer>
          </main>
          
          {/* Right Panel - Hidden on small screens or specific views if needed, but per request it's part of the dashboard UI */}
          {activeView === 'home' && <RightPanel />}
        </div>
      </div>
    </div>
  );
}


