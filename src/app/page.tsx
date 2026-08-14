"use client";

import React, { useState } from 'react';
import { LayoutDashboard, Trophy, Users, CheckCircle, Github, MessageSquare, X, Send, Bot, Rocket, Settings } from 'lucide-react';

export default function HMTPlatform() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi Team! I am your 24/7 AI Mentor. Need help debugging your Python code or optimizing your AR/VR logic?' }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    
    // Simulate AI thinking and responding (You can connect your Gemini API here!)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: 'I am analyzing your request. Since we are using basic Python and Tkinter for this prototype, let me fetch the best integration approach...' }]);
    }, 1000);
    
    setChatInput('');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col">
        <div className="flex items-center gap-2 font-black text-2xl text-purple-700 mb-10">
          <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center text-white">
            <Trophy size={18} />
          </div>
          HMT
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
            <LayoutDashboard size={18} /> Home
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
            <Trophy size={18} /> Hackathons
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
            <Users size={18} /> My Team
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 bg-purple-50 text-purple-700 rounded-lg cursor-pointer font-semibold shadow-sm border border-purple-100">
            <Bot size={18} /> AI Teammate <span className="ml-auto text-[10px] bg-purple-200 px-2 py-0.5 rounded-full">New</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
            <Rocket size={18} /> My Projects
          </div>
        </nav>

        <div className="mt-auto flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
          <Settings size={18} /> Settings
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto p-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-slate-900">AI Teammate</h1>
          <p className="text-slate-500 mb-8">Connect your repository and let your AI partner analyze your AR/VR project structure.</p>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                <Github size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Connect your GitHub Repository</h2>
                <p className="text-sm text-slate-500">Provide the link to your Python codebase</p>
              </div>
            </div>

            <div className="flex gap-4">
              <input 
                type="text" 
                defaultValue="https://github.com/team/ar-vr-innovators" 
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-700 font-mono text-sm"
              />
              <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Connect
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-100">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Repository connected successfully!</span>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING CHATBOT */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right">
            {/* Chat Header */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-purple-400" />
                <span className="font-semibold text-sm">HMT Mentor</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-300 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="h-72 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50 text-sm">
              {messages.map((msg, idx) => (
                <div key={idx} className={`max-w-[85%] p-3 rounded-xl ${msg.role === 'ai' ? 'bg-white border border-slate-200 text-slate-700 self-start rounded-tl-none' : 'bg-purple-600 text-white self-end rounded-tr-none shadow-sm'}`}>
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                placeholder="Ask me anything..." 
              />
              <button type="submit" className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors">
                <Send size={16} />
              </button>
            </form>
          </div>
        ) : (
          <button 
            onClick={() => setIsChatOpen(true)} 
            className="bg-purple-600 text-white p-4 rounded-full shadow-xl hover:bg-purple-700 transition-transform hover:scale-110 flex items-center justify-center"
          >
            <MessageSquare size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
