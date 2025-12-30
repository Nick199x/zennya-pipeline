'use client';

import { useState } from 'react';
import Image from 'next/image';

type AgentName = 'BRIAN' | 'LESTER' | 'ALESSA';
type SenderType = AgentName | 'USER' | 'SYSTEM';

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
      text: "Hey! I'm Brian, your Campaign Strategist. Ready to create some killer ad concepts? 💡\n\n💡 TIP: Use 'Pipeline Mode' to run all 3 agents automatically!",
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [activeAgent, setActiveAgent] = useState<AgentName>('BRIAN');
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineMode, setPipelineMode] = useState(false);

  const addMessage = (sender: SenderType, text: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      sender,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handlePipelineMode = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    addMessage('USER', userMessage);
    setIsLoading(true);

    try {
      const response = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.agent === 'SYSTEM' && data.message === 'COMPLETE') {
              setIsLoading(false);
              break;
            }

            if (data.message.startsWith('🔍')) {
              // Status update - show as system message
              addMessage('SYSTEM', data.message);
            } else {
              // Agent response
              addMessage(data.agent as AgentName, data.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage('SYSTEM', '❌ Pipeline failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          endpoint = '/api/agent3';
          break;
        case 'ALESSA':
          endpoint = '/api/agent2';
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

        {/* Pipeline Mode Toggle */}
        <div className="p-4 border-b border-gray-800/50">
          <button
            onClick={() => setPipelineMode(!pipelineMode)}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
              pipelineMode
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800'
            }`}
          >
            <span className="font-semibold">
              {pipelineMode ? '⚡ Pipeline Mode ON' : '🎯 Manual Mode'}
            </span>
          </button>
          <p className="text-xs text-gray-400 mt-2">
            {pipelineMode 
              ? 'All 3 agents run automatically' 
              : 'Select agent manually'}
          </p>
        </div>

        {/* Agent Selection (only in manual mode) */}
        {!pipelineMode && (
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
        )}
      </div>

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <div className="bg-gray-950/50 backdrop-blur-xl border-b border-gray-800/50 p-4">
          <div className="flex items-center gap-3">
            {pipelineMode ? (
              <>
                <div className="text-2xl">⚡</div>
                <div>
                  <h2 className="font-semibold">Pipeline Mode</h2>
                  <p className="text-sm text-gray-400">All agents run automatically</p>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}
            >
              {msg.sender !== 'USER' && msg.sender !== 'SYSTEM' && (
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
                    : msg.sender === 'SYSTEM'
                    ? 'bg-gray-700/30 border border-gray-600/30 text-gray-300 text-sm'
                    : 'bg-gray-800/50 border border-gray-700/50'
                }`}
              >
                {msg.sender !== 'USER' && msg.sender !== 'SYSTEM' && (
                  <p className="text-xs text-gray-400 mb-2">{AGENTS[msg.sender as AgentName].name}</p>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                <p className="text-gray-400">
                  {pipelineMode ? '⚡ Running pipeline...' : 'Thinking...'}
                </p>
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
              onKeyPress={(e) => e.key === 'Enter' && (pipelineMode ? handlePipelineMode() : handleSendMessage())}
              placeholder={pipelineMode ? "Describe your campaign..." : `Message ${AGENTS[activeAgent].name}...`}
              className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
              disabled={isLoading}
            />
            <button
              onClick={pipelineMode ? handlePipelineMode : handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              {pipelineMode ? '⚡ Run Pipeline' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
