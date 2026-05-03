/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, User, Bot, Trash2, StopCircle, Paperclip, X, Image as ImageIcon, Camera, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Message, LibraryItem } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
      title: `${title} (Chat Capture)`,
      content: 'Captured snapshot of study conversation.',
      type: 'note',
      addedAt: Date.now(),
      imageUrl: dataUrl
    };
    
    localStorage.setItem('study-library', JSON.stringify([newItem, ...items]));
    alert('Conversation captured and saved to My Library! 📚');
  } catch (err) {
    console.error('Failed to capture:', err);
    alert('Failed to capture snapshot.');
  }
}

interface ChatAssistantProps {
  profile: UserProfile;
}

export function ChatAssistant({ profile }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hello ${profile.name}! I am your personal AI Study Partner optimized for ${profile.currentClass || profile.level} level studies. How can I help you today?`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition();

  useEffect(() => {
    if (transcript) {
      setInput(prev => prev + ' ' + transcript);
    }
  }, [transcript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const base64 = readerEvent.target?.result as string;
        const data = base64.split(',')[1];
        setSelectedFile({
          name: file.name,
          data: data,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedFile) || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: Date.now(),
      image: selectedFile?.mimeType.startsWith('image/') ? `data:${selectedFile.mimeType};base64,${selectedFile.data}` : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    const currentFile = selectedFile;
    
    setInput('');
    setSelectedFile(null);
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role as 'user' | 'model',
        parts: [{ text: m.text }]
      }));
      
      const response = await generateChatResponse(
        currentInput || "Analyze the attached file.", 
        history, 
        profile,
        currentFile ? { mimeType: currentFile.mimeType, data: currentFile.data } : undefined
      );
      
      const aiMessage: Message = {
        role: 'model',
        text: response || 'Sorry, I could not generate a response.',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        role: 'model',
        text: `Error connecting to AI: ${error?.message || 'Please check your internet connection or try again.'}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear all messages?')) {
      setMessages([{ 
        role: 'model', 
        text: 'Chat cleared. How can I help you now?', 
        timestamp: Date.now() 
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white lg:rounded-3xl lg:border lg:border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm tracking-tight">AI Study Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Optimized for: {profile.currentClass || profile.level}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => captureToLibrary('chat-messages', 'Study Session')}
            className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
            title="Screnshot Conversation"
          >
            <Camera size={18} />
          </button>
          <button 
            onClick={clearChat}
            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
            title="Clear Chat"
            id="clear-chat-btn"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div id="chat-messages" className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-slate-50/30">
        {messages.map((message, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] lg:max-w-[70%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded flex-shrink-0 flex items-center justify-center mt-1 shadow-sm ${
                message.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100 text-indigo-600'
              }`}>
                {message.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={message.role === 'user' ? 'text-right' : 'text-left'}>
                {message.image && (
                  <img src={message.image} alt="User Upload" className="w-48 h-auto rounded-xl mb-2 ml-auto shadow-sm border border-slate-200" />
                )}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed relative group ${
                  message.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm'
                }`}>
                  {message.role === 'model' && (
                    <button 
                      onClick={() => {
                        const saved = localStorage.getItem('study-library');
                        const items = saved ? JSON.parse(saved) : [];
                        const newItem = { id: Date.now().toString(), title: 'Chat Insight', content: message.text, type: 'note' as const, addedAt: Date.now() };
                        localStorage.setItem('study-library', JSON.stringify([newItem, ...items]));
                        alert('Saved to Library! 📚');
                      }}
                      className="absolute -right-10 top-0 p-2 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                      title="Save to Library"
                    >
                      <Archive size={16} />
                    </button>
                  )}
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  </div>
                </div>
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-1 block px-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
              <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 lg:p-6 border-t border-slate-100 bg-white space-y-4">
        <AnimatePresence>
          {selectedFile && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-3 p-2 bg-indigo-50 border border-indigo-100 rounded-xl"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                {selectedFile.mimeType.startsWith('image/') ? <ImageIcon size={20} /> : <Paperclip size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-indigo-900 truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-indigo-400 capitalize">{selectedFile.mimeType.split('/')[1]} File</p>
              </div>
              <button 
                onClick={() => setSelectedFile(null)}
                className="p-1.5 hover:bg-white rounded-lg text-indigo-400 hover:text-red-500 transition-colors"
                id="remove-file-btn"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or upload a file..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
              id="chat-input"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all"
                id="attach-file-btn"
              >
                <Paperclip size={18} />
              </button>
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`p-1.5 rounded-lg transition-all ${
                  isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-indigo-600'
                }`}
              >
                {isListening ? <StopCircle size={18} /> : <Mic size={18} />}
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept="image/*, application/pdf, text/plain"
              id="chat-file-input"
            />
          </div>
          <button
            type="submit"
            disabled={(!input.trim() && !selectedFile) || isTyping}
            className={`p-3 rounded-xl transition-all ${
              (input.trim() || selectedFile) && !isTyping 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
