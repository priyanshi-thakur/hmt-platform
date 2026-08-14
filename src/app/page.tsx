"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Trophy, Users, Code, MessageSquare, 
  X, Send, Bot, Rocket, Settings, CheckCircle, AlertCircle, 
  PlusCircle, FileText, Activity, LogOut, Search, Star, Award
} from 'lucide-react';

export default function HMTPlatform() {
  // --- STATE MANAGEMENT ---
  const [isMounted, setIsMounted] = useState(false);
  const [role, setRole] = useState<null | 'organizer' | 'participant' | 'judge'>(null);
  const [activeTab, setActiveTab] = useState('Hackathons');
  
  // Database State (Browser LocalStorage)
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [newHackathonName, setNewHackathonName] = useState('');
  
  // Feature States
  const [repoStatus, setRepoStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [teamSkill, setTeamSkill] = useState('');
  const [teamMatched, setTeamMatched] = useState(false);
  
  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi team! I am your HMT AI Mentor. I am calibrated to assist with your AR/VR project architecture and Python logic. How can we optimize your build today?' }
  ]);

  // --- INITIALIZATION ---
  useEffect(() => {
    setIsMounted(true);
    const savedHackathons = localStorage.getItem('hmt_db_hackathons');
    if (savedHackathons) {
      setHackathons(JSON.parse(savedHackathons));
    } else {
      const defaultData = [{ id: 1, name: 'Next-Gen AR/VR Innovation Challenge', duration: '48 Hours', status: 'Active' }];
      setHackathons(defaultData);
      localStorage.setItem('hmt_db_hackathons', JSON.stringify(defaultData));
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- LIVE GEMINI API CONNECTION ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("API Key missing. Please ensure NEXT_PUBLIC_GEMINI_API_KEY is set in Vercel Environment Variables.");
      }

      // Format history for Gemini
      const formattedHistory = messages.slice(1).map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      // System Context Injector
      const systemPrompt = "You are HMT Mentor, an expert AI guide for a 2nd-year CS student team participating in a hackathon. They are building an AR/VR project using basic Python and Tkinter. Keep answers concise, technical, and directly related to Python, OOPs, or AR/VR concepts.";

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'Understood. I am ready to assist with Python and AR/VR.' }] },
            ...formattedHistory,
            { role: 'user', parts: [{ text: userMessage }] }
          ]
        })
      });

      const data = await response.json();
      
      if (data.error) {
         setMessages(prev => [...prev, { role: 'ai', text: `API Error: ${data.error.message}` }]);
      } else {
         const aiResponse = data.candidates[0].content.parts[0].text;
         setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'ai', text: `Connection Error: ${error.message}. Check your Vercel settings.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCreateHackathon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHackathonName.trim()) return;
    const newEntry = { id: Date.now(), name: newHackathonName, duration: '48 Hours', status: 'Active' };
    const updatedDb = [...hackathons, newEntry];
    setHackathons(updatedDb);
    localStorage.setItem('hmt_db_hackathons', JSON.stringify(updatedDb));
    setNewHackathonName('');
    alert('Hackathon launched and synced to local database!');
  };

  if (!isMounted) return null;

  // --- LOGIN DASHBOARD ---
  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="mb-12 text-center animate-in slide-in-from-bottom-4 duration-700">
          <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-purple-200">
            <Trophy size={40} />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">HMT Platform</h1>
          <p className="text-slate-500 mt-3 text-lg">Hackathon Management Tool</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full animate-in fade-in duration-1000">
          <RoleCard 
            icon={<Settings size={48} />} title="Organizer" 
            desc="Launch hackathons, manage sponsors, and oversee participants."
            onClick={() => { setRole('organizer'); setActiveTab('Create'); }} hover="hover:border-purple-500 group-hover:text-purple-600"
          />
          <RoleCard 
            icon={<Code size={48} />} title="Participant" 
            desc="Join events, match with teams, and get active AI mentoring."
            onClick={() => { setRole('participant'); setActiveTab('Hackathons'); }} hover="hover:border-blue-500 group-hover:text-blue-600"
          />
          <RoleCard 
            icon={<Activity size={48} />} title="Judge" 
            desc="Review projects, score rubrics, and view AI analysis reports."
            onClick={() => { setRole('judge'); setActiveTab('Submissions'); }} hover="hover:border-emerald-500 group-hover:text-emerald-600"
          />
        </div>
      </div>
    );
  }

  // --- MAIN APPLICATION LAYOUT ---
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* SIDEBAR NAVIGATION */}
      <div className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col shadow-sm z-10">
        <div className="flex items-center gap-3 font-black text-2xl text-purple-700 mb-8 px-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <Trophy size={18} />
          </div>
          HMT
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          {role === 'organizer' && (
            <>
              <SidebarItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
              <SidebarItem icon={<PlusCircle size={18}/>} label="Create Hackathon" active={activeTab === 'Create'} onClick={() => setActiveTab('Create')} />
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
              <SidebarItem icon={<Award size={18}/>} label="Scoring" active={activeTab === 'Scoring'} onClick={() => setActiveTab('Scoring')} />
            </>
          )}
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Logged in as: {role}</div>
          <SidebarItem icon={<LogOut size={18}/>} label="Switch Role" active={false} onClick={() => setRole(null)} />
        </div>
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className="flex-1 overflow-auto p-10 bg-slate-50">
        <div className="max-w-5xl mx-auto">

          {/* ---------------- ORGANIZER VIEWS ---------------- */}
          {role === 'organizer' && activeTab === 'Dashboard' && (
             <SectionHeader title="Organizer Dashboard" subtitle="Overview of your active events and statistics." />
          )}

          {role === 'organizer' && activeTab === 'Create' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionHeader title="Create Hackathon" subtitle="Launch a new event and configure submission rules." />
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-2xl">
                <form onSubmit={handleCreateHackathon} className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hackathon Name</label>
                    <input type="text" value={newHackathonName} onChange={(e) => setNewHackathonName(e.target.value)} placeholder="e.g. AI for Good 2026" className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Problem Statement</label>
                    <textarea placeholder="Build automated solutions to solve real-world problems..." className="w-full border border-slate-300 rounded-lg px-4 py-3 h-32 focus:ring-2 focus:ring-purple-500 outline-none transition-all"></textarea>
                  </div>
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 rounded-lg transition-colors shadow-sm">Launch Hackathon</button>
                </form>
              </div>
            </div>
          )}

          {/* ---------------- PARTICIPANT VIEWS ---------------- */}
          {role === 'participant' && activeTab === 'Hackathons' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <SectionHeader title="Active Hackathons" subtitle="Discover and join ongoing innovation challenges." />
               <div className="grid gap-4">
                 {hackathons.map((hackathon: any) => (
                    <div key={hackathon.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{hackathon.name}</h3>
                        <div className="flex gap-4 mt-2">
                          <span className="text-slate-500 text-sm flex items-center gap-1"><CheckCircle size={14} className="text-emerald-500"/> {hackathon.status}</span>
                          <span className="text-slate-500 text-sm flex items-center gap-1"><Activity size={14}/> {hackathon.duration}</span>
                        </div>
                      </div>
                      <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">Join Hackathon</button>
                    </div>
                 ))}
               </div>
            </div>
          )}

          {role === 'participant' && activeTab === 'My Team' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionHeader title="Skill Profiling & Team Builder" subtitle="Input your skills to run automated AI-assisted complementary matching." />
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-2xl">
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Your Current Skills</label>
                 <div className="flex gap-4 mb-6">
                    <input 
                      type="text" 
                      value={teamSkill} 
                      onChange={(e) => setTeamSkill(e.target.value)} 
                      placeholder="e.g., Python, Tkinter, OOPs" 
                      className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none" 
                    />
                    <button onClick={() => setTeamMatched(true)} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">Run AI Match</button>
                 </div>

                 {teamMatched && (
                    <div className="p-5 bg-purple-50 border border-purple-100 rounded-xl animate-in fade-in">
                       <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2"><Bot size={18}/> AI Match Recommendation</h4>
                       <p className="text-sm text-purple-800 mb-4">Based on your Python foundation, you need 3D asset integration to complete your AR/VR project. We found a match:</p>
                       <div className="bg-white p-4 rounded-lg border border-purple-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">JD</div>
                             <div>
                               <p className="font-bold text-slate-800">John Doe</p>
                               <p className="text-xs text-slate-500">Unity Engine • 3D Modeling</p>
                             </div>
                          </div>
                          <button className="text-sm bg-slate-900 text-white px-4 py-1.5 rounded-md">Send Invite</button>
                       </div>
                    </div>
                 )}
              </div>
            </div>
          )}

          {role === 'participant' && activeTab === 'AI Teammate' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionHeader title="AI Teammate Analysis" subtitle="Connect your repository to scan your project structure for errors and optimizations." />

              {repoStatus === 'idle' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-3xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                      <Code size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Connect your GitHub Repository</h2>
                      <p className="text-sm text-slate-500">Provide the link to your Python codebase.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <input type="text" defaultValue="https://github.com/team/ar-vr-prototype" className="flex-1 border border-slate-300 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                    <button onClick={() => setRepoStatus('analyzing')} className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors">Connect & Analyze</button>
                  </div>
                </div>
              )}

              {repoStatus === 'analyzing' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center max-w-3xl">
                  <Bot size={56} className="mx-auto text-purple-600 mb-6 animate-bounce" />
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing your codebase...</h2>
                  <div className="w-full bg-slate-100 h-3 rounded-full mt-8 overflow-hidden max-w-md mx-auto">
                    <div className="bg-purple-600 h-full w-2/3 animate-pulse rounded-full"></div>
                  </div>
                  <p className="text-slate-400 mt-4 text-sm font-medium">Scanning Tkinter UI threads and object instantiation...</p>
                  {setTimeout(() => setRepoStatus('complete'), 3000) && null}
                </div>
              )}

              {repoStatus === 'complete' && (
                <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-700">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg mb-5 flex items-center gap-2 text-slate-800"><AlertCircle size={20} className="text-red-500"/> Issues Found</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex justify-between items-start">
                        <div>
                           <span className="text-xs font-bold bg-red-200 text-red-800 px-2.5 py-1 rounded-md">High</span>
                           <p className="text-sm font-semibold text-slate-800 mt-3">Tkinter mainloop blocking AR render.</p>
                           <p className="text-xs text-slate-500 mt-1 font-mono">File: src/ui_engine.py</p>
                        </div>
                        <button className="text-xs font-semibold text-purple-600 border border-purple-200 bg-white px-3 py-1.5 rounded-lg hover:bg-purple-50">View Fix</button>
                      </div>
                      <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex justify-between items-start">
                        <div>
                           <span className="text-xs font-bold bg-orange-200 text-orange-800 px-2.5 py-1 rounded-md">Medium</span>
                           <p className="text-sm font-semibold text-slate-800 mt-3">Inefficient OOP class structure for 3D assets.</p>
                           <p className="text-xs text-slate-500 mt-1 font-mono">File: src/models.py</p>
                        </div>
                        <button className="text-xs font-semibold text-purple-600 border border-purple-200 bg-white px-3 py-1.5 rounded-lg hover:bg-purple-50">View Fix</button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg mb-5 flex items-center gap-2 text-slate-800"><CheckCircle size={20} className="text-emerald-500"/> Integration Status</h3>
                    <div className="space-y-4 text-sm font-medium">
                       <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <span className="text-slate-600 flex items-center gap-2"><Code size={16}/> Python Backend ↔ UI</span>
                          <span className="text-emerald-600 font-semibold">Connected</span>
                       </div>
                       <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <span className="text-slate-600 flex items-center gap-2"><Bot size={16}/> API Endpoints</span>
                          <span className="text-orange-500 font-semibold">1 Issue</span>
                       </div>
                    </div>
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                       <p className="text-sm text-slate-700">Your core logic is connected, but the API endpoint for object generation is failing. Would you like me to fix it?</p>
                       <button className="mt-3 bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">Fix Now</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {role === 'participant' && activeTab === 'My Projects' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <SectionHeader title="Post-Hackathon Continuation" subtitle="Don't let your project die. View AI recommendations for scaling your prototype." />
               <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                     <h3 className="font-bold text-xl text-slate-800 mb-2">Project Potential</h3>
                     <p className="text-slate-600 text-sm mb-6">Great work! Your Python-based AR concept has high scalability potential in the educational tech sector.</p>
                     
                     <h4 className="font-bold text-slate-800 mb-3">AI Recommended Next Steps:</h4>
                     <ul className="space-y-3 text-sm text-slate-700">
                        <li className="flex items-center gap-3"><CheckCircle size={18} className="text-purple-500"/> Migrate Tkinter UI to a modern web framework (React).</li>
                        <li className="flex items-center gap-3"><CheckCircle size={18} className="text-purple-500"/> Optimize computer vision models for lower latency.</li>
                        <li className="flex items-center gap-3"><CheckCircle size={18} className="text-purple-500"/> Prepare a business pitch deck for incubation.</li>
                     </ul>
                  </div>
                  <div className="w-64">
                     <h4 className="font-bold text-slate-800 mb-3">Resources for You</h4>
                     <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition-colors">Advanced Python APIs</button>
                        <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition-colors">Funding & Grants</button>
                        <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition-colors">Mentorship Programs</button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* ---------------- JUDGE VIEWS ---------------- */}
          {role === 'judge' && activeTab === 'Submissions' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <SectionHeader title="Project Submissions" subtitle="Review participant prototypes and AI validation reports." />
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">AR Educational Environment</h3>
                    <p className="text-slate-500 text-sm mt-1">Tech Stack: Python, Tkinter, OpenCV</p>
                  </div>
                  <button onClick={() => setActiveTab('Scoring')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">Evaluate Project</button>
               </div>
             </div>
          )}

          {role === 'judge' && activeTab === 'Scoring' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
               <SectionHeader title="Scoring Rubric" subtitle="Evaluate: AR Educational Environment" />
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
                  <div>
                     <label className="flex justify-between text-sm font-bold text-slate-800 mb-2"><span>Innovation & Creativity</span> <span className="text-purple-600">8/10</span></label>
                     <input type="range" min="1" max="10" defaultValue="8" className="w-full accent-purple-600" />
                  </div>
                  <div>
                     <label className="flex justify-between text-sm font-bold text-slate-800 mb-2"><span>Technical Execution (Python Logic)</span> <span className="text-purple-600">7/10</span></label>
                     <input type="range" min="1" max="10" defaultValue="7" className="w-full accent-purple-600" />
                  </div>
                  <div>
                     <label className="flex justify-between text-sm font-bold text-slate-800 mb-2"><span>Market Feasibility</span> <span className="text-purple-600">9/10</span></label>
                     <input type="range" min="1" max="10" defaultValue="9" className="w-full accent-purple-600" />
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                     <label className="block text-sm font-bold text-slate-800 mb-2">Judge Feedback</label>
                     <textarea placeholder="Leave constructive feedback for the team..." className="w-full border border-slate-300 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-purple-500 outline-none"></textarea>
                  </div>
                  <button className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-lg hover:bg-slate-800 transition-colors">Submit Evaluation</button>
               </div>
             </div>
          )}

        </div>
      </div>

      {/* ---------------- FLOATING AI CHATBOT ---------------- */}
      {role === 'participant' && (
        <div className="fixed bottom-6 right-6 z-50">
          {isChatOpen ? (
            <div className="w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right animate-in zoom-in-95">
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 p-1.5 rounded-lg"><Bot size={20} className="text-white" /></div>
                  <div>
                    <div className="font-bold text-sm leading-tight">HMT Mentor</div>
                    <div className="text-[10px] text-emerald-400 font-medium tracking-wider">GEMINI AI ACTIVE</div>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-1.5 rounded-md">
                  <X size={16} />
                </button>
              </div>
              
              <div className="h-80 p-4 overflow-y-auto flex flex-col gap-4 bg-slate-50 text-sm scroll-smooth">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm text-[13px] leading-relaxed ${msg.role === 'ai' ? 'bg-white border border-slate-200 text-slate-700 self-start rounded-tl-sm' : 'bg-purple-600 text-white self-end rounded-tr-sm'}`}>
                    {msg.text}
                  </div>
                ))}
                {isTyping && (
                  <div className="bg-white border border-slate-200 text-slate-500 self-start p-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2 items-end">
                <textarea 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                  className="flex-1 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 max-h-24 resize-none bg-slate-50" 
                  placeholder="Ask for Python logic help..." 
                  rows={1}
                />
                <button type="submit" disabled={isTyping || !chatInput.trim()} className="bg-purple-600 disabled:bg-slate-300 text-white p-3 rounded-xl hover:bg-purple-700 transition-colors shadow-sm">
                  <Send size={18} />
                </button>
              </form>
            </div>
          ) : (
            <button 
              onClick={() => setIsChatOpen(true)} 
              className="bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:-translate-y-1 flex items-center justify-center border-2 border-purple-500 group relative"
            >
              <Bot size={28} className="group-hover:animate-pulse" />
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 border-2 border-slate-900 rounded-full"></span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// --- UTILITY COMPONENTS ---

function SidebarItem({ icon, label, active, badge, onClick }: any) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all font-medium text-sm ${active ? 'bg-purple-50 text-purple-700 shadow-sm border border-purple-100' : 'text-slate-600 hover:bg-slate-100'}`}>
      {icon} <span>{label}</span>
      {badge && <span className="ml-auto text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full shadow-sm">{badge}</span>}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="mb-8 border-b border-slate-200 pb-5">
       <h1 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
       <p className="text-slate-500 mt-2 font-medium">{subtitle}</p>
    </div>
  );
}

function RoleCard({ icon, title, desc, onClick, hover }: any) {
  return (
    <div onClick={onClick} className={`bg-white p-8 rounded-3xl shadow-sm border border-slate-200 cursor-pointer transition-all text-center group ${hover}`}>
      <div className="mb-5">{icon}</div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
