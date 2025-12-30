'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, ShieldCheck, Wand2, Copy, Check, User, Loader } from 'lucide-react';
import Image from 'next/image';

// AGENT CONFIGURATION WITH AVATARS
const AGENTS = {
  USER: { 
    name: 'You', 
    color: 'bg-gray-900', 
    icon: User,
    avatar: null
  },
  BRIAN: { 
    name: 'Brian', 
    role: 'Campaign Strategist', 
    color: 'bg-blue-600', 
    icon: Sparkles,
    avatar: '/images/team/brian-avatar.jpg'
  },
  LESTER: { 
    name: 'Lester', 
    role: 'Brand Guardian', 
    color: 'bg-green-600', 
    icon: ShieldCheck,
    avatar: '/images/team/lester-avatar.jpg'
  },
  ALESSA: { 
    name: 'Alessa', 
    role: 'Asset Specialist', 
    color: 'bg-purple-600', 
    icon: Wand2,
    avatar: '/images/team/alessa-avatar.jpg'
  }
};

type Message = {
  id: string;
  sender: 'USER' | 'BRIAN' | 'LESTER' | 'ALESSA';
  content: string;
  type: 'text' | 'concept' | 'evaluation' | 'prompts';
  timestamp: string;
};

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'BRIAN',
      content: "Hey! 👋 Ready to create some killer campaigns. What are we working on?\n\nTry something like:\n• 'Christmas sale for Eclipse targeting tired moms'\n• 'Holiday gift bundle for Halo'\n• 'New Year wellness campaign for Carlo'",
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Parse user input
    const campaignType = input.toLowerCase().includes('christmas') || input.toLowerCase().includes('holiday') 
      ? 'SEASONAL (Holiday)' 
      : 'EVERGREEN (Growth Mode)';
    
    const avatar = input.toLowerCase().includes('mom') 
      ? 'Sophia (Ambiance)' 
      : 'Carlo (Busy Pro)';
    
    const product = input.toLowerCase().includes('halo') 
      ? 'Halo (Portable)' 
      : 'Eclipse 2.0 (Flagship)';

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'USER',
      content: input,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // BRIAN STARTS THINKING
    setIsTyping('BRIAN');

    try {
      // Call Agent 1 (Brian - Ideation)
      const agent1Response = await fetch('/api/agent1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignType, avatar, product, format: '9:16' })
      });
      
      if (!agent1Response.ok) throw new Error('Brian failed to respond');
      const agent1Data = await agent1Response.json();

      const brianMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'BRIAN',
        content: agent1Data.result,
        type: 'concept',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, brianMsg]);

      // LESTER STARTS EVALUATING
      setIsTyping('LESTER');

      const agent3Response = await fetch('/api/agent3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concepts: agent1Data.result })
      });

      if (!agent3Response.ok) throw new Error('Lester failed to respond');
      const agent3Data = await agent3Response.json();

      const lesterMsg: Message = {
        id: (Date.now() + 2).toString(),
        sender: 'LESTER',
        content: agent3Data.result,
        type: 'evaluation',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, lesterMsg]);

      // ALESSA STARTS GENERATING
      setIsTyping('ALESSA');

      const agent2Response = await fetch('/api/agent2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: agent1Data.result, format: '9:16' })
      });

      if (!agent2Response.ok) throw new Error('Alessa failed to respond');
      const agent2Data = await agent2Response.json();

      const alessaMsg: Message = {
        id: (Date.now() + 3).toString(),
        sender: 'ALESSA',
        content: agent2Data.result,
        type: 'prompts',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, alessaMsg]);

    } catch (error: any) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        sender: 'BRIAN',
        content: `Oops! Something went wrong: ${error.message}`,
        type: 'text',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(null);
    }
  };

  return (
    <div className="flex h-screen bg-[#1e1e24] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#15151a] border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold text-white mb-1">zennya<span className="text-[#fd8c68]">.team</span></h1>
          <p className="text-xs text-gray-500">AI Creative War Room</p>
        </div>
        
        <div className="flex-1 p-4 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Team Members</h3>
            <AgentCard agent={AGENTS.BRIAN} status="Online" isTyping={isTyping === 'BRIAN'} />
            <AgentCard agent={AGENTS.LESTER} status="Online" isTyping={isTyping === 'LESTER'} />
            <AgentCard agent={AGENTS.ALESSA} status="Online" isTyping={isTyping === 'ALESSA'} />
          </div>
        </div>

        <div className="p-4 border-t border-white/10 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            System Online • v10.1
          </div>
        </div>
      </aside>

      {/* MAIN CHAT */}
      <main className="flex-1 flex flex-col">
        
        {/* HEADER */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#1e1e24]">
          <div>
            <h2 className="font-bold text-lg"># campaign-war-room</h2>
            <p className="text-xs text-gray-500">Brian, Lester, and Alessa are ready</p>
          </div>
        </header>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              onCopy={copyToClipboard}
              copiedText={copiedText}
            />
          ))}
          
          {isTyping && (
            <div className="flex items-start gap-4">
              <AgentAvatar agent={AGENTS[isTyping as keyof typeof AGENTS]} isTyping={true} />
              <div className="animate-pulse">
                <span className="text-sm font-bold">{AGENTS[isTyping as keyof typeof AGENTS].name}</span>
                <p className="text-xs text-gray-500">is thinking...</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-6 bg-[#1e1e24]">
          <div className="bg-[#2b2b36] rounded-xl p-2 flex items-end gap-2 border border-white/5">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Tell the team what to build... (e.g., 'Christmas sale for Eclipse')"
              className="flex-1 bg-transparent text-white placeholder-gray-500 p-3 max-h-32 focus:outline-none resize-none"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-3 bg-[#fd8c68] hover:bg-[#e67a56] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-center mt-2 text-xs text-gray-600">Press Enter to send • Shift+Enter for new line</p>
        </div>

      </main>
    </div>
  );
}

// AGENT AVATAR COMPONENT
function AgentAvatar({ agent, isTyping }: any) {
  if (agent.avatar && agent.avatar !== null) {
    return (
      <div className={`relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ${isTyping ? 'ring-2 ring-white/50 animate-pulse' : ''}`}>
        <Image 
          src={agent.avatar} 
          alt={agent.name}
          fill
          className="object-cover"
        />
      </div>
    );
  }
  
  return (
    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${agent.color} ${isTyping ? 'animate-pulse' : ''}`}>
      {React.createElement(agent.icon, { size: 20 })}
    </div>
  );
}

// MESSAGE BUBBLE COMPONENT
function MessageBubble({ message, onCopy, copiedText }: any) {
  const isUser = message.sender === 'USER';
  const agent = AGENTS[message.sender];

  // Parse prompts if type is 'prompts'
  const parsePrompts = () => {
    if (message.type !== 'prompts') return null;
    
    const positiveMatches = message.content.match(/✨\s*POSITIVE PROMPT:?\s*([\s\S]*?)(?=🚫|$)/gi);
    const negativeMatches = message.content.match(/🚫\s*NEGATIVE PROMPT:?\s*([\s\S]*?)(?=✨|$)/gi);
    
    const prompts = [];
    const maxLength = Math.max(positiveMatches?.length || 0, negativeMatches?.length || 0);
    
    for (let i = 0; i < maxLength; i++) {
      prompts.push({
        positive: positiveMatches?.[i]?.replace(/✨\s*POSITIVE PROMPT:?\s*/i, '').trim() || '',
        negative: negativeMatches?.[i]?.replace(/🚫\s*NEGATIVE PROMPT:?\s*/i, '').trim() || ''
      });
    }
    
    return prompts.length > 0 ? prompts : null;
  };

  const parsedPrompts = parsePrompts();

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      
      {/* AVATAR */}
      <AgentAvatar agent={agent} isTyping={false} />

      {/* CONTENT */}
      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* HEADER */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-bold text-sm">{agent.name}</span>
          {!isUser && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400">{agent.role}</span>}
          <span className="text-xs text-gray-500">{message.timestamp}</span>
        </div>

        {/* MESSAGE CONTENT */}
        {message.type === 'text' && (
          <div className="bg-[#2b2b36] p-4 rounded-lg text-sm text-gray-300 whitespace-pre-wrap">
            {message.content}
          </div>
        )}

        {message.type === 'concept' && (
          <div className="bg-[#2b2b36] border-l-4 border-blue-500 p-5 rounded-lg w-full">
            <div className="flex items-center gap-2 mb-3 text-blue-400 text-xs font-bold uppercase">
              <Sparkles size={14} /> Campaign Concepts
            </div>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{message.content}</pre>
          </div>
        )}

        {message.type === 'evaluation' && (
          <div className="bg-[#2b2b36] border-l-4 border-green-500 p-5 rounded-lg w-full">
            <div className="flex items-center gap-2 mb-3 text-green-400 text-xs font-bold uppercase">
              <ShieldCheck size={14} /> Brand Safety Audit
            </div>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{message.content}</pre>
          </div>
        )}

        {message.type === 'prompts' && parsedPrompts && (
          <div className="space-y-4 w-full">
            {parsedPrompts.map((prompt: any, idx: number) => (
              <div key={idx} className="bg-[#2b2b36] border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-xs font-bold text-purple-400 uppercase mb-3 flex items-center gap-2">
                  <Wand2 size={12} /> Prompt {idx + 1}
                </h4>
                
                {/* POSITIVE */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-green-400">✨ Positive Prompt</span>
                    <button 
                      onClick={() => onCopy(prompt.positive, `pos-${idx}`)}
                      className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-colors"
                    >
                      {copiedText === `pos-${idx}` ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                  <p className="text-xs text-gray-300 bg-green-900/20 p-3 rounded border border-green-500/20">
                    {prompt.positive}
                  </p>
                </div>

                {/* NEGATIVE */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-red-400">🚫 Negative Prompt</span>
                    <button 
                      onClick={() => onCopy(prompt.negative, `neg-${idx}`)}
                      className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors"
                    >
                      {copiedText === `neg-${idx}` ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                  <p className="text-xs text-gray-300 bg-red-900/20 p-3 rounded border border-red-500/20">
                    {prompt.negative}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FALLBACK FOR PROMPTS WITHOUT PARSING */}
        {message.type === 'prompts' && !parsedPrompts && (
          <div className="bg-[#2b2b36] border-l-4 border-purple-500 p-5 rounded-lg w-full">
            <div className="flex items-center gap-2 mb-3 text-purple-400 text-xs font-bold uppercase">
              <Wand2 size={14} /> Image Prompts
            </div>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{message.content}</pre>
          </div>
        )}

      </div>
    </div>
  );
}

// AGENT CARD COMPONENT FOR SIDEBAR
function AgentCard({ agent, status, isTyping }: any) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors mb-2 ${isTyping ? 'bg-white/5' : ''}`}>
      <div className="relative">
        <AgentAvatar agent={agent} isTyping={isTyping} />
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-[#15151a] rounded-full ${isTyping ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
      </div>
      <div>
        <p className="text-sm font-bold text-white">{agent.name}</p>
        <p className="text-xs text-gray-500">{isTyping ? 'Thinking...' : status}</p>
      </div>
    </div>
  );
}
