'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

type AgentName = 'BRIAN' | 'LESTER' | 'ALESSA';
type SenderType = AgentName | 'USER' | 'SYSTEM' | 'PIERRE';

interface GeneratedImage {
  prompt: string;
  image: {
    base64: string;
    mimeType: string;
  };
  index: number;
}

interface Message {
  id: number;
  sender: SenderType;
  text: string;
  timestamp: Date;
  images?: GeneratedImage[];
}

interface AgentConfig {
  name: string;
  avatar: string;
  status: string;
  color: string;
}

interface ProductPhoto {
  base64: string;
  mimeType: string;
  name: string;
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
  const [pipelineMode, setPipelineMode] = useState(false);
  const [productPhotos, setProductPhotos] = useState<ProductPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addMessage = (sender: SenderType, text: string, images?: GeneratedImage[]) => {
    const newMessage: Message = {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date(),
      images,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // COMPRESS IMAGE TO AVOID 4.5MB VERCEL LIMIT
  const compressImage = (file: File): Promise<ProductPhoto> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          let width = img.width;
          let height = img.height;
          const maxWidth = 800;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          const base64Data = compressedBase64.split(',')[1];
          
          console.log(`📸 Compressed ${file.name}: ${file.size} bytes → ${base64Data.length * 0.75} bytes`);
          
          resolve({
            base64: base64Data,
            mimeType: 'image/jpeg',
            name: file.name
          });
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: ProductPhoto[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const compressed = await compressImage(file);
        newPhotos.push(compressed);
        console.log(`✅ Added ${file.name} (compressed)`);
      } catch (error) {
        console.error(`❌ Failed to compress ${file.name}:`, error);
      }
    }
    
    setProductPhotos(prev => [...prev, ...newPhotos]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setProductPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handlePipelineMode = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    addMessage('USER', userMessage);
    setIsLoading(true);

    addMessage('SYSTEM', '⚡ Starting pipeline...');

    try {
      const response = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMessage,
          productPhotos: productPhotos
        }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error('Pipeline error:', data);
        addMessage('SYSTEM', `❌ Error: ${data.error || 'Unknown error'}`);
        return;
      }

      // Brian
      addMessage('BRIAN', data.brian);
      addMessage('SYSTEM', '✅ Concepts generated! Evaluating...');

      // Lester
      addMessage('LESTER', data.lester);
      addMessage('SYSTEM', '✅ Approved! Creating prompts...');

      // Alessa
      addMessage('ALESSA', data.alessa);
      
      // Pierre (NanoBanana) - Images
      if (data.images && data.images.length > 0) {
        addMessage('SYSTEM', `Pierre generated ${data.images.length} images!`);
        addMessage('PIERRE', `Generated ${data.images.length} concept visuals`, data.images);
      } else {
        addMessage('SYSTEM', '⚠️  No images generated - Alessa may not have created NanoBanana prompts');
      }
      
      addMessage('SYSTEM', '✅ Pipeline complete!');

    } catch (error: any) {
      console.error('Pipeline error:', error);
      addMessage('SYSTEM', `❌ Pipeline failed: ${error.message}`);
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
        default:
          throw new Error('Invalid agent');
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

  const downloadImage = (base64: string, mimeType: string, index: number) => {
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${base64}`;
    link.download = `zennya-pierre-${index}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* LEFT SIDEBAR */}
      <div className="w-72 bg-gray-950/50 backdrop-blur-xl border-r border-gray-800/50 flex flex-col">
        <div className="p-4 border-b border-gray-800/50">
          <h1 className="text-xl font-bold">zennya<span className="text-orange-500">.team</span></h1>
          <p className="text-sm text-gray-400">AI Creative Studio</p>
        </div>

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
              {pipelineMode ? '⚡ Pipeline Mode' : '🎯 Manual Mode'}
            </span>
          </button>
          <p className="text-xs text-gray-400 mt-2">
            {pipelineMode 
              ? 'Brian → Lester → Alessa → Pierre' 
              : 'Chat with individual agents'}
          </p>
        </div>

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
        <div className="bg-gray-950/50 backdrop-blur-xl border-b border-gray-800/50 p-4">
          <div className="flex items-center gap-3">
            {pipelineMode ? (
              <>
                <div className="text-2xl">⚡</div>
                <div>
                  <h2 className="font-semibold">Full Pipeline</h2>
                  <p className="text-sm text-gray-400">Auto-generates images with Pierre</p>
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

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              <div className={`flex gap-3 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}>
                {msg.sender !== 'USER' && msg.sender !== 'SYSTEM' && msg.sender !== 'PIERRE' && (
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
                      : msg.sender === 'PIERRE'
                      ? 'bg-yellow-500/20 border border-yellow-500/30'
                      : 'bg-gray-800/50 border border-gray-700/50'
                  }`}
                >
                  {msg.sender !== 'USER' && msg.sender !== 'SYSTEM' && msg.sender !== 'PIERRE' && (
                    <p className="text-xs text-gray-400 mb-2">{AGENTS[msg.sender as AgentName].name}</p>
                  )}
                  {msg.sender === 'PIERRE' && (
                    <p className="text-xs text-yellow-400 mb-2">Pierre (NanoBanana Pro)</p>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              {/* Display images */}
              {msg.images && msg.images.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-13">
                  {msg.images.map((img, idx) => (
                    <div key={idx} className="bg-gray-800/50 border border-yellow-500/30 rounded-lg p-3">
                      <div className="relative w-full aspect-[9/16] mb-2 rounded overflow-hidden bg-gray-900">
                        <img
                          src={`data:${img.image.mimeType};base64,${img.image.base64}`}
                          alt={`Pierre generated ${img.index}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">{img.prompt.substring(0, 100)}...</p>
                      <button
                        onClick={() => downloadImage(img.image.base64, img.image.mimeType, img.index)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black text-xs py-2 px-3 rounded transition-all font-semibold"
                      >
                        Download #{img.index}
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

        {/* Product Photos Preview */}
        {productPhotos.length > 0 && (
          <div className="bg-gray-950/50 border-t border-gray-800/50 px-4 py-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">📸 Photos:</span>
              {productPhotos.map((photo, i) => (
                <div key={i} className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded text-xs border border-gray-700/50">
                  <span className="max-w-[100px] truncate text-gray-300">{photo.name}</span>
                  <button
                    onClick={() => removePhoto(i)}
                    className="text-red-400 hover:text-red-300 ml-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-950/50 backdrop-blur-xl border-t border-gray-800/50 p-4">
          <div className="flex gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 text-white px-4 rounded-lg transition-all self-end text-lg"
              title="Upload product photos"
            >
              📸
            </button>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  pipelineMode ? handlePipelineMode() : handleSendMessage();
                }
              }}
              placeholder={pipelineMode ? "Describe your campaign..." : `Message ${AGENTS[activeAgent].name}...`}
              className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 resize-none"
              disabled={isLoading}
              rows={3}
            />
            <button
              onClick={pipelineMode ? handlePipelineMode : handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 rounded-lg font-semibold transition-all self-end"
            >
              {pipelineMode ? '⚡ Run' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
