import { Request, Response, NextFunction } from 'express';
import { CallLog, CallConsent } from '../models/index.js';
import { isConnected } from '../config/db.js';
import { MemoryStore } from '../data/memoryStore.js';

export const getCallLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, status } = req.query;

    if (!isConnected) {
      let filtered = [...MemoryStore.calls];
      if (type && type !== 'all') filtered = filtered.filter(c => c.type === type);
      if (status && status !== 'all') filtered = filtered.filter(c => c.status === status);
      res.status(200).json({ success: true, count: filtered.length, callLogs: filtered });
      return;
    }

    const filter: any = {};
    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;

    const callLogs = await CallLog.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: callLogs.length, callLogs });
  } catch (err) {
    next(err);
  }
};

export const createCallLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerName, phone, type, durationSeconds, transcript, summary, extractedRequirements, recommendedAction } = req.body;
    const callRef = `call-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!isConnected) {
      const newCall = {
        id: callRef,
        type: type || 'outbound',
        customerName: customerName || 'Valued Customer',
        phone: phone || '+1 (555) 000-0000',
        durationSeconds: durationSeconds || 120,
        status: 'completed' as const,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        agentType: 'ai_voice' as const,
        agentName: 'Aria (AI Voice Assistant v4.2)',
        sentiment: 'positive' as const,
        consentGiven: true,
        transcript: transcript || [],
        summary: summary || 'Automated consultation session completed with caller.',
        extractedRequirements: extractedRequirements || ['Post-construction cleaning'],
        recommendedAction: recommendedAction || 'Send proposal link via SMS'
      };
      MemoryStore.calls.unshift(newCall);
      res.status(201).json({ success: true, message: 'Call log stored & analyzed.', callLog: newCall });
      return;
    }

    const callLog = await CallLog.create({
      callRef,
      type: type || 'outbound',
      customerName: customerName || 'Valued Customer',
      phone: phone || '+1 (555) 000-0000',
      durationSeconds: durationSeconds || 120,
      status: 'completed',
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      agentType: 'ai_voice',
      agentName: 'Aria (AI Voice Assistant v4.2)',
      sentiment: 'positive',
      consentGiven: true,
      transcript: transcript || [],
      summary: summary || 'Automated consultation session completed with caller.',
      extractedRequirements: extractedRequirements || ['Post-construction cleaning'],
      recommendedAction: recommendedAction || 'Send proposal link via SMS'
    });

    // Record TCPA consent
    await CallConsent.create({
      phoneNumber: phone || '+1 (555) 000-0000',
      customerName: customerName || 'Valued Customer',
      consentType: 'recording',
      consentGranted: true,
      source: 'AI Voice Automated Consent Dialogue'
    });

    res.status(201).json({ success: true, message: 'Call log stored & analyzed.', callLog });
  } catch (err) {
    next(err);
  }
};
