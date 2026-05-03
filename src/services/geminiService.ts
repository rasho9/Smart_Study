/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InferenceClient } from "@huggingface/inference";
import { UserProfile } from "../types";

const hf = new InferenceClient(import.meta.env.VITE_HF_TOKEN);
const MODEL = "meta-llama/Llama-3.1-8B-Instruct";


function getProfileContext(profile: UserProfile): string {
  return `
STUDENT CONTEXT:
- Name: ${profile.name}
- Academic Level: ${profile.level}
- Current Grade/Class: ${profile.currentClass}
- Semester: ${profile.semester || "Not applicable"}
- Previous Academic Background: ${profile.previousResults || "General student"}
- Personal Interests: ${profile.interests.join(", ") || "Various academic topics"}
`;
}

async function askAI(prompt: string) {
  const response = await hf.chatCompletion({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 800,
    temperature: 0.4,
  });

  return response?.choices?.[0]?.message?.content || "No response generated.";
}




export async function generateChatResponse(
  message: string,
  history: any[],
  profile: UserProfile
) {
  const prompt = `
You are StudyPro AI.

${getProfileContext(profile)}

User message:
${message}
`;

  return await askAI(prompt);
}

export async function simplifyNotes(text: string, profile: UserProfile) {
  const prompt = `
Simplify these notes for ${profile.name}.

${getProfileContext(profile)}

Structure:
- Title
- Core Concepts
- Key Points
- Student Insight

Notes:
${text}
`;

  return await askAI(prompt);
}

export async function solveAssignment(question: string, profile: UserProfile) {
  const prompt = `
Solve this assignment for ${profile.name}.

${getProfileContext(profile)}

Give:
- Step by step explanation
- Final answer
- Exam tip

Question:
${question}
`;

  return await askAI(prompt);
}

export async function explainConcept(concept: string, profile: UserProfile) {
  const prompt = `
Explain this concept for ${profile.name}.

${getProfileContext(profile)}

Concept:
${concept}

Structure:
- What it is
- Deep explanation
- Why it matters
- Real world example
`;

  return await askAI(prompt);
}

export async function generateExam(
  topic: string,
  profile: UserProfile,
  counts: { mcqs: number; short: number; long: number }
) {
  const prompt = `
Create an exam for ${profile.name}.

${getProfileContext(profile)}

Topic: ${topic}

Return ONLY valid JSON in this exact format:

{
  "mcqs": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "string"
    }
  ],
  "theory": [
    {
      "question": "string",
      "suggestedAnswer": "string",
      "type": "short"
    }
  ]
}

Generate:
- ${counts.mcqs} MCQs
- ${counts.short} short questions
- ${counts.long} long questions

Return only JSON. No markdown. No extra text.
`;

  const raw = await askAI(prompt);

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Exam JSON parse failed:", raw);
    return {
      mcqs: [],
      theory: [],
    };
  }
}

export async function generateProgressReport(profile: UserProfile, marks: any[]) {
  const prompt = `
Create a progress report for ${profile.name}.

${getProfileContext(profile)}

Marks:
${JSON.stringify(marks)}

Include:
- strengths
- weaknesses
- trend analysis
- recommendations
`;

  return await askAI(prompt);
}