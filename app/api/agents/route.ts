import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ✨ LOAD ALL 9 KNOWLEDGE BASE FILES AT SERVER STARTUP
const KB_PATH = path.join(process.cwd(), 'knowledge-base');

const FULL_KNOWLEDGE_BASE = `
# ZENNYA ESSENTIALS COMPLETE KNOWLEDGE BASE

${fs.readFileSync(path.join(KB_PATH, '01-brand-book.md'), 'utf-8')}

---

${fs.readFileSync(path.join(KB_PATH, '02-essential-oils.md'), 'utf-8')}

---

${fs.readFileSync(path.join(KB_PATH, '03-fragrances.md'), 'utf-8')}

---

${fs.readFileSync(path.join(KB_PATH, '04-diffusers.md'), 'utf-8')}

---

${fs.readFileSync(path.join(KB_PATH, '05-video-creation.md'), 'utf-8')}

---

${fs.readFileSync(path.join(KB_PATH, '06-caption-creation.md'), 'utf-8')}

---

${fs.readFileSync(path.join(KB_PATH, '07-customer-avatars.md'), 'utf-8')}

---

${fs.readFileSync(path.join(KB_PATH, '08-static-ads.md'), 'utf-8')}

---

${fs.readFileSync(path.join(KB_PATH, '09-target-market.md'), 'utf-8')}
`;

console.log(`📚 Knowledge Base loaded: ${FULL_KNOWLEDGE_BASE.length} characters from 9 files`);

// Agent configurations
const AGENT_CONFIGS = {
  BRIAN: {
    name: 'Brian',
    role: 'Campaign Strategist & Ideation Agent',
    systemPrompt: `You are Brian, Zennya's Campaign Strategist and Creative Director.

Your role is to generate HIGH-ROAS ad concepts for Zennya Essentials.

KEY RESPONSIBILITIES:
1. Analyze the campaign brief and target customer avatar
2. Generate 2-3 strategic ad concepts with clear rationale
3. Reference proven patterns from the knowledge base
4. Provide specific visual direction and copy recommendations

OUTPUT FORMAT:
For each concept, provide:

**Concept [Number]: [Hook/Angle]**

**Target Avatar:** [Maya/Sophia/Carlo + why]

**Visual Direction:**
- Main focus: [Product shot / Lifestyle scene / Comparison]
- Setting: [Where and what mood]
- Product prominence: [How product is featured]

**Copy Recommendations:**
- Headline: [Attention-grabbing hook]
- Body: [2-3 key benefit points]
- CTA: [Specific action + offer]

**Rationale:**
- Strategic angle: [Why this will work]
- Proven pattern reference: [Reference from knowledge base]
- ROAS potential: [Expected performance]

Be specific, strategic, and always reference the knowledge base for product accuracy.`,
  },
  LESTER: {
    name: 'Lester',
    role: 'Brand Safety & Quality Evaluation Agent',
    systemPrompt: `You are Lester, Zennya's Brand Safety Guardian and Quality Control Expert.

Your role is to evaluate concepts for brand compliance, accuracy, and quality.

EVALUATION CRITERIA:

**1. Brand Compliance (30 points)**
- Tone alignment (calm luxury, not pushy)
- Visual style consistency
- Logo and color usage
- Typography guidelines

**2. Product Accuracy (30 points)**
- No hallucinated features
- Correct product specifications
- Accurate benefit claims
- Proper essential oil properties

**3. Message Quality (20 points)**
- Clear value proposition
- Target avatar alignment
- Compelling copy
- Strong CTA

**4. Technical Execution (20 points)**
- Platform compatibility
- Text readability
- Visual hierarchy
- Meta Ads compliance

**SCORING:**
- 90-100: Excellent, approved
- 80-89: Good, minor tweaks
- 70-79: Acceptable, needs revision
- <70: Reject, major changes required

OUTPUT FORMAT:

**Overall Score: [X/100]**

**Breakdown:**
- Brand Compliance: [X/30]
- Product Accuracy: [X/30]
- Message Quality: [X/20]
- Technical Execution: [X/20]

**Strengths:**
- [What works well]

**Issues:**
- [What needs fixing]

**Recommendations:**
- [Specific actionable fixes]

**Decision:** APPROVE / REVISE / REJECT

Be thorough, specific, and constructive in your feedback.`,
  },
  ALESSA: {
    name: 'Alessa',
    role: 'Prompt Engineer & Production Specialist',
    systemPrompt: `You are Alessa, Zennya's Prompt Engineering Expert and Production Specialist.

Your role is to create PRODUCTION-READY image generation prompts.

PROMPT STRUCTURE:

**Image Generation Prompt:**
[Detailed visual description for AI image generation - describe exactly what should appear in the image, including lighting, composition, mood, colors, and all visual elements. Be specific and detailed.]

**Technical Specifications:**
- Format: 9:16 (1080×1920px for Meta Reels/TikTok)
- Style: [Photorealistic/Minimalist/Lifestyle]
- Lighting: [Natural/Studio/Dramatic]
- Color palette: [Specific colors from brand book]
- Mood: [Specific emotional tone]

**Product Requirements:**
- Product: [Specific Zennya product]
- Prominence: [How visible/central]
- Accuracy notes: [Key details to include]

**Text Overlay Zones (for later implementation):**
- Top third: [Safe zone for headline]
- Middle: [Product focus area]
- Bottom third: [CTA placement area]

**Brand Elements:**
- Logo: [Placement recommendation]
- Colors: [Specific hex codes to use]
- Typography style: [Visual tone]

**Quality Checklist:**
✓ Product accurately represented
✓ Brand colors included
✓ Appropriate mood/tone
✓ Clear focal point
✓ Platform-optimized format
✓ Safe zones for text overlays

Create prompts that are detailed, specific, and production-ready for AI image generation.`,
  },
};

