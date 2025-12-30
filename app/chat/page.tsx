'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

type AgentName = 'BRIAN' | 'LESTER' | 'ALESSA';
type SenderType = AgentName | 'USER';

interface Message {
  id: number;
  sender: SenderType;
  text: string;
  timestamp: Date;
}

interface AgentConfig {
  name: string;
  avatar: string;
  status: string;
  color: string;
}

const AGENTS: Record<AgentName, AgentConfig> = {
  BRIAN: {
    name: 'Brian',
    avatar: '/images/team/brian-avatar.jpg',
    status: 'Campaign Strategist',
    color: 'bg-blue-600',
  },
  LESTER: {
    name: 'Lester',
    avatar: '/images/team/lester-avatar.jpg',
    status: 'Brand Safety',
    color: 'bg-green-600',
  },
  ALESSA: {
    name: 'Alessa',
    avatar: '/images/team/alessa-avatar.jpg',
    status: 'Prompt Engineer',
    color: 'bg-purple-600',
  },
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'BRIAN',
      text: "Hey! I'm Brian, your Campaign Strategist. Ready to create some killer ad concepts? 💡",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentName | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (sender: SenderType, text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender,
        text,
        timestamp: new Date(),
      },
    ]);
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText;
    addMessage('USER', userMessage);
    setInputText('');
    setIsGenerating(true);

    try {
      setActiveAgent('BRIAN');
      await new Promise((r) => setTimeout(r, 1000));

      const agent1Response = await fetch('/api/agent1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignType: 'Double Digit Sale',
          avatar: 'Busy Urban Professionals',
          product: userMessage,
        }),
      });

      const agent1Data = await agent1Response.json();
      addMessage('BRIAN', agent1Data.result);

      setActiveAgent('LESTER');
      await new Promise((r) => setTimeout(r, 1500));

      const agent3Response = await fetch('/api/agent3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concepts: agent1Data.result }),
      });

      const agent3Data = await agent3Response.json();
      addMessage('LESTER', agent3Data.result);

      setActiveAgent('ALESSA');
      await new Promise((r) => setTimeout(r, 1500));

      const agent2Response = await fetch('/api/agent2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: agent1Data.result }),
      });

      const agent2Data = await agent2Response.json();
      addMessage('ALESSA', agent2Data.result);
    } catch (error) {
      addMessage('BRIAN', '❌ Something went wrong. Please try again!');
    } finally {
      setIsGenerating(false);
      setActiveAgent(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const parsePrompts = (text: string) => {
    const positiveMatch = text.match(/✨\s*POSITIVE PROMPT[:\s]*([\s\S]*?)(?=🚫|$)/i);
    const negativeMatch = text.match(/🚫\s*NEGATIVE PROMPT[:\s]*([\s\S]*?)$/i);

    return {
      positive: positiveMatch ? positiveMatch[1].trim() : null,
      negative: negativeMatch ? negativeMatch[1].trim() : null,
    };
  };

  return (
    <div className="flex h-screen bg-[#1e1e24] text-white">
      <div className="w-80 bg-[#15151a] border-r border-gray-800 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            zennya<span className="text-[#fd8c68]">.team</span>
          </h1>
          <p className="text-sm text-gray-400">AI Ad Generation War Room</p>
        </div>

        <div className="space-y-4">
          {(['BRIAN', 'LESTER', 'ALESSA'] as AgentName[]).map((key) => {
            const agent = AGENTS[key];
            const isActive = activeAgent === key;

            return (
              <div
                key={key}
                className={`p-4 rounded-lg border transition-all ${
                  isActive ? 'border-[#fd8c68] bg-[#fd8c68]/10' : 'border-gray-800 bg-[#1e1e24]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={agent.avatar}
                      alt={agent.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    {isActive && (
                      <div className="absolute -top-1 -right-1">
                        <div className="relative">
                          <div className="w-4 h-4 bg-[#fd8c68] rounded-full animate-ping absolute"></div>
                          <div className="w-4 h-4 bg-[#fd8c68] rounded-full relative"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-xs text-gray-400">{agent.status}</p>
                    {isActive && <p className="text-xs text-[#fd8c68] mt-1">Typing...</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => {
            const isUser = message.sender === 'USER';
            const agentInfo = isUser ? null : AGENTS[message.sender as AgentName];
            const { positive, negative } = message.sender === 'ALESSA' ? parsePrompts(message.text) : { positive: null, negative: null };

            return (
              <div key={message.id} className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && agentInfo && (
                  <Image
                    src={agentInfo.avatar}
                    alt={agentInfo.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}

                <div className={`max-w-2xl ${isUser ? 'bg-gray-700' : 'bg-[#252530]'} rounded-lg p-4 border-l-4 ${
                  agentInfo ? 'border-blue-600' : 'border-gray-600'
                }`}>
                  {!isUser && agentInfo && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{agentInfo.name}</span>
                      <span className="text-xs text-gray-400">{agentInfo.status}</span>
                    </div>
                  )}

                  <div className="text-sm text-gray-200 whitespace-pre-wrap">{message.text}</div>

                  {positive && (
                    <div className="mt-4 space-y-3">
                      <div className="bg-green-900/20 border border-green-700 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-green-400">✨ POSITIVE PROMPT</span>
                          <button
                            onClick={() => copyToClipboard(positive)}
                            className="text-xs text-green-400 hover:text-green-300"
                          >
                            Copy
                          </button>
                        </div>
                        <p className="text-xs text-gray-300">{positive}</p>
                      </div>

                      {negative && (
                        <div className="bg-red-900/20 border border-red-700 rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-red-400">🚫 NEGATIVE PROMPT</span>
                            <button
                              onClick={() => copyToClipboard(negative)}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="text-xs text-gray-300">{negative}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {isUser && (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-semibold">
                    U
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-800 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="Describe your product or campaign idea..."
              disabled={isGenerating}
              className="flex-1 bg-[#252530] border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#fd8c68] disabled:opacity-50"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !inputText.trim()}
              className="bg-[#fd8c68] hover:bg-[#fd8c68]/90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold text-sm transition-all"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
