/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppView = 
  | 'home' 
  | 'chat' 
  | 'notes' 
  | 'assignment' 
  | 'explainer' 
  | 'exam' 
  | 'planner' 
  | 'library'
  | 'academic-profile'
  | 'history' 
  | 'settings';

export type StudentLevel = 'school' | 'college' | 'university';

export interface UserProfile {
  name: string;
  level: StudentLevel;
  interests?: string[];
  bio?: string;
  currentClass: string;
  semester?: string;
  previousResults?: string;
  photoUrl?: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  type: 'book' | 'note';
  addedAt: number;
  imageUrl?: string;
  fileUrl?: string;
  fileType?: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  image?: string; // Optional image data URL
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface TheoryQuestion {
  question: string;
  suggestedAnswer: string;
  type: 'short' | 'long';
}

export interface ExamResult {
  mcqs: { question: string; selected: number; correct: number }[];
  theory: { question: string; type: 'short' | 'long' }[];
  score: number;
}

export interface StudyTask {
  id: string;
  title: string;
  duration: number; // in minutes
  completed: boolean;
}

export interface Stat {
  label: string;
  value: string | number;
  icon: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  type: AppView;
  timestamp: number;
}