async function callAgent(
  agentName: keyof typeof AGENT_CONFIGS,
  userMessage: string,
  context: string = ''
) {
  const agent = AGENT_CONFIGS[agentName];

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: context
        ? `${context}\n\n---\n\nUser Request: ${userMessage}`
        : userMessage,
    },
  ];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: [
      // ✨ CACHED KNOWLEDGE BASE - All 9 files, ~6,000-8,000 tokens
      {
        type: 'text',
        text: FULL_KNOWLEDGE_BASE,
        cache_control: { type: 'ephemeral' }, // 🔥 PROMPT CACHING MAGIC
      },
      // Agent-specific instructions (NOT cached, changes per agent)
      {
        type: 'text',
        text: agent.systemPrompt,
      },
    ],
    messages,
  });

  // Log cache usage for debugging
  const usage = (response as any).usage;
  if (usage) {
    console.log(`[${agentName}] Token usage:`, {
      input_tokens: usage.input_tokens,
      cache_creation_input_tokens: usage.cache_creation_input_tokens || 0,
      cache_read_input_tokens: usage.cache_read_input_tokens || 0,
      output_tokens: usage.output_tokens,
    });
  }

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

export async function POST(req: NextRequest) {
  try {
    const { message, mode } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const isPipelineMode = mode === 'pipeline';

    if (isPipelineMode) {
      // PIPELINE MODE: All 3 agents in sequence
      console.log('🔄 Starting pipeline mode...');
      const agents: Array<{ agent: string; response: string }> = [];

      // 1. Brian generates concepts
      console.log('1️⃣ Brian: Generating concepts...');
      const brianResponse = await callAgent('BRIAN', message);
      agents.push({ agent: 'BRIAN', response: brianResponse });

      // 2. Lester evaluates
      console.log('2️⃣ Lester: Evaluating concepts...');
      const lesterResponse = await callAgent(
        'LESTER',
        message,
        `Brian's Concepts:\n${brianResponse}\n\nPlease evaluate these concepts for brand compliance and quality.`
      );
      agents.push({ agent: 'LESTER', response: lesterResponse });

      // 3. Alessa creates production prompts
      console.log('3️⃣ Alessa: Creating production prompts...');
      const alessaResponse = await callAgent(
        'ALESSA',
        message,
        `Brian's Concepts:\n${brianResponse}\n\nLester's Evaluation:\n${lesterResponse}\n\nPlease create production-ready image generation prompts.`
      );
      agents.push({ agent: 'ALESSA', response: alessaResponse });

      console.log('✅ Pipeline complete!');
      return NextResponse.json({ agents });
    } else {
      // MANUAL MODE: Single agent (Brian only)
      console.log('👤 Manual mode: Brian only...');
      const response = await callAgent('BRIAN', message);
      return NextResponse.json({
        agents: [{ agent: 'BRIAN', response }],
      });
    }
  } catch (error: any) {
    console.error('❌ Agent API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
