'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6">
            zennya<span className="text-orange-500">.team</span>
          </h1>
          <p className="text-2xl text-gray-300 mb-4">Zennya Studio</p>
          
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            From Brief to Ready-to-Launch Ads in 60 Seconds
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Three AI specialists working in perfect sync. Brian generates high-ROAS concepts, Lester 
            ensures brand compliance, and Alessa creates production-ready prompts. Just describe your 
            campaign—they handle the rest.
          </p>

          <Link 
            href="/chat"
            className="inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
          >
            <span>⚡</span>
            Enter Zennya Studio
            <span>→</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-500 mb-2">3</div>
            <div className="text-gray-400">AI Specialists</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-500 mb-2">&lt;60s</div>
            <div className="text-gray-400">Avg. Generation Time</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-500 mb-2">100%</div>
            <div className="text-gray-400">Brand Compliant</div>
          </div>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          {/* Brian */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 mx-auto">
              B
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Brian</h3>
            <p className="text-sm text-blue-400 text-center mb-4">Campaign Strategist</p>
            <p className="text-gray-300 text-center text-sm">
              Generates high-ROAS ad concepts based on proven patterns and your brand voice.
            </p>
          </div>

          {/* Lester */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-green-500/50 transition-all">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 mx-auto">
              L
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Lester</h3>
            <p className="text-sm text-green-400 text-center mb-4">Brand Safety</p>
            <p className="text-gray-300 text-center text-sm">
              Ensures every concept aligns with your brand guidelines and compliance standards.
            </p>
          </div>

          {/* Alessa */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 mx-auto">
              A
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Alessa</h3>
            <p className="text-sm text-purple-400 text-center mb-4">Prompt Engineer</p>
            <p className="text-gray-300 text-center text-sm">
              Creates production-ready prompts for image and video generation platforms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
