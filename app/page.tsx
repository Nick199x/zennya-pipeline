'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, Wand2, ArrowRight, Zap } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();

  const agents = [
    {
      name: 'Brian',
      role: 'Campaign Strategist',
      emoji: '👨‍🎨',
      color: 'from-blue-600 to-blue-400',
      icon: Sparkles,
      avatar: '/images/team/brian-avatar.jpg',
      description: '8+ years Meta advertising experience. Generates high-ROAS campaign concepts based on proven patterns and customer psychology.',
      expertise: ['Campaign Strategy', 'Customer Psychology', 'Performance Marketing']
    },
    {
      name: 'Lester',
      role: 'Brand Guardian',
      emoji: '🕵️‍♂️',
      color: 'from-green-600 to-green-400',
      icon: ShieldCheck,
      avatar: '/images/team/lester-avatar.jpg',
      description: '10+ years compliance & QA experience. Evaluates every concept against Zennya brand guidelines and advertising best practices.',
      expertise: ['Brand Compliance', 'Quality Assurance', 'Risk Management']
    },
    {
      name: 'Alessa',
      role: 'Asset Production Specialist',
      emoji: '👩‍💻',
      color: 'from-purple-600 to-purple-400',
      icon: Wand2,
      avatar: '/images/team/alessa-avatar.jpg',
      description: '5+ years prompt engineering expertise. Translates approved concepts into production-ready image generation prompts.',
      expertise: ['Prompt Engineering', 'Visual Design', 'Asset Production']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e24] via-[#252530] to-[#1e1e24] text-white font-sans">
      
      {/* HERO SECTION */}
      <div className="relative overflow-hidden">
        
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          
          {/* Logo */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              zennya<span className="text-[#fd8c68]">.team</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400">AI Creative War Room</p>
          </div>

          {/* Tagline */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              From Brief to Ready-to-Launch Ads in 60 Seconds
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              Three AI specialists working in perfect sync. Brian generates high-ROAS concepts, Lester ensures brand compliance, 
              and Alessa creates production-ready prompts. Just describe your campaign—they handle the rest.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mb-20">
            <button
              onClick={() => router.push('/chat')}
              className="group px-8 py-4 bg-gradient-to-r from-[#fd8c68] to-[#ff6b4a] hover:from-[#ff6b4a] hover:to-[#fd8c68] text-white text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
            >
              <Zap size={24} className="group-hover:animate-pulse" />
              Enter War Room
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#fd8c68] mb-2">3</div>
              <div className="text-gray-400">AI Specialists</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#fd8c68] mb-2">&lt;60s</div>
              <div className="text-gray-400">Avg. Generation Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#fd8c68] mb-2">100%</div>
              <div className="text-gray-400">Brand Compliant</div>
            </div>
          </div>

        </div>
      </div>

      {/* MEET THE TEAM SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Meet Your Creative Team</h2>
          <p className="text-gray-400 text-lg">Three specialists, one mission: Create ads that convert</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {agents.map((agent, idx) => (
            <div 
              key={idx}
              className="group relative bg-[#2b2b36] rounded-2xl p-8 border border-white/5 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl"
            >
              
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="relative">
                
                {/* Avatar */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} rounded-full filter blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-white/30 transition-all">
                      <Image 
                        src={agent.avatar}
                        alt={agent.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Name & Role */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl">{agent.emoji}</span>
                    {React.createElement(agent.icon, { 
                      size: 20, 
                      className: `text-${agent.color.split('-')[1]}-400` 
                    })}
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{agent.name}</h3>
                  <p className="text-sm text-gray-400 font-semibold">{agent.role}</p>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  {agent.description}
                </p>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2">
                  {agent.expertise.map((skill, skillIdx) => (
                    <span 
                      key={skillIdx}
                      className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400 border border-white/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">Four simple steps to production-ready ads</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
              1
            </div>
            <h3 className="text-lg font-bold mb-2">Brief the Team</h3>
            <p className="text-sm text-gray-400">
              "Christmas sale for Eclipse targeting tired moms"
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
              2
            </div>
            <h3 className="text-lg font-bold mb-2">Brian Generates</h3>
            <p className="text-sm text-gray-400">
              Creates 3 campaign concepts with proven patterns
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-400 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
              3
            </div>
            <h3 className="text-lg font-bold mb-2">Lester Evaluates</h3>
            <p className="text-sm text-gray-400">
              Validates brand compliance & ad quality
            </p>
          </div>

          {/* Step 4 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-400 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
              4
            </div>
            <h3 className="text-lg font-bold mb-2">Alessa Produces</h3>
            <p className="text-sm text-gray-400">
              Generates ready-to-use image prompts
            </p>
          </div>

        </div>

      </div>

      {/* FINAL CTA */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-[#fd8c68]/10 to-purple-600/10 border border-[#fd8c68]/20 rounded-3xl p-12">
          <h2 className="text-4xl font-bold mb-6">Ready to Create?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Your AI creative team is standing by. Describe your campaign and watch them work their magic.
          </p>
          <button
            onClick={() => router.push('/chat')}
            className="group px-10 py-5 bg-gradient-to-r from-[#fd8c68] to-[#ff6b4a] hover:from-[#ff6b4a] hover:to-[#fd8c68] text-white text-xl font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
          >
            <Zap size={28} className="group-hover:animate-pulse" />
            Launch War Room
            <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>zennya.team • Powered by Claude Sonnet 4 • v10.1</p>
        </div>
      </div>

    </div>
  );
}
