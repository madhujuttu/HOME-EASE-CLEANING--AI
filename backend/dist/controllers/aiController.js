import { AIService } from '../services/aiService.js';
import { AIInsight } from '../models/index.js';
import { isConnected } from '../config/db.js';
import { MemoryStore } from '../data/memoryStore.js';
export const handleCopilotQuery = async (req, res, next) => {
    try {
        const { query } = req.body;
        if (!query) {
            res.status(400).json({ success: false, message: 'Query string is required.' });
            return;
        }
        const result = await AIService.answerCopilotQuery(query);
        res.status(200).json({
            success: true,
            answer: result.answer,
            actionCard: result.actionCard
        });
    }
    catch (err) {
        next(err);
    }
};
export const handleCustomerAssistant = async (req, res, next) => {
    try {
        const { query } = req.body;
        if (!query) {
            res.status(400).json({ success: false, message: 'Query string is required.' });
            return;
        }
        const result = await AIService.answerCustomerQuery(query);
        res.status(200).json({
            success: true,
            answer: result.answer,
            serviceCard: result.serviceCard
        });
    }
    catch (err) {
        next(err);
    }
};
export const scoreLead = async (req, res, next) => {
    try {
        const evaluation = AIService.calculateLeadScore(req.body);
        res.status(200).json({ success: true, evaluation });
    }
    catch (err) {
        next(err);
    }
};
export const getAIInsights = async (req, res, next) => {
    try {
        if (!isConnected) {
            res.status(200).json({ success: true, count: MemoryStore.aiInsights.length, insights: MemoryStore.aiInsights });
            return;
        }
        const insights = await AIInsight.find().sort({ confidenceScore: -1 });
        res.status(200).json({ success: true, count: insights.length, insights });
    }
    catch (err) {
        next(err);
    }
};
