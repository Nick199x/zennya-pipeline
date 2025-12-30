'use client';

import Link from 'next/link';
import Image from 'next/image';

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

        {/* How It Works */}
        <div className="mt-32 max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Describe</h3>
              <p className="text-gray-400 text-sm">
                Tell us about your product or campaign idea
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Brian Ideates</h3>
              <p className="text-gray-400 text-sm">
                Generates high-ROAS concepts based on proven patterns
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Lester Reviews</h3>
              <p className="text-gray-400 text-sm">
                Ensures brand compliance and quality standards
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                4
              </div>
              <h3 className="text-xl font-bold mb-2">Alessa Creates</h3>
              <p className="text-gray-400 text-sm">
                Produces ready-to-use prompts for image/video generation
              </p>
            </div>
          </div>
        </div>

        {/* Agent Cards with Circular Avatars */}
        <div className="mt-32 max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Meet Your AI Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brian */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all">
              <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-500 flex-shrink-0">
                <Image
                  src="/images/team/brian-avatar.jpg"
                  alt="Brian"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Brian</h3>
              <p className="text-sm text-blue-400 text-center mb-4">Campaign Strategist</p>
              <p className="text-gray-300 text-center text-sm">
                Generates high-ROAS ad concepts based on proven patterns and your brand voice. 
                Expert in Meta Ads, TikTok, and conversion-focused creative strategy.
              </p>
            </div>

            {/* Lester */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-green-500/50 transition-all">
              <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-green-500 flex-shrink-0">
                <Image
                  src="/images/team/lester-avatar.jpg"
                  alt="Lester"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Lester</h3>
              <p className="text-sm text-green-400 text-center mb-4">Brand Safety</p>
              <p className="text-gray-300 text-center text-sm">
                Ensures every concept aligns with your brand guidelines and compliance standards. 
                Catches potential issues before they become problems.
              </p>
            </div>

            {/* Alessa */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all">
              <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-purple-500 flex-shrink-0">
                <Image
                  src="/images/team/alessa-avatar.jpg"
                  alt="Alessa"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Alessa</h3>
              <p className="text-sm text-purple-400 text-center mb-4">Prompt Engineer</p>
              <p className="text-gray-300 text-center text-sm">
                Creates production-ready prompts for image and video generation platforms. 
                Optimized for Midjourney, DALL-E, and video AI tools.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Ad Creation?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of marketers who've accelerated their creative workflow with AI.
          </p>
          <Link 
            href="/chat"
            className="inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
          >
            <span>⚡</span>
            Start Creating Now
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
