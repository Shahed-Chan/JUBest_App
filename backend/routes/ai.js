const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI();

router.post('/explain', async (req, res) => {
    try {
        const { phrase, translation } = req.body;
        
        if (!phrase) {
            return res.status(400).json({ error: 'Phrase is required' });
        }

        const prompt = `You are an expert Arabic language teacher. 
        Provide a brief, engaging breakdown of the Arabic phrase: "${phrase}" (English translation: "${translation}").
        Include:
        1. Literal translation vs actual meaning.
        2. Cultural context or when exactly to use it.
        Keep your response clear, structured, and under 4-5 sentences.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({ explanation: response.text });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ error: 'Failed to generate AI explanation.' });
    }
});

module.exports = router;