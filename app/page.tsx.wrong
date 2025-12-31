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
          endpoint = '/api/agent2';
          break;
        case 'ALESSA':
          endpoint = '/api/agent3';
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
        <div className="bg-gray-950/50 backdrop-blur-xl border-b border-gray-800/50 p-4 flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-800">
            <Image
              src={AGENTS[activeAgent].avatar}
              alt={AGENTS[activeAgent].name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-bold">{AGENTS[activeAgent].name}</h2>
            <p className="text-sm text-gray-400">{AGENTS[activeAgent].status}</p>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'USER';
            const agent = isUser ? null : AGENTS[msg.sender as AgentName];

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {!isUser && agent && (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-800">
                    <Image
                      src={agent.avatar}
                      alt={agent.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div
                  className={`max-w-2xl p-4 rounded-lg ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50'
                  }`}
                >
                  {!isUser && agent && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{agent.name}</span>
                      <span className="text-xs text-gray-400">{agent.status}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {isUser && (
                  <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    U
                  </div>
                )}
              </div>
            );
          })}

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
              <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-lg">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="border-t border-gray-800/50 p-4 bg-gray-950/30 backdrop-blur-xl">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe your product or campaign idea..."
              className="flex-1 bg-gray-800/50 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700/50"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
