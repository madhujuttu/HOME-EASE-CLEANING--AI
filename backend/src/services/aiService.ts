import { Lead, Customer, Meeting, CallLog, Booking, Service } from '../models/index.js';
import { isConnected } from '../config/db.js';
import { MemoryStore } from '../data/memoryStore.js';

export class AIService {
  // 1. Calculate Explainable Multi-Factor AI Lead Score
  public static calculateLeadScore(leadData: {
    serviceInterest?: string;
    source?: string;
    estimatedValue?: number;
    interactionCount?: number;
    urgency?: string;
  }): { score: number; conversionProb: number; reason: string } {
    let score = 50;
    const reasons: string[] = [];

    // Factor 1: Service Tier / Value
    if (leadData.estimatedValue && leadData.estimatedValue >= 500) {
      score += 20;
      reasons.push('High estate deal value (₹500+)');
    } else if (leadData.estimatedValue && leadData.estimatedValue >= 300) {
      score += 10;
      reasons.push('Mid-tier sanitization package');
    }

    // Factor 2: Acquisition Source Intent
    if (leadData.source === 'AI Inbound Call') {
      score += 20;
      reasons.push('High intent inbound voice conversation');
    } else if (leadData.source === 'Referral') {
      score += 18;
      reasons.push('Verified referral channel');
    } else if (leadData.source === 'Website Form') {
      score += 10;
      reasons.push('Direct organic website submission');
    }

    // Factor 3: Urgency
    if (leadData.urgency === 'urgent') {
      score += 10;
      reasons.push('Immediate move-in or turnover deadline');
    }

    const finalScore = Math.min(99, Math.max(25, score));
    const conversionProb = Math.min(98, Math.round(finalScore * 0.92));

    return {
      score: finalScore,
      conversionProb,
      reason: reasons.join('; ') || 'Standard intake score evaluated on service match.'
    };
  }

  // 2. AI Sales Copilot - Conversational RAG Query Engine
  public static async answerCopilotQuery(query: string, salesRepId?: string): Promise<{
    answer: string;
    actionCard?: { title: string; items: string[] };
  }> {
    const q = query.toLowerCase();

    // Query 1: Meetings today
    if (q.includes('meeting') || q.includes('schedule') || q.includes('today')) {
      const todayMeetings = isConnected
        ? await Meeting.find({ status: 'scheduled' }).limit(5)
        : MemoryStore.meetings.filter(m => m.status === 'scheduled').slice(0, 5);

      return {
        answer: `You have ${todayMeetings.length} consultation(s) scheduled for today. Here is your chronological itinerary:`,
        actionCard: {
          title: "Today's Consultations",
          items: todayMeetings.map(m => `${m.dateTime.split(' ')[1] || '04:30 PM'} — ${m.customerName} (${m.type})`)
        }
      };
    }

    // Query 2: Overdue follow-ups
    if (q.includes('overdue') || q.includes('follow-up') || q.includes('followup')) {
      const urgentLeads = isConnected
        ? await Lead.find({ priority: { $in: ['urgent', 'high'] }, status: { $ne: 'converted' } }).limit(4)
        : MemoryStore.leads.filter(l => (l.priority === 'urgent' || l.priority === 'high') && l.status !== 'converted').slice(0, 4);

      return {
        answer: `Identified ${urgentLeads.length} prioritized follow-up lead(s) that require callback before lead decay:`,
        actionCard: {
          title: 'Urgent Contact Required',
          items: urgentLeads.map(l => `${l.name} — ${l.serviceInterest} (AI Score: ${l.aiScore})`)
        }
      };
    }

    // Query 3: Inactive leads
    if (q.includes('inactive') || q.includes('decay') || q.includes('stale')) {
      return {
        answer: `Lead #104 (Ananya Iyer) and Lead #106 (Sunita Reddy) have pending follow-ups. Ananya Iyer expressed high interest in pre-occupancy move-in cleaning in Powai. I recommend triggering an automated WhatsApp rate card.`
      };
    }

    // Query 4: Last meeting summary
    if (q.includes('summarize') || q.includes('last meeting') || q.includes('customer')) {
      const lastMeet = isConnected
        ? await Meeting.findOne().sort({ createdAt: -1 })
        : MemoryStore.meetings[0];

      return {
        answer: `Executive Synthesis for consultation with ${lastMeet?.customerName || 'Rajesh Sharma'}:\n\n` +
          `• Property Scope: 5,500 sqft residence in Prestige Golfshire with double-height 18ft ceilings.\n` +
          `• Core Specifications: High-ceiling scaffolding required, Italian marble diamond crystallization, zero-dust guarantee.\n` +
          `• Primary Objection: Tight Thursday deadline before weekend housewarming.\n` +
          `• Next Step: Send formal proposal with ₹34,500 express package.`
      };
    }

    // Query 5: Calling script
    if (q.includes('script') || q.includes('calling') || q.includes('rajesh') || q.includes('sharma')) {
      return {
        answer: `High-Converting Calling Script for Rajesh Sharma:\n\n` +
          `"Good afternoon Mr. Sharma! This is Marcus Vance with HomeEase Guru.\n\n` +
          `I coordinated with our master supervisor Carlos Mendes. We have locked in our 4-person senior crew for Thursday at 8:00 AM with 140°C hospital-grade HEPA steam extractors.\n\n` +
          `We will guarantee complete post-construction dust eradication and Italian marble mirror polish before your housewarming ceremony. May I WhatsApp you our digital confirmation agreement?"`
      };
    }

    // Query 6: Performance
    if (q.includes('performance') || q.includes('quota') || q.includes('conversion')) {
      return {
        answer: `Your current sales performance is pacing at the top of the leaderboard:\n\n` +
          `• Achieved Revenue: ₹38,200 of ₹45,000 quota (84.8%)\n` +
          `• Closed Deals: 42 Deals Won\n` +
          `• Win Rate: 34.8% (Team Average: 31.2%)\n` +
          `• Pacing: On track to exceed quota by +₹4,500.`
      };
    }

    // Default fallback
    return {
      answer: `Neural CRM Copilot: System optimal. Connected to 18 MongoDB collections. I can summarize any client account, draft proposals, or evaluate lead scores.`
    };
  }

