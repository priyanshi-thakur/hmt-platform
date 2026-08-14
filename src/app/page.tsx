'use client';
import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

export default function HMTPlatform() {
  const [activeTab, setActiveTab] = useState('team');
  const [skillsInput, setSkillsInput] = useState('');
  const [teamResult, setTeamResult] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! I am your 24/7 AI Hackathon Mentor. How can I help your team innovate today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleAiAction = async () => {
    if (!skillsInput.trim()) return;
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Act as an expert HMT Multi-Agent System. Analyze these participant skills/interests and suggest a matching team strategy and role distribution: ${skillsInput}`,
      });
      setTeamResult(response.text || 'No response generated.');
    } catch (error) {
      setTeamResult('Error connecting to Gemini API. Please check your API key.');
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newMessages = [...messages, { role: 'user', text: chatInput }];
    setMessages(newMessages);
    setChatInput('');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: chatInput,
      });
      setMessages([...newMessages, { role: 'model', text: response.text || 'Thinking...' }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'model', text: 'Network error with AI Mentor.' }]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans">
      <div className="w-64 bg-gray-900 p-6 flex flex-col justify-between border-r border-gray-800">
        <div>
          <h1 className="text-xl font-extrabold text-emerald-400 mb-8 tracking-wide">HMT PLATFORM</h1>
          <nav className="space-y-3">
            <button onClick={() => setActiveTab('team')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'team' ? 'bg-emerald-600 font-bold shadow-lg' : 'hover:bg-gray-800 text-gray-400'}`}>👥 Team & Profiler</button>
            <button onClick={() => setActiveTab('ideation')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'ideation' ? 'bg-emerald-600 font-bold shadow-lg' : 'hover:bg-gray-800 text-gray-400'}`}>💡 Ideation & Planning</button>
            <button onClick={() => setActiveTab('chat')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'chat' ? 'bg-emerald-600 font-bold shadow-lg' : 'hover:bg-gray-800 text-gray-400'}`}>🤖 AI Mentor Chat</button>
          </nav>
        </div>
        <div className="text-xs text-gray-500 font-medium">Team 5Forge Ecosystem</div>
      </div>

      <div className="flex-1 p-10 overflow-y-auto bg-gray-950">
        {activeTab === 'team' && (
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-2 text-emerald-400">Skill Profiling & Team Builder</h2>
            <p className="text-gray-400 mb-6">Input team member skills to run automated AI-assisted complementary matching.</p>
            <textarea 
              className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 mb-4"
              rows={4}
              placeholder="e.g., Python, React, UI/UX Design, Machine Learning..."
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
            />
            <button onClick={handleAiAction} className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 px-6 py-3 rounded-xl font-bold transition">
              {loading ? 'Analyzing Agents...' : 'Run Multi-Agent Match'}
            </button>
            {teamResult && <div className="mt-6 p-6 bg-gray-900 rounded-xl border border-gray-800 whitespace-pre-wrap text-gray-200 leading-relaxed">{teamResult}</div>}
          </div>
        )}

        {activeTab === 'ideation' && (
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-2 text-emerald-400">AI Ideation & Project Roadmap</h2>
            <p className="text-gray-400 mb-6">Convert problem statements into structured milestones and development roadmaps.</p>
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 text-gray-400">
              Ideation orchestration engine ready. Switch to chat or use team builder to start building!
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-[85vh] max-w-4xl bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">24/7 AI Mentor Companion</h2>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.map((msg, index) => (
                <div key={index} className={`p-4 rounded-2xl max-w-[80%] leading-relaxed ${msg.role === 'user' ? 'ml-auto bg-emerald-600 text-white font-medium' : 'bg-gray-800 text-gray-200 border border-gray-700'}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <input 
                type="text" 
                className="flex-1 p-4 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                placeholder="Ask your AI mentor about code, architecture, or debugging..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage} className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 px-8 rounded-xl font-bold transition">Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
