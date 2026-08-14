"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Trophy, Users, Code, MessageSquare, 
  X, Send, Bot, Rocket, Settings, CheckCircle, AlertCircle, 
  PlusCircle, FileText, Activity, LogOut 
} from 'lucide-react';

export default function HMTPlatform() {
  // --- STATE MANAGEMENT ---
  const [isMounted, setIsMounted] = useState(false);
  const [role, setRole] = useState<null | 'organizer' | 'participant' | 'judge'>(null);
  const [activeTab, setActiveTab] = useState('Hackathons');
  
  // Database State (Using LocalStorage for the prototype)
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [newHackathonName, setNewHackathonName] = useState('');
  
  // AI Teammate State
  const [repoStatus, setRepoStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  
  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your Hackathon Mentor. I can help debug logic, suggest features, or prepare your final pitch. How can I assist your team today?' }
  ]);

  // --- DATABASE SIMULATION ---
  useEffect(() => {
    setIsMounted(true);
    const savedHackathons = localStorage.getItem('hmt_db_hackathons');
    if (savedHackathons) {
      setHackathons(JSON.parse(savedHackathons));
    } else {
      // Default demo data
      const defaultData = [{ id: 1, name: 'AI for Good Hackathon', duration: '48 Hours' }];
      setHackathons(defaultData);
      localStorage.setItem('hmt_db_hackathons', JSON.stringify(defaultData));
    }
  }, []);

  const handleCreateHackathon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHackathonName.trim()) return;
    
    const newEntry = { id: Date.now(), name: newHackathonName, duration: '48 Hours' };
    const updatedDb = [...hackathons, newEntry];
    
    setHackathons(updatedDb);
    localStorage.setItem('hmt_db_hackathons', JSON.stringify(updatedDb));
    setNewHackathonName('');
    alert('Hackathon launched successfully and saved to database!');
  };

  // --- CHATBOT LOGIC ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: 'I am analyzing that now. Based on standard workflows, I recommend breaking that down into smaller modular components before testing.' }]);
    }, 1000);
    setChatInput('');
  };

  // Prevent hydration errors
  if (!isMounted) return null;

  // --- LOGIN SCREEN ---
  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
            <Trophy size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">HMT Platform</h1>
          <p className="text-slate-500 mt-2">Hackathon Management Tool Prototype</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
          <div onClick={() => { setRole('organizer'); setActiveTab('Create'); }} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-purple-500 hover:shadow-md transition-all text-center group">
            <Settings size={40} className="mx-auto text-slate-400 group-hover:text-purple-600 mb-4 transition-colors" />
            <h2 className="text-xl font-bold text-slate-800">Organizer</h2>
            <p className="text-sm text-slate-500 mt-2">Launch hackathons, manage sponsors, and oversee participants.</p>
          </div>
          
          <div onClick={() => { setRole('participant'); setActiveTab('Hackathons'); }} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all text-center group">
            <Code size={40} className="mx-auto text-slate-400 group-hover:text-blue-600 mb-4 transition-colors" />
            <h2 className="text-xl font-bold text-slate-800">Participant</h2>
            <p className="text-sm text-slate-500 mt-2">Join events, connect your repository, and get AI mentoring.</p>
          </div>

          <div onClick={() => { setRole('judge'); setActiveTab('Submissions'); }} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all text-center group">
            <Activity size={40} className="mx-auto text-slate-400 group-hover:text-emerald-600 mb-4 transition-colors" />
            <h2 className="text-xl font-bold text-slate-800">Judge</h2>
            <p className="text-sm text-slate-500 mt-2">Review projects, score rubrics, and view AI analysis reports.</p>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD LAYOUT ---
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col">
        <div className="flex items-center gap-3 font-black text-2xl text-purple-700 mb-8">
          <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center text-white">
            <Trophy size={18} />
          </div>
          HMT
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          {role === 'organizer' && (
            <>
              <SidebarItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
              <SidebarItem icon={<PlusCircle size={18}/>} label="Create" active={activeTab === 'Create'} onClick={() => setActiveTab('Create')} />
              <SidebarItem icon={<Users size={18}/>} label="Participants" active={activeTab === 'Participants'} onClick={() => setActiveTab('Participants')} />
            </>
          )}

          {role === 'participant' && (
            <>
              <SidebarItem icon={<Trophy size={18}/>} label="Hackathons" active={activeTab === 'Hackathons'} onClick={() => setActiveTab('Hackathons')} />
              <SidebarItem icon={<Users size={18}/>} label="My Team" active={activeTab === 'My Team'} onClick={() => setActiveTab('My Team')} />
              <SidebarItem icon={<Bot size={18}/>} label="AI Teammate" active={activeTab === 'AI Teammate'} onClick={() => setActiveTab('AI Teammate')} badge="New" />
              <SidebarItem icon={<Rocket size={18}/>} label="My Projects" active={activeTab === 'My Projects'} onClick={() => setActiveTab('My Projects')} />
            </>
          )}

          {role === 'judge' && (
            <>
              <SidebarItem icon={<FileText size={18}/>} label="Submissions" active={activeTab === 'Submissions'} onClick={() => setActiveTab('Submissions')} />
              <SidebarItem icon={<CheckCircle size={18}/>} label="Scoring" active={activeTab === 'Scoring'} onClick={() => setActiveTab('Scoring')} />
            </>
          )}
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Logged in as: {role}</div>
          <SidebarItem icon={<LogOut size={18}/>} label="Switch Role" active={false} onClick={() => setRole(null)} />
        </div>
      </div>

      {/* DYNAMIC MAIN CONTENT */}
      <div className="flex-1 overflow-auto p-10">
        <div className="max-w-5xl mx-auto">
          
          {/* ORGANIZER: Create Hackathon */}
          {role === 'organizer' && activeTab === 'Create' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-bold mb-8 text-slate-900">Create Hackathon</h1>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-2xl">
                <form onSubmit={handleCreateHackathon} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hackathon Name</label>
                    <input type="text" value={newHackathonName} onChange={(e) => setNewHackathonName(e.target.value)} placeholder="e.g. Innovate 2026" className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Problem Statement</label>
                    <textarea placeholder="Describe the challenge..." className="w-full border border-slate-300 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-purple-500"></textarea>
                  </div>
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors mt-2">Launch Hackathon</button>
                </form>
              </div>
            </div>
          )}

          {/* PARTICIPANT: Hackathons List (Reading from DB) */}
          {role === 'participant' && activeTab === 'Hackathons' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h1 className="text-3xl font-bold mb-8 text-slate-900">Active Hackathons</h1>
               <div className="grid gap-4">
                 {hackathons.map((hackathon: any) => (
                    <div key={hackathon.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{hackathon.name}</h3>
                        <p className="text-slate-500 text-sm mt-1">Duration: {hackathon.duration}</p>
                      </div>
                      <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">Join Hackathon</button>
                    </div>
                 ))}
               </div>
            </div>
          )}

          {/* PARTICIPANT: AI Teammate (The Core Prototype) */}
          {role === 'participant' && activeTab === 'AI Teammate' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-bold mb-2 text-slate-900">AI Teammate & Analysis</h1>
              <p className="text-slate-500 mb-8">Connect your repository to receive automated code analysis and scaling strategies.</p>

              {repoStatus === 'idle' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                      <Code size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Connect your Code Repository</h2>
                      <p className="text-sm text-slate-500">Provide the link to your codebase for scanning.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <input type="text" defaultValue="https://github.com/team/prototype-build" className="flex-1 border border-slate-300 rounded-lg px-4 py-3 font-mono text-sm" />
                    <button onClick={() => setRepoStatus('analyzing')} className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium">Connect & Analyze</button>
                  </div>
                </div>
              )}

              {repoStatus === 'analyzing' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center">
                  <Bot size={48} className="mx-auto text-purple-600 mb-4 animate-bounce" />
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing your codebase...</h2>
                  <div className="w-full bg-slate-100 h-3 rounded-full mt-6 overflow-hidden">
                    <div className="bg-purple-600 h-full w-1/2 animate-pulse rounded-full"></div>
                  </div>
                  <p className="text-slate-400 mt-4 text-sm">Fetching files and scanning architecture...</p>
                  {/* Auto-complete simulation */}
                  {setTimeout(() => setRepoStatus('complete'), 2500) && null}
                </div>
              )}

              {repoStatus === 'complete' && (
                <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-700">
                  {/* Bug Finder Widget */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><AlertCircle size={18} className="text-red-500"/> Critical Issues Found</h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                        <span className="text-xs font-bold bg-red-200 text-red-800 px-2 py-1 rounded">High</span>
                        <p className="text-sm font-medium text-slate-800 mt-2">Tkinter mainloop is blocking the AR rendering thread.</p>
                        <p className="text-xs text-slate-500 mt-1">File: core_ui.py</p>
                      </div>
                      <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                        <span className="text-xs font-bold bg-orange-200 text-orange-800 px-2 py-1 rounded">Medium</span>
                        <p className="text-sm font-medium text-slate-800 mt-2">Python memory leak detected during 3D object instantiation.</p>
                        <p className="text-xs text-slate-500 mt-1">File: environment_loader.py</p>
                      </div>
                    </div>
                  </div>

                  {/* Post-Hackathon & Scaling */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Rocket size={18} className="text-purple-600"/> Post-Hackathon Scaling</h3>
                    <div className="mb-4">
                      <p className="text-sm text-slate-600">Great work! Your project has high market potential. Here are the AI-recommended next steps:</p>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-700">
                      <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> Focus core feature on spatial mapping accuracy.</li>
                      <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> Optimize Python frame rate calculations.</li>
                      <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> Prepare a 2-minute pitch deck.</li>
                    </ul>
                    <button className="w-full mt-6 bg-purple-50 text-purple-700 font-semibold py-2.5 rounded-lg border border-purple-200 hover:bg-purple-100">Generate Full Report</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* JUDGE: Submissions (Basic placeholder) */}
          {role === 'judge' && activeTab === 'Submissions' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-bold mb-8 text-slate-900">Review Submissions</h1>
              <p className="text-slate-500">Participant projects and AI analysis reports will populate here for evaluation.</p>
            </div>
          )}

        </div>
      </div>

      {/* FLOATING CHATBOT */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-purple-400" />
                <span className="font-semibold text-sm">HMT Mentor</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-300 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="h-72 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50 text-sm">
              {messages.map((msg, idx) => (
                <div key={idx} className={`max-w-[85%] p-3 rounded-xl ${msg.role === 'ai' ? 'bg-white border border-slate-200 text-slate-700 self-start rounded-tl-none shadow-sm' : 'bg-purple-600 text-white self-end rounded-tr-none shadow-sm'}`}>
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ask a question..." />
              <button type="submit" className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors">
                <Send size={16} />
              </button>
            </form>
          </div>
        ) : (
          <button onClick={() => setIsChatOpen(true)} className="bg-purple-600 text-white p-4 rounded-full shadow-xl hover:bg-purple-700 transition-transform hover:scale-110 flex items-center justify-center">
            <MessageSquare size={24} />
          </button>
        )}
      </div>
    </div>
  );
}

// Utility component for sidebar items
function SidebarItem({ icon, label, active, badge, onClick }: any) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${active ? 'bg-purple-50 text-purple-700 font-semibold shadow-sm border border-purple-100' : 'text-slate-600 hover:bg-slate-100'}`}>
      {icon} <span>{label}</span>
      {badge && <span className="ml-auto text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">{badge}</span>}
    </div>
  );
}