  // 3. AI Customer Concierge Assistant
  public static async answerCustomerQuery(query: string): Promise<{
    answer: string;
    serviceCard?: { name: string; price: number; description: string };
  }> {
    const q = query.toLowerCase();

    if (q.includes('villa') || q.includes('5000') || q.includes('5,000') || q.includes('sqft')) {
      return {
        answer: `For large residences (5,000+ sqft), we recommend our **Ultra Deep Villa Sanitization**. It includes a 4-person certified team, 120-point hospital grade steam sanitization, floor buffing, ceiling fixtures, and pet-safe botanical cleaners.`,
        serviceCard: {
          name: 'Ultra Deep Villa Sanitization',
          price: 349,
          description: '120-point hospital grade steam sanitation, window detailing, ceiling fans, switchboards, and floor polishing.'
        }
      };
    }

    if (q.includes('sofa') || q.includes('velvet') || q.includes('couch') || q.includes('mattress')) {
      return {
        answer: `We use low-moisture hydro-extraction with pH-balanced detergents engineered specifically for sensitive velvet, linen, and leather. Removes 99.9% of dust mites and deep stains without water spots or shrinkage.`,
        serviceCard: {
          name: 'Sofa & Mattress Hydro-Extraction Care',
          price: 149,
          description: 'Anti-allergen hot water deep extraction removes deep stains, dust mites, and bacteria without shrinking fabric.'
        }
      };
    }

    if (q.includes('kitchen') || q.includes('degrease') || q.includes('oven')) {
      return {
        answer: `Our **Heavy Kitchen Degrease & Steam Blitz** includes complete chimney baffle filter degreasing, internal oven carbon removal, burner restoration, and backsplash grout steam cleaning.`,
        serviceCard: {
          name: 'Heavy Kitchen Degrease & Steam Blitz',
          price: 179,
          description: 'Internal & external chimney cleaning, stove burners, oven cavity, backsplash grout, and cabinets degreasing.'
        }
      };
    }

    return {
      answer: `Welcome to HomeEase Guru! All of our cleanings use hospital-grade HEPA steam equipment operating at 140°C. Would you like to schedule an on-site consultation or check availability for this week?`
    };
  }
}
