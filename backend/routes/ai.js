const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/explain', async (req, res) => {
    try {
        const { phrase, translation } = req.body;
        console.log("RECEIVED BODY:", req.body);
        
        if (!phrase) {

            return res.status(400).json({ error: 'Phrase is required' });
        }

        const prompt = `You are an expert Arabic language teacher. 
        Provide a brief, engaging breakdown of the Arabic phrase: "${phrase}" (English translation: "${translation}").
        Include:
        1. Literal translation vs actual meaning.
        2. Cultural context or when exactly to use it.
        Keep your response clear, structured, and under 4-5 sentences. 
        Use basic HTML tags like <b></b> for bold and <br> for new lines so it renders nicely in a web interface.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
        });

        // Ensure we handle the text extraction securely
        const textResponse = response.text || "No explanation generated.";

        res.json({ explanation: textResponse });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ error: 'Failed to generate AI explanation.' });
    }
});

module.exports = router;