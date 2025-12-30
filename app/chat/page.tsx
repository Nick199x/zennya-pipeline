'use client';

import { useState } from 'react';
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
  const [activeAgent, setActiveAgent] = useState<AgentName>('BRIAN');
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (sender: SenderType, text: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      sender,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    addMessage('USER', userMessage);
    setIsLoading(true);

    try {
      let endpoint = '';
      switch (activeAgent) {
        case 'BRIAN':
          endpoint = '/api/agent1';
          break;
        case 'LESTER':
          endpoint = '/api/agent3';  // FIXED: Lester uses agent3 (Brand Safety)
          break;
        case 'ALESSA':
          endpoint = '/api/agent2';  // FIXED: Alessa uses agent2 (Prompt Engineer)
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      });

      if (!response.ok) throw new Error('Agent response failed');

      const agentData = await response.json();
      addMessage(activeAgent, agentData.result);
    } catch (error) {
      console.error('Error:', error);
      addMessage(activeAgent, 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* LEFT SIDEBAR */}
      <div className="w-72 bg-gray-950/50 backdrop-blur-xl border-r border-gray-800/50 flex flex-col">
        <div className="p-4 border-b border-gray-800/50">
          <h1 className="text-xl font-bold">zennya<span className="text-orange-500">.team</span></h1>
          <p className="text-sm text-gray-400">Zennya Studio</p>
        </div>

        <div className="space-y-4 p-4">
          {(['BRIAN', 'LESTER', 'ALESSA'] as AgentName[]).map((key) => {
            const agent = AGENTS[key];
            return (
              <button
                key={key}
                onClick={() => setActiveAgent(key)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  activeAgent === key
                    ? 'bg-gray-800/50 border border-gray-700/50'
                    : 'hover:bg-gray-800/30'
                }`}
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-800">
                  <Image
                    src={agent.avatar}
                    alt={agent.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">{agent.name}</h3>
                  <p className="text-sm text-gray-400">{agent.status}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <div className="bg-gray-950/50 backdrop-blur-xl border-b border-gray-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-800">
              <Image
                src={AGENTS[activeAgent].avatar}
                alt={AGENTS[activeAgent].name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-semibold">{AGENTS[activeAgent].name}</h2>
              <p className="text-sm text-gray-400">{AGENTS[activeAgent].status}</p>
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}
            >
              {msg.sender !== 'USER' && (
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-800">
                  <Image
                    src={AGENTS[msg.sender as AgentName].avatar}
                    alt={AGENTS[msg.sender as AgentName].name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div
                className={`max-w-2xl rounded-lg p-4 ${
                  msg.sender === 'USER'
                    ? 'bg-orange-500/20 border border-orange-500/30'
                    : 'bg-gray-800/50 border border-gray-700/50'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-800">
                <Image
                  src={AGENTS[activeAgent].avatar}
                  alt={AGENTS[activeAgent].name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                <p className="text-gray-400">Thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="bg-gray-950/50 backdrop-blur-xl border-t border-gray-800/50 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Message ${AGENTS[activeAgent].name}...`}
              className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
