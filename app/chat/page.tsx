'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Download } from 'lucide-react';

interface Message {
  role: 'user' | 'brian' | 'lester' | 'alessa' | 'pierre' | 'system';
  content: string;
  images?: Array<{ base64: string; mimeType: string; prompt: string; index: number }>;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [productPhotos, setProductPhotos] = useState<Array<{ base64: string; mimeType: string; name: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // COMPRESS IMAGE TO AVOID 4.5MB VERCEL LIMIT
  const compressImage = (file: File): Promise<{ base64: string; mimeType: string; name: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Calculate new dimensions (max 800px width, maintain aspect ratio)
          let width = img.width;
          let height = img.height;
          const maxWidth = 800;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with quality compression (0.7 = 70% quality)
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

    const newPhotos = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Compress before adding
        const compressed = await compressImage(file);
        newPhotos.push(compressed);
        console.log(`✅ Added ${file.name} (compressed)`);
      } catch (error) {
        console.error(`❌ Failed to compress ${file.name}:`, error);
      }
    }
    
    setProductPhotos(prev => [...prev, ...newPhotos]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setProductPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

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

      if (data.success) {
        setMessages(prev => [
          ...prev,
          { role: 'brian', content: data.brian },
          { role: 'lester', content: data.lester },
          { role: 'alessa', content: data.alessa },
        ]);

        if (data.images && data.images.length > 0) {
          setMessages(prev => [
            ...prev,
            { role: 'pierre', content: `Generated ${data.images.length} images using your product photos!`, images: data.images }
          ]);
        }

        setMessages(prev => [...prev, { role: 'system', content: '✅ Pipeline complete!' }]);
      } else {
        setMessages(prev => [...prev, { role: 'system', content: `❌ Error: ${data.error}` }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'system', content: `❌ Error: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (base64: string, mimeType: string, index: number) => {
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${base64}`;
    link.download = `pierre-image-${index}.${mimeType.split('/')[1]}`;
    link.click();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Zennya Pipeline</h2>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">🧠</div>
            <span>Brian (Ideation)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">🛡️</div>
            <span>Lester (Safety)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">✨</div>
            <span>Alessa (Prompts)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">🍌</div>
            <span>Pierre (Images)</span>
          </div>
        </div>

        {/* Product Photos Section */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-2">Product Photos</h3>
          <p className="text-xs text-gray-500 mb-3">Upload Eclipse/Halo photos so Pierre doesn't hallucinate</p>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            📸 Upload Photos
          </button>
          
          {/* Display uploaded photos */}
          <div className="mt-3 space-y-2">
            {productPhotos.map((photo, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                <span className="truncate">{photo.name}</span>
                <button
                  onClick={() => removePhoto(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          {productPhotos.length > 0 && (
            <p className="text-xs text-green-600 mt-2">
              ✅ {productPhotos.length} photo{productPhotos.length > 1 ? 's' : ''} ready (compressed)
            </p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : message.role === 'brian'
                    ? 'bg-purple-50 border border-purple-200'
                    : message.role === 'lester'
                    ? 'bg-blue-50 border border-blue-200'
                    : message.role === 'alessa'
                    ? 'bg-green-50 border border-green-200'
                    : message.role === 'pierre'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-gray-100'
                }`}
              >
                <div className="text-sm font-semibold mb-2">
                  {message.role === 'user' ? 'You' : 
                   message.role === 'brian' ? '🧠 Brian' :
                   message.role === 'lester' ? '🛡️ Lester' :
                   message.role === 'alessa' ? '✨ Alessa' :
                   message.role === 'pierre' ? '🍌 Pierre' :
                   'System'}
                </div>
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                
                {/* Display images */}
                {message.images && message.images.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {message.images.map((img, idx) => (
                      <div key={idx} className="border rounded-lg overflow-hidden bg-white">
                        <img
                          src={`data:${img.mimeType};base64,${img.base64}`}
                          alt={`Generated ${idx + 1}`}
                          className="w-full"
                        />
                        <div className="p-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500">Image {img.index}</span>
                          <button
                            onClick={() => downloadImage(img.base64, img.mimeType, img.index)}
                            className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                          >
                            <Download size={14} />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm">Pipeline running...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your campaign..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
