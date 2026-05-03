/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  HelpCircle, 
  Upload, 
  ChevronRight,
  Lightbulb,
  GraduationCap,
  Play,
  Calendar,
  Plus,
  Trash2,
  Clock,
  Paperclip,
  X,
  Image as ImageIcon,
  Library as LibraryIcon,
  Book as BookIcon,
  Search,
  Eye,
  EyeOff,
  Trophy,
  Award,
  BookOpen,
  Camera,
  Download,
  Archive,
  Save,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, QuizQuestion, StudyTask, LibraryItem, TheoryQuestion } from '../types';
import { simplifyNotes, solveAssignment, explainConcept, generateExam } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Shared File Upload Component ---
interface FileUploadProps {
  onFileSelect: (file: { name: string, data: string, mimeType: string }) => void;
  selectedFile: { name: string, data: string, mimeType: string } | null;
  onClear: () => void;
}

function FileUploadZone({ onFileSelect, selectedFile, onClear }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const base64 = readerEvent.target?.result as string;
        const data = base64.split(',')[1];
        onFileSelect({
          name: file.name,
          data: data,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (selectedFile) {
    return (
      <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl relative">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
          {selectedFile.mimeType.startsWith('image/') ? <ImageIcon size={20} /> : <Paperclip size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-indigo-900 truncate">{selectedFile.name}</p>
          <p className="text-[10px] text-indigo-400 capitalize">{selectedFile.mimeType.split('/')[1]} File</p>
        </div>
        <button 
          onClick={onClear}
          className="p-1.5 hover:bg-white rounded-lg text-indigo-400 hover:text-red-500 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div 
      onClick={() => fileInputRef.current?.click()}
      className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center hover:border-indigo-300 transition-colors cursor-pointer group bg-slate-50/50"
    >
      <input type="file" ref={fileInputRef} onChange={handleChange} className="hidden" accept="image/*, application/pdf, text/plain" />
      <div className="w-10 h-10 bg-white text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-105 shadow-sm border border-slate-100">
        <Upload size={18} />
      </div>
      <p className="font-bold text-slate-800 text-sm">Upload Material</p>
      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Image, PDF, or Text</p>
    </div>
  );
}

import html2canvas from 'html2canvas';

// Helper for capturing a section to library
async function captureToLibrary(elementId: string, title: string) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true
    });
    
    const dataUrl = canvas.toDataURL('image/png');
    const saved = localStorage.getItem('study-library');
    const items: LibraryItem[] = saved ? JSON.parse(saved) : [];
    
    const newItem: LibraryItem = {
      id: Date.now().toString(),
      title: `${title} (Capture)`,
      content: 'Captured snapshot of learning material.',
      type: 'note',
      addedAt: Date.now(),
      imageUrl: dataUrl
    };
    
    localStorage.setItem('study-library', JSON.stringify([newItem, ...items]));
    alert('Captured and saved to My Library! 📚');
  } catch (err) {
    console.error('Failed to capture:', err);
    alert('Failed to capture snapshot.');
  }
}
export function NotesSimplifier({ profile }: { profile: UserProfile }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);

  const handleSimplify = async () => {
    if (!input.trim() && !file) return;
    setIsLoading(true);
    try {
      const result = await simplifyNotes(input, profile, file ? { data: file.data, mimeType: file.mimeType } : undefined);
      setOutput(result || '');
    } catch (e: any) {
      console.error(e);
      setOutput(`Error: Could not connect to AI Service. Please check your network connection or try again. (${e?.message || 'Unknown error'})`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white lg:rounded-3xl lg:border lg:border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
            <FileText className="text-emerald-600" size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Notes Simplifier</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Summarize and simplify complex text</p>
          </div>
        </div>
        <div className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500 uppercase tracking-wider">
          Track: {profile.currentClass || profile.level}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <div className="space-y-4">
          <FileUploadZone onFileSelect={setFile} selectedFile={file} onClear={() => setFile(null)} />
          
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">
              Manual Text Input
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your notes here..."
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all resize-none shadow-inner text-sm"
              id="notes-input"
            />
          </div>

          <button
            onClick={handleSimplify}
            disabled={(!input.trim() && !file) || isLoading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 text-sm"
            id="simplify-btn"
          >
            {isLoading ? <RotateCcw className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Simplify Notes ✨
          </button>
        </div>

        {output && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Simplified Result
              </label>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => captureToLibrary('notes-result', 'Simplified Notes')}
                  className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  <Camera size={12} />
                  <span className="text-[9px] font-black uppercase">Snapshot</span>
                </button>
                <div className="w-px h-3 bg-slate-200"></div>
                <button 
                  onClick={() => {
                    const saved = localStorage.getItem('study-library');
                    const items = saved ? JSON.parse(saved) : [];
                    const newItem = { id: Date.now().toString(), title: 'Simplified Notes', content: output, type: 'note' as const, addedAt: Date.now() };
                    localStorage.setItem('study-library', JSON.stringify([newItem, ...items]));
                    alert('Saved as Note! 📝');
                  }}
                  className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  <Archive size={12} />
                  <span className="text-[9px] font-black uppercase">Save Note</span>
                </button>
                <div className="w-px h-3 bg-slate-200"></div>
                <button onClick={copyToClipboard} className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span className="text-[9px] font-black uppercase">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <div id="notes-result" className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm leading-relaxed text-slate-700 text-sm whitespace-pre-wrap">
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {output}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// --- Assignment Helper ---
export function AssignmentHelper({ profile }: { profile: UserProfile }) {
  const [input, setInput] = useState('');
  const [steps, setSteps] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);

  const handleSolve = async () => {
    if (!input.trim() && !file) return;
    setIsLoading(true);
    try {
      const result = await solveAssignment(input, profile, file ? { data: file.data, mimeType: file.mimeType } : undefined);
      setSteps(result || '');
    } catch (e: any) {
      console.error(e);
      setSteps(`Error: Could not connect to AI Service. Please check your network connection or try again. (${e?.message || 'Unknown error'})`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white lg:rounded-3xl lg:border lg:border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            <HelpCircle className="text-blue-600" size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Assignment Helper</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Get step-by-step logic solutions</p>
          </div>
        </div>
        <div className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500 uppercase tracking-wider">
          Track: {profile.currentClass || profile.level}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <div className="space-y-6">
          <FileUploadZone onFileSelect={setFile} selectedFile={file} onClear={() => setFile(null)} />

          <div className="space-y-3">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">
               Type your Question
             </label>
             <textarea
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Describe your question here..."
               className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none shadow-inner text-sm"
               id="assignment-input"
             />
             <button
               onClick={handleSolve}
               disabled={(!input.trim() && !file) || isLoading}
               className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 text-sm"
               id="solve-btn"
             >
               {isLoading ? <RotateCcw className="animate-spin" size={16} /> : <Sparkles size={16} />}
               Get Step-by-Step Solution
             </button>
          </div>
        </div>

        {steps && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
             <div className="flex items-center justify-between px-1">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Solution</h4>
               <div className="flex items-center gap-3">
                 <button 
                    onClick={() => captureToLibrary('assignment-result', 'Assignment Solution')}
                    className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                 >
                    <Camera size={12} />
                    <span className="text-[9px] font-black uppercase">Snapshot</span>
                 </button>
                 <div className="w-px h-3 bg-slate-200"></div>
                 <button 
                  onClick={() => {
                    const saved = localStorage.getItem('study-library');
                    const items = saved ? JSON.parse(saved) : [];
                    const newItem = { id: Date.now().toString(), title: 'Assignment Solution', content: steps, type: 'note' as const, addedAt: Date.now() };
                    localStorage.setItem('study-library', JSON.stringify([newItem, ...items]));
                    alert('Saved as Note! 📝');
                  }}
                  className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  <Archive size={12} />
                  <span className="text-[9px] font-black uppercase">Save Note</span>
                </button>
               </div>
             </div>
             <div id="assignment-result" className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm leading-relaxed text-slate-700 text-sm">
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {steps}
                  </ReactMarkdown>
                </div>
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// --- Concept Explainer ---
export function ConceptExplainer({ profile }: { profile: UserProfile }) {
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);

  const handleExplain = async () => {
    if (!concept.trim() && !file) return;
    setIsLoading(true);
    try {
      const result = await explainConcept(concept, profile, file ? { data: file.data, mimeType: file.mimeType } : undefined);
      setExplanation(result || '');
    } catch (e: any) {
      console.error(e);
      setExplanation(`Error: Could not connect to AI Service. Please check your network connection or try again. (${e?.message || 'Unknown error'})`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white lg:rounded-3xl lg:border lg:border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
            <Lightbulb className="text-purple-600" size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Concept Explainer</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Simplifying complex ideas</p>
          </div>
        </div>
        <div className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500 uppercase tracking-wider">
          Track: {profile.currentClass || profile.level}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <div className="space-y-4">
           <FileUploadZone onFileSelect={setFile} selectedFile={file} onClear={() => setFile(null)} />
           
           <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">
                I want to understand...
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="e.g., Photosynthesis, Gravity, AI..."
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-slate-700 shadow-inner text-sm"
                  id="concept-input"
                />
                <button
                  onClick={handleExplain}
                  disabled={(!concept.trim() && !file) || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50"
                  id="explain-btn"
                >
                  {isLoading ? <RotateCcw className="animate-spin" size={18} /> : <ChevronRight size={18} />}
                </button>
              </div>
           </div>
        </div>

        {explanation && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm relative group"
          >
             <button 
                onClick={() => captureToLibrary('explainer-result', `Explainer: ${concept}`)}
                className="absolute top-6 right-6 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Capture to Library"
             >
                <Camera size={18} />
             </button>
             <div id="explainer-result">
               <h4 className="text-sm font-black text-indigo-900 mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-600" />
                  {concept || "Attached Material"}
               </h4>
               <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm">
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {explanation}
                    </ReactMarkdown>
                  </div>
               </div>
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// --- Exam Mode ---
export function ExamMode({ profile }: { profile: UserProfile }) {
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [theoryQuestions, setTheoryQuestions] = useState<TheoryQuestion[]>([]);
  
  const [counts, setCounts] = useState({ mcqs: 5, short: 3, long: 2 });
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showTheoryAnswers, setShowTheoryAnswers] = useState<Record<number, boolean>>({});
  
  const TIMER_PER_QUESTION = 60;

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (questions.length > 0 && !showResult && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timeLeft === 0 && !showResult && questions.length > 0) {
      setShowResult(true);
    }
    return () => clearInterval(interval);
  }, [questions, showResult, timeLeft]);

  const startExam = async () => {
    if (!topic.trim() && !file) return;
    setIsLoading(true);
    setQuestions([]);
    setTheoryQuestions([]);
    setCurrentIdx(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setShowTheoryAnswers({});
    try {
      const result = await generateExam(
        topic || "Exam from uploaded material", 
        profile, 
        counts, 
        file ? { data: file.data, mimeType: file.mimeType } : undefined
      );
      setQuestions(result.mcqs || []);
      setTheoryQuestions(result.theory || []);
      setTimeLeft((result.mcqs?.length || 0) * TIMER_PER_QUESTION);
    } catch (e: any) {
      console.error(e);
      alert(`Failed to generate exam: ${e?.message || 'Check your internet connection'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (idx === questions[currentIdx].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const toggleTheoryAnswer = (idx: number) => {
    setShowTheoryAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="flex flex-col h-full bg-white lg:rounded-3xl lg:border lg:border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            <GraduationCap className="text-blue-600" size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Professional Exam Generator</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Custom MCQs, Short & Long Questions</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500 uppercase tracking-wider">
            Track: {profile.currentClass || profile.level}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {(!questions.length && !theoryQuestions.length) || showResult ? (
          <div className="h-full flex flex-col items-center max-w-lg mx-auto py-6 space-y-6">
            {showResult ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full space-y-6">
                <div className="text-center">
                  <div className="text-5xl mb-4">🏆</div>
                  <h4 className="text-xl font-black text-slate-900 leading-tight">Exam Component Results</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    {timeLeft === 0 && <span className="text-red-500 font-bold block mb-1">Time's Up!</span>}
                    Objective Score: <span className="font-black text-indigo-600 underline decoration-indigo-200 decoration-4">{score}/{questions.length}</span>
                  </p>
                </div>

                <div className="space-y-4">
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Theory Section Self-Review</h5>
                   {theoryQuestions.map((q, i) => (
                     <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                       <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{q.type} Question</span>
                         <button 
                          onClick={() => toggleTheoryAnswer(i)}
                          className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 hover:underline"
                        >
                          {showTheoryAnswers[i] ? <EyeOff size={14} /> : <Eye size={14} />}
                          {showTheoryAnswers[i] ? 'Hide Solution' : 'Reveal Solution'}
                        </button>
                       </div>
                       <p className="text-sm font-bold text-slate-800 leading-relaxed">{q.question}</p>
                       <AnimatePresence>
                         {showTheoryAnswers[i] && (
                           <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pt-2 border-t border-slate-200 overflow-hidden"
                           >
                             <div className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                               <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.suggestedAnswer}</ReactMarkdown>
                             </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                     </div>
                   ))}
                </div>

                <button 
                  onClick={() => { setQuestions([]); setTheoryQuestions([]); setTopic(''); setFile(null); }}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 text-sm transition-transform hover:scale-[1.02]"
                >
                  Start New Professional Exam
                </button>
              </motion.div>
            ) : (
              <div className="space-y-6 w-full">
                <FileUploadZone onFileSelect={setFile} selectedFile={file} onClear={() => setFile(null)} />
                
                <div className="space-y-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Specific Topic (Optional)</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., General Physics, Chapter 4..."
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-sm shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 px-1">MCQs</label>
                      <input 
                        type="number" 
                        value={counts.mcqs} 
                        onChange={(e) => setCounts({...counts, mcqs: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 px-1">Short</label>
                      <input 
                        type="number" 
                        value={counts.short} 
                        onChange={(e) => setCounts({...counts, short: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 px-1">Long</label>
                      <input 
                        type="number" 
                        value={counts.long} 
                        onChange={(e) => setCounts({...counts, long: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                      />
                    </div>
                  </div>

                  <button
                    onClick={startExam}
                    disabled={(!topic.trim() && !file) || isLoading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg text-sm group"
                  >
                    {isLoading ? <RotateCcw className="animate-spin" size={16} /> : <Sparkles size={16} className="group-hover:animate-pulse" />}
                    Compose Exam Material
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 max-w-lg mx-auto"
          >
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 bg-indigo-600 h-full"></div>
               <h4 className="text-lg font-bold text-slate-800 leading-relaxed">
                 {questions[currentIdx].question}
               </h4>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {questions[currentIdx].options.map((opt, i) => (
                <button
                  key={i}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleAnswer(i)}
                  className={`p-5 rounded-2xl border-2 transition-all text-left text-sm font-bold shadow-sm ${
                    selectedAnswer === i
                      ? i === questions[currentIdx].correctAnswer 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                        : 'bg-rose-50 border-rose-500 text-rose-700'
                      : selectedAnswer !== null && i === questions[currentIdx].correctAnswer
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] text-slate-400 group-hover:text-indigo-600">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </div>
                </button>
              ))}
            </div>
            {selectedAnswer !== null && (
               <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
               >
                  <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Lightbulb size={14} /> Solution Explanation
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed italic">{questions[currentIdx].explanation}</p>
                  </div>
                  <button 
                    onClick={nextQuestion}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-transform hover:scale-[1.01]"
                  >
                    Proceed to Next Question
                    <ChevronRight size={18} />
                  </button>
               </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// --- My Library ---
export function MyLibrary() {
  const [items, setItems] = useState<LibraryItem[]>(() => {
    const saved = localStorage.getItem('study-library');
    return saved ? JSON.parse(saved) : [];
  });
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<{ title: string; content: string; type: 'note' | 'book' }>({ 
    title: '', 
    content: '', 
    type: 'note' 
  });

  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const bookUploadRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    localStorage.setItem('study-library', JSON.stringify(items));
  }, [items]);

  // Handle blob URL cleanup
  React.useEffect(() => {
    if (selectedItem?.fileUrl) {
      const dataURLtoBlob = (dataurl: string) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      };

      try {
        const blob = dataURLtoBlob(selectedItem.fileUrl);
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch (e) {
        console.error("Failed to create blob URL:", e);
        setBlobUrl(selectedItem.fileUrl); // Fallback
      }
    } else {
      setBlobUrl(null);
    }
  }, [selectedItem]);

  const handleBookUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024 * 1024) {
        alert("File too large. Please upload files smaller than 200MB for browser storage.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const dataUrl = event.target?.result as string;
          
          const newItem: LibraryItem = {
            id: Date.now().toString(),
            title: file.name,
            content: `Digital resource: ${file.name}. This file is saved in your offline library.`,
            type: 'book',
            addedAt: Date.now(),
            fileUrl: dataUrl,
            fileType: file.type,
            imageUrl: file.type.startsWith('image/') ? dataUrl : undefined,
          };
          
          if (file.type === 'text/plain') {
            const textReader = new FileReader();
            textReader.onload = (trEvent) => {
              newItem.content = trEvent.target?.result as string;
              setItems(prev => [newItem, ...prev]);
            }
            textReader.readAsText(file);
          } else {
            setItems(prev => [newItem, ...prev]);
          }
        } catch (err) {
          alert("Storage error: Browser storage is full or file is incompatible.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    if (!newItem.title.trim()) return;
    const item: LibraryItem = {
      id: Date.now().toString(),
      title: newItem.title,
      content: newItem.content,
      type: newItem.type,
      addedAt: Date.now()
    };
    setItems(prev => [item, ...prev]);
    setIsAdding(false);
    setNewItem({ title: '', content: '', type: 'note' });
  };

  const deleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Attempt delete
    setItems(prev => prev.filter(item => item.id !== id));
    
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const filteredItems = items.filter(i => 
    i.title.toLowerCase().includes(search.toLowerCase()) || 
    i.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white lg:rounded-2xl lg:border lg:border-slate-200 overflow-hidden shadow-sm">
      <div className="p-8 border-b border-slate-100/60 bg-white space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50/50 rounded-2xl flex items-center justify-center">
              <LibraryIcon className="text-indigo-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">My Library</h3>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Offline accessible study resources</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={bookUploadRef} 
              onChange={(e) => {
                handleBookUpload(e);
                e.target.value = '';
              }} 
              className="hidden" 
              accept=".pdf,.txt,image/*" 
            />
            <button 
              onClick={() => bookUploadRef.current?.click()}
              className="flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all active:scale-95"
            >
              <Upload size={16} /> Upload Book
            </button>
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all active:scale-95 shadow-sm"
            >
              <Plus size={16} /> New Note
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search library..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50/50">
        <AnimatePresence mode="popLayout">
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-6 bg-slate-50 rounded-3xl border border-indigo-100 space-y-4 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Resource Title</label>
                  <input 
                    type="text" 
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    placeholder="E.g. Bio Chapter 1 Notes"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                  <select 
                    value={newItem.type}
                    onChange={(e) => setNewItem({...newItem, type: e.target.value as 'note' | 'book'})}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm appearance-none cursor-pointer"
                  >
                    <option value="note">Lecture Note</option>
                    <option value="book">Reference Book</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Content (Supports Markdown)</label>
                <textarea 
                  value={newItem.content}
                  onChange={(e) => setNewItem({...newItem, content: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm resize-none"
                  placeholder="Paste text or notes..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                <button onClick={addItem} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md">Add to Library</button>
              </div>
            </motion.div>
          )}

          {!filteredItems.length ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                <BookOpen size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Your Shelf is Empty</p>
                <p className="text-xs text-slate-400 max-w-[200px] mx-auto mt-1">Add your digital books and notes for offline reading.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map(item => (
                <motion.div 
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedItem(item)}
                  className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all group cursor-pointer relative"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.type === 'book' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        {item.type === 'book' ? <BookIcon size={20} /> : <FileText size={20} />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm leading-tight">{item.title}</h4>
                        <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{item.type}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => deleteItem(e, item.id)}
                      className="absolute top-5 right-5 text-slate-300 hover:text-rose-500 transition-colors p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 z-20 hover:scale-110 active:scale-95"
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[5rem] overflow-hidden relative">
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{item.content}</p>
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-50 to-transparent"></div>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">{new Date(item.addedAt).toLocaleDateString()}</span>
                    <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      View Resource <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Modern Reader Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedItem.type === 'book' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                    {selectedItem.type === 'book' ? <BookIcon size={24} /> : <FileText size={24} />}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg tracking-tight">{selectedItem.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Added on {new Date(selectedItem.addedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => deleteItem(null, selectedItem.id)}
                    className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete Resource"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-slate-50">
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                  {selectedItem.fileUrl ? (
                    <div className="flex-1 min-h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col">
                      {selectedItem.fileType?.includes('pdf') ? (
                        <div className="flex-1 flex flex-col h-full">
                          <div className="bg-slate-100 p-3 flex justify-between items-center border-b border-slate-200">
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">PDF Viewer</span>
                             <button 
                               onClick={() => {
                                 const url = blobUrl || selectedItem.fileUrl;
                                 if (url) window.open(url, '_blank');
                               }}
                               className="text-[10px] font-bold text-white px-4 py-1.5 bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2"
                             >
                               <ExternalLink size={12} /> View Fullscreen
                             </button>
                          </div>
                          <div className="flex-1 bg-slate-200 relative min-h-[600px]">
                            <iframe 
                              src={blobUrl || selectedItem.fileUrl}
                              className="w-full h-full border-none absolute inset-0"
                              title={selectedItem.title}
                              onLoad={() => console.log("Reader loaded")}
                            />
                            {/* Overlay fallback if iframe is blocked or slow */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center pointer-events-none opacity-0 hover:opacity-100 bg-white/10 backdrop-blur-[1px] transition-opacity">
                               <p className="text-xs text-slate-500 bg-white/80 p-2 rounded-lg shadow-sm">If content doesn't appear, use 'View Fullscreen'</p>
                            </div>
                          </div>
                        </div>
                      ) : selectedItem.fileType?.startsWith('image/') ? (
                        <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                          <img src={blobUrl || selectedItem.fileUrl} alt={selectedItem.title} className="max-w-full shadow-lg rounded-lg" />
                        </div>
                      ) : (
                        <div className="p-8 prose prose-slate max-w-none prose-p:text-slate-600">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {selectedItem.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-12 bg-white p-12 rounded-3xl shadow-xl border border-slate-100">
                      {selectedItem.imageUrl && (
                        <div className="rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl mb-8">
                           <img src={selectedItem.imageUrl} alt="Captured" className="w-full" />
                        </div>
                      )}
                      
                      <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-slate-600 prose-p:leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {selectedItem.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-center gap-6">
                {selectedItem.fileUrl ? (
                  <a 
                    href={blobUrl || selectedItem.fileUrl} 
                    download={selectedItem.title}
                    className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                  >
                    <Download size={14} /> Download Original File
                  </a>
                ) : (
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                  >
                    <Download size={14} /> Save as PDF / Print
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Study Planner ---
export function StudyPlanner() {
  const [tasks, setTasks] = useState<StudyTask[]>([
    { id: '1', title: 'Welcome to your Planner! 👋', duration: 45, completed: false },
    { id: '2', title: 'Solved Physics Problem', duration: 15, completed: true },
    { id: '3', title: 'Simplified 3 paragraphs', duration: 60, completed: false },
    { id: '4', title: 'Created Exam (History)', duration: 45, completed: false },
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task: StudyTask = {
      id: Date.now().toString(),
      title: newTask,
      duration: 30, // default
      completed: false
    };
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-white lg:rounded-3xl lg:border lg:border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Calendar className="text-indigo-600" size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Study Planner</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage your daily study tasks</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <form onSubmit={addTask} className="flex items-center gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new study task..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-sm"
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
          >
            <Plus size={20} />
          </button>
        </form>

        <div className="space-y-2">
          {tasks.map((task) => (
            <motion.div
              layout
              key={task.id}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                task.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:border-indigo-100 shadow-sm'
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                  task.completed ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 hover:border-indigo-400'
                }`}
              >
                {task.completed && <Check size={12} />}
              </button>
              <div className="flex-1">
                <p className={`font-bold text-xs ${task.completed ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                  {task.title}
                </p>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-slate-200 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
