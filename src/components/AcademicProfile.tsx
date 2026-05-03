import React, { useState, useEffect, useMemo } from 'react';
import { Plus, GraduationCap, Sparkles, Loader2, Trash2, Calendar, BookOpen, Target, TrendingUp } from 'lucide-react';
import { UserProfile } from '../types';
import { generateProgressReport } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'motion/react';

interface AcademicMark {
  id?: string;
  subject: string;
  mark: number;
  total: number;
  date: string;
}

export function AcademicProfile({ profile }: { profile: UserProfile }) {
  const [marks, setMarks] = useState<AcademicMark[]>([]);
  const [newMark, setNewMark] = useState<AcademicMark>({ subject: '', mark: 0, total: 100, date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const savedMarks = localStorage.getItem('academic-marks');
    if (savedMarks) {
      setMarks(JSON.parse(savedMarks));
    }
  }, []);

  const addMark = async () => {
    if (!newMark.subject.trim() || newMark.mark < 0 || newMark.total <= 0) {
      alert("Please enter valid subject and marks.");
      return;
    }

    setLoading(true);
    try {
      const newEntry = {
        ...newMark,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      const updatedMarks = [...marks, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setMarks(updatedMarks);
      localStorage.setItem('academic-marks', JSON.stringify(updatedMarks));
      setNewMark({ subject: '', mark: 0, total: 100, date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      console.error("Error adding mark: ", error);
      alert("Failed to add mark.");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (marks.length === 0) return;
    setReportLoading(true);
    try {
      const reportText = await generateProgressReport(profile, marks);
      setReport(reportText);
    } catch (error) {
      console.error("Error generating report: ", error);
    } finally {
      setReportLoading(false);
    }
  };

  // Prepare data for Chart 1: Over Time (Line Chart)
  const timeData = useMemo(() => {
    return marks.map(m => ({
      date: new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      percentage: Math.round((m.mark / m.total) * 100),
      subject: m.subject
    }));
  }, [marks]);

  // Prepare data for Chart 2: By Subject (Bar Chart)
  const subjectData = useMemo(() => {
    const subjects: Record<string, { total: number, sum: number, count: number }> = {};
    marks.forEach(m => {
      const s = m.subject.trim().toUpperCase();
      if (!subjects[s]) subjects[s] = { total: 0, sum: 0, count: 0 };
      subjects[s].sum += m.mark;
      subjects[s].total += m.total;
      subjects[s].count += 1;
    });

    return Object.keys(subjects).map(s => ({
      subject: s,
      average: Math.round((subjects[s].sum / subjects[s].total) * 100)
    }));
  }, [marks]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 lg:p-12 bg-slate-50/10">
      <header className="mb-12 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <GraduationCap className="text-indigo-600" size={40} />
              Academic Performance
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Harness AI to analyze your learning trajectory</p>
          </div>
          <button 
            onClick={generateReport} 
            disabled={reportLoading || marks.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {reportLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            AI Progress Insights
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Statistics & Charts */}
        {marks.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <TrendingUp size={20} className="text-indigo-500" /> Performance Trend
                </h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                    />
                    <Line type="monotone" dataKey="percentage" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <BookOpen size={20} className="text-emerald-500" /> Subject Mastery
                </h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                    />
                    <Bar dataKey="average" radius={[8, 8, 0, 0]}>
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* AI Report Section */}
        {report && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-950 text-indigo-50 rounded-[3rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="text-indigo-400" size={28} />
                <h3 className="text-2xl font-black tracking-tight">AI Progress Analysis</h3>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-indigo-100/80 prose-headings:text-white prose-strong:text-indigo-300">
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
            </div>
          </motion.section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Form */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50">
            <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight flex items-center gap-2">
              <Plus className="text-indigo-600" size={24} /> New Record
            </h3>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1">Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g., Mathematics" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all shadow-sm" 
                  value={newMark.subject} 
                  onChange={e => setNewMark({...newMark, subject: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1">Mark Obtained</label>
                  <input 
                    type="number" 
                    placeholder="85" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all shadow-sm" 
                    value={newMark.mark} 
                    onChange={e => setNewMark({...newMark, mark: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1">Total Marks</label>
                  <input 
                    type="number" 
                    placeholder="100" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all shadow-sm" 
                    value={newMark.total} 
                    onChange={e => setNewMark({...newMark, total: Number(e.target.value)})} 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-1">Exam Date</label>
                <input 
                  type="date" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all shadow-sm" 
                  value={newMark.date} 
                  onChange={e => setNewMark({...newMark, date: e.target.value})} 
                />
              </div>
            </div>
            <button 
              onClick={addMark} 
              disabled={loading} 
              className="w-full mt-8 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              {loading ? 'SYNCING DATA...' : 'ADD TO RECORDS'}
            </button>
          </section>

          {/* List */}
          <section className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 min-h-[500px]">
            <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight flex items-center justify-between">
              Chronological Records
              <span className="text-xs font-black text-indigo-500 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-widest">
                {marks.length} Total entries
              </span>
            </h3>
            
            {marks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                  <Calendar size={32} />
                </div>
                <h4 className="font-bold text-slate-800 mb-1">No markers found</h4>
                <p className="text-xs text-slate-400 max-w-[200px]">Start adding your previous results to see AI growth analysis.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...marks].reverse().map(mark => (
                  <div key={mark.id} className="group flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 border border-slate-100 group-hover:border-indigo-100 shadow-sm transition-all">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-base">{mark.subject}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{mark.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xl font-black text-indigo-600 leading-none">{mark.mark}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">out of {mark.total}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-xl font-black text-xs ${
                        mark.mark / mark.total >= 0.8 ? 'bg-emerald-50 text-emerald-600' :
                        mark.mark / mark.total >= 0.6 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {Math.round((mark.mark / mark.total) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
